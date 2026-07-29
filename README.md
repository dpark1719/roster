# roster

Build 1: plan pages. A person creates a plan via a password-gated admin form; anyone with the link can view it and mark themselves in/maybe/can't with just a first name — no account, no app, no password.

See `BUILD-SPEC-01-plan-pages.md` (not committed here) for the full spec this implements.

## Stack

- Next.js (App Router) + TypeScript
- Postgres (Neon or Supabase free tier) via `drizzle-orm`/`postgres`
- Tailwind CSS
- `next/og` for dynamic per-plan share images
- Vercel Analytics + a custom `events` table for instrumentation

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — a Postgres connection string (Neon or Supabase free tier)
   - `ADMIN_PASSWORD` — the shared password for `/admin`
   - `COOKIE_SECRET` — a random 32+ char string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

2. Push the schema to your database:

   ```bash
   npm run db:push
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Visit `/admin`, log in with `ADMIN_PASSWORD`, and create a plan. The public page is at `/p/[slug]`.

## Routes

- `/admin` — plan list (upcoming/past), gated by `ADMIN_PASSWORD`
- `/admin/new`, `/admin/[id]` — create/edit a plan, view its responses
- `/admin/metrics` — 7/28-day instrumentation dashboard
- `/p/[slug]` — the public plan page (no auth)
- `/p/[slug]/ics` — calendar download
- `/p/[slug]/opengraph-image` — dynamic share image

## Database scripts

- `npm run db:generate` — generate a SQL migration from `db/schema.ts`
- `npm run db:push` — push the schema directly (fastest for early development)
- `npm run db:studio` — open Drizzle Studio
