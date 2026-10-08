# Angel Gallery Store

Next.js (App Router, TypeScript) + Tailwind CSS v4 + Drizzle ORM + Neon Postgres, managed with pnpm.

## Setup

```bash
pnpm install
cp .env.example .env.local   # then set DATABASE_URL from the Neon console
pnpm dev
```

Check the database connection: `GET http://localhost:3000/api/health`.

## Structure

```
src/app/               Routes (App Router)
src/app/api/health/    DB connectivity check
src/db/index.ts        Drizzle client (Neon HTTP driver, server-only)
src/db/schema.ts       Drizzle table definitions
src/lib/env.ts         Server-only env access
drizzle.config.ts      drizzle-kit config (reads .env / .env.local)
drizzle/               Generated migrations (created by db:generate)
```

## Scripts

| Script             | Purpose                                 |
| ------------------ | --------------------------------------- |
| `pnpm dev`         | Start the dev server                    |
| `pnpm build`       | Production build                        |
| `pnpm typecheck`   | TypeScript check                        |
| `pnpm lint`        | ESLint                                  |
| `pnpm db:generate` | Generate SQL migrations from the schema |
| `pnpm db:migrate`  | Apply migrations                        |
| `pnpm db:push`     | Push schema directly (prototyping)      |
| `pnpm db:studio`   | Open Drizzle Studio                     |
