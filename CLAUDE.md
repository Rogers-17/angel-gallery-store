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
- Tailwind CSS v4 (CSS-first config imported from `src/app/globals.css`; compiled by `@tailwindcss/postcss` via `postcss.config.mjs`)
- Drizzle ORM + drizzle-kit
- PostgreSQL via Neon (`@neondatabase/serverless`, HTTP driver)
- Fonts self-hosted via `next/font/local`: Geist from the `geist` package, Fraunces from `@fontsource-variable/fraunces` (do not use `next/font/google`; Google Fonts is unreliable on this network)

`next.config.ts` enables `cacheComponents` and `partialPrefetching`. Route handlers and pages that query the database must run at request time (`await connection()` from `next/server`) or cache explicitly with `use cache`.

Not built yet — do not add unless explicitly requested: e-commerce features, auth flows, payments, deployment config.

# Design system

Warm, bold storefront (the client-approved "design B"): white canvas, espresso ink, caramel and beige actions, cream on photos, rounded cards. Rationale: `prompts/global-design-system.md` (local); live reference: `/design-system`. Reference screenshot `references/design-b.webp` is local only and its branding (Converse, Nike, Puma, Adidas) must never appear.

- **Tokens** (`src/styles/theme.css`, Tailwind `@theme`):
  - Colors: `paper`, `ink`, `ink-soft`, `muted`, `primary` (caramel) / `primary-hover` / `primary-fg`, `secondary` (beige), `cream`, `tag` / `tag-fg`, `surface`, `well-from`/`well-to`, `espresso-soft`, `line`, `line-strong`, `tone-*` (image placeholders).
  - Fonts: `font-display` (Fraunces, weight `font-heading` 650, SOFT axis) and `font-sans` (Geist).
  - Type: `text-display`, `text-h1`–`text-h4`, `text-price`, `text-body-lg`, `text-body`, `text-small`, `text-caption`, `text-label`.
  - Spacing: `gutter`, `section`, `section-sm`, `header`. Containers: `page` (1280px), `narrow` (720px).
  - Radius: `rounded-card` (14px), `rounded-control` (8px), `rounded-pill`.
- **Utilities** (`src/styles/components.css`): `container-page`, `container-narrow`, `section-y`, `section-y-sm`, `hairline`, `well`, `tag`, `link-underline`, `link-inline`, `btn` + `btn-primary|secondary|cream|dark|outline|ghost` + `btn-sm|md|lg|icon` + `btn-pill`, `field`, `field-dark`, `tone-*`, `scrollbar-none`.
- **Components** (`src/components/ui/`): `Container`, `Section`, `Heading`, `SectionHeader` (centred by default), `Button`/`ButtonLink` (+ `buttonClasses`), `TextLink`, `Tag`, `Media` (`surface` tone or `"well"`, `radius`), `ProductGrid` (2 → 3 columns). Use these instead of re-styling elements.
- **Rules**:
  - No hex values, arbitrary font sizes or shadows in components; use tokens (product colour-swatch data is the only exception).
  - Headings use the display serif in Title Case; section titles are centred with a short muted subtitle. Serif also for "voice" labels (footer headings, newsletter label, social pills). UI copy is sans, sentence case.
  - Buttons are sentence case: `primary` for the main action, `secondary` beside it, `cream` on photos/dark, `dark` on light imagery, `outline` pill for "see more".
  - Product cards lead with the price, then tag pill, name, two-line caption summary, then Add to Cart + Buy Now. Product images sit on a `well`.
  - Text on photos is cream over a dark gradient. Dark surfaces use `ink` with `espresso-soft` filled controls.
  - Mobile: grids stay 2 columns with stacked buttons, promo rows swipe, mosaics stack, no horizontal scroll at 360px. Keep visible focus rings.
- Fonts are self-hosted (`src/app/fonts.ts`). Never use `next/font/google`.
- The store shell (header, footer) is in the root layout. The header is transparent over the homepage hero and solid elsewhere (`header-frame.tsx`).
- `src/app/_data/catalog.ts` is temporary demo data; replace with Drizzle queries when products exist. Demo photos (Unsplash, credited in `public/images/demo/CREDITS.md`) are self-hosted; render images through `Media` (`next/image`). Never hot-link external image hosts.
- Cart, wishlist, newsletter and hero arrows are visual only until those features are built. `/design-b` URLs redirect to `/` (`next.config.ts`).

# Neon Postgres source of truth

Neon Postgres is the source of truth for app data. All database access goes through Drizzle.

- Tables are defined in `src/db/schema.ts` (currently empty).
- Get the client with `getDb()` from `@/db`. It is created lazily so builds do not need `DATABASE_URL`.
- Database modules import `server-only`. Never import `@/db` from client components.
- After schema changes run `pnpm db:generate`, review the SQL in `drizzle/`, then `pnpm db:migrate`. Use `pnpm db:push` only for prototyping.

# Project structure

```
src/app/               Routes (App Router): / (home), /products/[slug], /design-system
src/app/_data/         Temporary demo catalog
src/app/api/health/    GET — database connectivity check
src/app/fonts.ts       Font definitions (all self-hosted)
src/styles/            theme.css (tokens), base.css, components.css (primitives)
src/components/ui/     Reusable design primitives
src/components/layout/ Header, header frame, mobile menu, footer, icons, nav data
src/components/product/ Product card + product details (pdp/*)
src/components/home/   Homepage sections (promo tiles, mosaic, CTA banner)
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

After implementation, run `typecheck` and `lint` at minimum. Add `build` when routes, config, or server modules changed. Report the exact command output; do not claim a check passed without running it.

# Git commits

Every change to the codebase that passes all required checks must be committed to git.

- This applies to every change — features, fixes, config, dependencies, and docs (including this file).
- Commit only after every required check passes. If any check fails, fix it first; never commit failing code.
- Use a concise commit message that describes what changed and why.
- Stage only files related to the change. Never commit `.env.local`, secrets, `node_modules/`, or `.next/`.
- Commit locally only; push to `origin` only when the user asks.
