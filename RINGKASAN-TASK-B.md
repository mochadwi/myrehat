# Ringkasan Task B — status & cara verifikasi

Tanggal: 2026-11-06

## Stack
Next.js + Elysia (Bun) + PostgreSQL + Drizzle + Better Auth + oRPC (Better-T-Stack).
`PROMPT-LOG.md` di root berisi transkrip lengkap sesi (secret sudah diredaksi).

## 5 patch wajib (semua terpasang)
1. `apps/web/.env` + `apps/server/.env` — nilai **dummy**, value asli diinject Dokploy.
2. `pnpm-workspace.yaml` — `msgpackr-extract: true` di `allowBuilds`.
3. `docker-compose.yml` — tanpa `ports:`, env dari Dokploy (`NEXT_PUBLIC_SERVER_URL`,
   `DATABASE_URL`, `BETTER_AUTH_*`, `OPENROUTER_*` di web **dan** server).
4. `apps/web/next.config.ts` — rewrite `/rpc` + `/api/auth` ke `http://server:3000`.
5. `packages/auth/src/index.ts` — `sameSite: "lax"`, `secure: false`.

## Fitur
- **F1** — tabel `listing` (Drizzle) + `listing.create` (protected) / `listing.list` (public)
  + halaman `/buy-homestay`: form title, price, location, dropdown 4 kategori, kontak WA;
  list diambil dari database dan tombol WhatsApp per listing.
  Kategori: Buy Property / Buy land to build homestay / Buy Airbnb Profile / Buy Airbnb Business.
- **F2** — `POST /api/webhooks/waha` → validasi `{ event, payload: { from, body } }`
  → AI SDK (OpenRouter) → JSON `{ to, reply }`. Payload salah → 400.
- **F3** — `scripts/polish.ts` memakai provider **`ai-sdk-provider-opencode-sdk`**
  (`createOpencode`, butuh `OPENCODE_PASSWORD` + server OpenCode 2.x jalan).
- **F4** — hero "Book homestays directly with hosts", grid 1/2/3 kolom.

## Test & typecheck
- `bunx vitest run` → **2 file, 15 test lulus**
  (`apps/web/src/__tests__/webhook.test.ts` + `scripts/polish.test.ts`).
  Test mengimpor kode asli: `parseWahaWebhook`, `buildWahaReply`, `validateListingInput`,
  `polishText` (AI di-mock).
- `pnpm run check-types` → 6 task sukses, exit 0.

## Verifikasi manual (server lokal)
- `GET /` → `OK`
- webhook payload salah → `400 {"error": ...}`
- webhook payload benar → `200 {"to":"+628123456789","reply":"..."}`
- `listing/create` tanpa login → `401` (dan server **tidak** mati)
- sign-in → `listing/create` kategori valid → tersimpan
- kategori ke-5 → `400 Input validation failed`
- `listing/list` → baris yang baru dibuat muncul

## Env & secret
- File `.env` yang di-commit hanya berisi placeholder.
- Nilai asli (BETTER_AUTH_SECRET, DATABASE_URL lokal, OPENROUTER_API_KEY) ada di
  `apps/server/.env.local` yang **di-ignore** git. Varlock memuat `.env` lalu `.env.local`.

## Database lokal (sementara)
- Colima + container `myrehat-db` (postgres:17, host port 5435).
- Tabel: `user`, `session`, `account`, `verification`, `listing`.
- Push schema: `cd packages/db && pnpm run db:push` (dari root gagal karena turbo butuh TUI).

## Belum selesai
- Push ke GitHub & deploy Dokploy (menunggu SSH key baru didaftarkan + kredensial DB dari tim).
- Model `:free` OpenRouter bisa kena rate-limit 429 kalau dipanggil terlalu sering.
