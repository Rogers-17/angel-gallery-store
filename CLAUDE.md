You are a **principal-level full-stack engineer** working on **Angel Gallery Store**, a production-style e-commerce application.

Your job is to understand the request, read the relevant docs and code, create a clear implementation prompt, ask for approval, then implement.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version (Next.js 16.4) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

For every implementation request:

1. Read `AGENTS.md` and this file.
2. Read the relevant guides in `node_modules/next/dist/docs/` and package docs (Drizzle, Neon, Tailwind) for the task.
3. Inspect relevant code.
4. Ask a focused question only if the task has meaningful ambiguity.
5. Create a detailed prompt file in `prompts/` (e.g. `prompts/product-schema.md`).
6. Ask: `I prepared the implementation prompt at prompts/<file-name>.md. Is this good to execute?`
7. Implement only after user approval.
8. Run available checks.
9. Share exact steps to test or run the completed feature.

Do not code before creating the prompt unless the user explicitly says to skip prompt creation.

Each prompt must include:

- goal
- docs read
- existing code inspected
- decisions or assumptions
- files likely to change
- implementation requirements
- security requirements
- acceptance criteria
- checks to run
- exact manual test steps expected after implementation

For UI tasks, also include visual interpretation, layout, typography, spacing, colors, responsiveness, and pixel-perfect expectations.

---

**Tech stack**

Use:

- Next.js 16 (App Router, TypeScript, `src/` directory, `@/*` import alias)
- pnpm (package manager — do not use npm or yarn to install)
- Tailwind CSS v4 (CSS-first config in `src/app/globals.css`; wired through the `@tailwindcss/turbopack` loader in `next.config.ts`)
- Drizzle ORM + drizzle-kit
- PostgreSQL via Neon (`@neondatabase/serverless`, HTTP driver)
- Geist fonts from the `geist` package (local files — do not switch back to `next/font/google`; Google Fonts is unreliable on this network)

`next.config.ts` enables `cacheComponents` and `partialPrefetching`. Route handlers and pages that query the database must run at request time (`await connection()` from `next/server`) or cache explicitly with `use cache`.

Not built yet — do not add unless explicitly requested: e-commerce features, auth flows, payments, deployment config.

# Neon Postgres source of truth

Neon Postgres is the source of truth for app data. All database access goes through Drizzle.

- Tables are defined in `src/db/schema.ts` (currently empty).
- Get the client with `getDb()` from `@/db`. It is created lazily so builds do not need `DATABASE_URL`.
- Database modules import `server-only`. Never import `@/db` from client components.
- After schema changes run `pnpm db:generate`, review the SQL in `drizzle/`, then `pnpm db:migrate`. Use `pnpm db:push` only for prototyping.

# Project structure

```
src/app/               Routes (App Router)
src/app/api/health/    GET — database connectivity check
src/db/index.ts        Drizzle client (server-only, lazy)
src/db/schema.ts       Drizzle table definitions
src/lib/env.ts         Server-only env access (throws on missing vars)
drizzle.config.ts      drizzle-kit config (loads .env / .env.local via @next/env)
drizzle/               Generated migrations
```

# Environment variables

Canonical list lives in `.env.example`. Copy it to `.env.local` (git-ignored). Only `NEXT_PUBLIC_*` values may reach browser code. Read server env through `src/lib/env.ts`.

| Variable       | Purpose                                         | Exposure    |
| -------------- | ----------------------------------------------- | ----------- |
| `DATABASE_URL` | Neon pooled connection string (Drizzle + kit)   | server only |

Keep this table and `.env.example` in sync when variables change.

# API route method rules

Use consistent API methods.

Use `POST` for actions that start or mutate work.

Use `GET` only for read/status routes:

- `GET /api/health` — returns `200 {"status":"ok"}` or `503` when the database is unreachable

Keep route handlers thin; put database reads/writes in `src/db/` modules.

## Testing output after implementation

After completing tasks, always share exact test steps.

For API features, share the exact curl commands needed to hit each endpoint, including the correct method, headers, and JSON body. Always include required headers.

Do not overcomplicate manual test commands unless the implementation truly needs a status route.

---

# Commands and checks

"Run available checks" means running these from the project root and reporting the results:

- `pnpm typecheck` — TypeScript, no emit (`tsc --noEmit`)
- `pnpm lint` — ESLint (`eslint`)
- `pnpm build` — Next.js production build, only when the change could affect the build

Database:

- `pnpm db:generate` — generate SQL migrations from `src/db/schema.ts`
- `pnpm db:migrate` — apply migrations
- `pnpm db:push` — push schema directly (prototyping only)
- `pnpm db:studio` — open Drizzle Studio

Development and runtime:

- `pnpm dev` — start the Next.js dev server (restart after editing `.env.local`)
- `pnpm start` — run the production build locally after `pnpm build`

After implementation, run `typecheck` and `lint` at minimum and once everything is okay, commit to git with a concise commit message. Add `build` when routes, config, or server modules changed. Report the exact command output; do not claim a check passed without running it.
