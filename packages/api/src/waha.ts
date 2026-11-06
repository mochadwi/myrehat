export type WahaMessage = {
  event: string;
  from: string;
  body: string;
};

export type WahaReply = {
  to: string;
  reply: string;
};

export type WahaValidation = { ok: true; data: WahaMessage } | { ok: false; error: string };

/**
 * Validate the WAHA webhook envelope: `{ event, payload: { from, body } }`.
 * Anything else is rejected before we spend an AI call on it.
 */
export function parseWahaWebhook(input: unknown): WahaValidation {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Payload harus berupa object" };
  }

  const body = input as { event?: unknown; payload?: unknown };
  const payload = body.payload as { from?: unknown; body?: unknown } | undefined;

  const event = typeof body.event === "string" ? body.event.trim() : "";
  const from = typeof payload?.from === "string" ? payload.from.trim() : "";
  const messageBody = typeof payload?.body === "string" ? payload.body.trim() : "";

  if (!event) return { ok: false, error: "Field event wajib diisi" };
  if (!from) return { ok: false, error: "Field payload.from wajib diisi" };
  if (!messageBody) return { ok: false, error: "Field payload.body wajib diisi" };

  return { ok: true, data: { event, from, body: messageBody } };
}

/** Reply shape returned to WAHA: exactly `{ to, reply }`. */
export function buildWahaReply(to: string, reply: string): WahaReply {
  return { to, reply };
}
