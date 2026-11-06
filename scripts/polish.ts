#!/usr/bin/env bun
/**
 * scripts/polish.ts — polish a listing description with the OpenCode provider.
 *
 * Uses `ai-sdk-provider-opencode-sdk` (AI SDK v7 provider that talks to a local
 * OpenCode 2.x server), not a hosted OpenAI-compatible endpoint.
 *
 * Usage:
 *   OPENCODE_PASSWORD=<password> bun run scripts/polish.ts "deskripsi listing"
 *
 * Env:
 *   OPENCODE_BASE_URL  default http://127.0.0.1:4096
 *   OPENCODE_PASSWORD  password printed by `npx @opencode/cli@2.0.24 serve`
 *   OPENCODE_MODEL     default opencode/big-pickle
 */

import { generateText, type LanguageModel } from "ai";
import { createOpencode } from "ai-sdk-provider-opencode-sdk";

export const SYSTEM_PROMPT =
  "Anda adalah editor teks yang ahli. Perbaiki teks berikut agar lebih profesional, lancar, dan menarik. Pertahankan makna asli tetapi perbaiki grammar, vocabulary, dan flow.";

export type OpencodeHandle = {
  model: LanguageModel;
  dispose: () => Promise<void>;
};

/** Build a provider model pointing at a local OpenCode 2.x server. */
export function createOpencodeHandle(
  modelId: string = process.env.OPENCODE_MODEL ?? "opencode/big-pickle",
): OpencodeHandle {
  const password = process.env.OPENCODE_PASSWORD ?? "";
  const opencode = createOpencode({
    baseUrl: process.env.OPENCODE_BASE_URL ?? "http://127.0.0.1:4096",
    clientOptions: {
      headers: {
        Authorization: `Basic ${Buffer.from(`opencode:${password}`).toString("base64")}`,
      },
    },
  });

  return {
    model: opencode(modelId),
    dispose: async () => {
      await opencode.dispose();
    },
  };
}

/**
 * Polish `text`. Pass `model` to inject a model (used by unit tests); otherwise a
 * provider handle is created and disposed automatically.
 */
export async function polishText(text: string, model?: LanguageModel): Promise<string> {
  if (!text?.trim()) {
    return text;
  }

  const handle = model ? null : createOpencodeHandle();

  try {
    const result = await generateText({
      model: model ?? handle!.model,
      system: SYSTEM_PROMPT,
      prompt: text,
    });

    return result.text || text;
  } catch (error) {
    console.error("Error polishing text:", error);
    return text;
  } finally {
    await handle?.dispose();
  }
}

const isCli = typeof process !== "undefined" && Boolean(process.argv[1]?.endsWith("polish.ts"));

if (isCli) {
  const inputText = process.argv.slice(2).join(" ").trim();

  if (!inputText) {
    console.error('Usage: bun run scripts/polish.ts "teks yang akan dipoles"');
    process.exit(1);
  }

  const polished = await polishText(inputText);

  console.log("=== ORIGINAL ===");
  console.log(inputText);
  console.log("\n=== POLISHED ===");
  console.log(polished);
}
