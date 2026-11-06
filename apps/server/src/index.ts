import { devToolsMiddleware } from "@ai-sdk/devtools";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { cors } from "@elysiajs/cors";
import { appRouter } from "@myrehat-task-b/api/routers/index";
import { buildWahaReply, parseWahaWebhook } from "@myrehat-task-b/api/waha";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
  wrapLanguageModel,
} from "ai";
import { Elysia } from "elysia";

import { createContext } from "./context";
import { ENV } from "./env.server";
import { auth } from "./services";

// No `onError` interceptor here: it rethrows after logging, and Bun treats that
// rejection as fatal (the process died on the first 401 from a protected
// procedure). oRPC already turns thrown ORPCErrors into JSON responses.
const rpcHandler = new RPCHandler(appRouter);
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
});

const openrouter = createOpenRouter({
  apiKey: ENV.OPENROUTER_API_KEY,
});

new Elysia()
  .use(
    cors({
      origin: ENV.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .all(
    "/rpc*",
    async (context) => {
      const { response } = await rpcHandler.handle(context.request, {
        prefix: "/rpc",
        context: await createContext({ context }),
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .all(
    "/api-reference*",
    async (context) => {
      const { response } = await apiHandler.handle(context.request, {
        prefix: "/api-reference",
        context: await createContext({ context }),
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .post("/ai", async (context) => {
    const body = (await context.request.json()) as { messages?: UIMessage[] };
    const uiMessages = body.messages || [];
    const model = wrapLanguageModel({
      model: openrouter(ENV.OPENROUTER_MODEL),
      middleware: devToolsMiddleware(),
    });
    const result = streamText({
      model,
      messages: await convertToModelMessages(uiMessages),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  })
  .post("/api/webhooks/waha", async (context) => {
    let body: unknown;
    try {
      body = await context.request.json();
    } catch {
      context.set.status = 400;
      return { error: "Body harus JSON yang valid" };
    }

    // Validate WAHA payload before spending an AI call on it
    const parsed = parseWahaWebhook(body);
    if (!parsed.ok) {
      context.set.status = 400;
      return { error: parsed.error };
    }

    const { from, body: messageBody } = parsed.data;

    // Use AI SDK to generate response with OpenRouter
    const { generateText } = await import("ai");
    const model = openrouter(ENV.OPENROUTER_MODEL);

    try {
      const result = await generateText({
        model,
        system:
          "Anda adalah concierge helpful untuk homestay. Balas pertanyaan tamu dengan respons yang ramah dan singkat dalam Bahasa Indonesia.",
        prompt: `Pesan dari ${from}: ${messageBody}`,
      });

      // Reply shape required by WAHA: { to, reply }
      return buildWahaReply(from, result.text);
    } catch (error) {
      console.error("WAHA webhook AI error:", error);
      context.set.status = 502;
      return {
        ...buildWahaReply(from, ""),
        error: error instanceof Error ? error.message : "AI generation failed",
      };
    }
  })
  .get("/", () => "OK")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
