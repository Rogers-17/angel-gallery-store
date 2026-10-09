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
- Fonts self-hosted via `next/font/local`: Geist from the `geist` package, Newsreader from `@fontsource-variable/newsreader`, Fraunces (design B) from `@fontsource-variable/fraunces` (do not use `next/font/google`; Google Fonts is unreliable on this network)

`next.config.ts` enables `cacheComponents` and `partialPrefetching`. Route handlers and pages that query the database must run at request time (`await connection()` from `next/server`) or cache explicitly with `use cache`.

Not built yet — do not add unless explicitly requested: e-commerce features, auth flows, payments, deployment config.

# Design system

Premium, editorial, near-monochrome. Full rationale in `prompts/design-system.md`; live preview at `/design-system`.

- Tokens live in `src/styles/theme.css` (Tailwind `@theme`): colors (`paper`, `surface`, `ink`, `muted`, `line`, `accent`, …), fonts (`font-serif` Newsreader for headings, `font-sans` Geist for UI/body), type scale (`text-display`, `text-h1`–`text-h4`, `text-body-lg`, `text-body`, `text-small`, `text-label`), spacing (`gutter`, `section`, `section-sm`, `header`), containers (`page` 1440px, `narrow` 720px).
- Primitives live in `src/styles/components.css` (`@utility`) and `src/components/ui/`: `Container`, `Section`, `Heading`/`Eyebrow`, `Button`/`ButtonLink`, `TextLink`, `Media`, `ProductGrid`. Use them instead of re-styling elements.
- Base styles (body, headings, focus ring, reduced motion) live in `src/styles/base.css`. `src/app/globals.css` only imports these files.
- Rules: no hard-coded hex values or arbitrary font sizes in components — use tokens. Square corners (no radius) and no shadows; use hairline borders (`hairline border-*`) and whitespace for hierarchy. Uppercase tracked labels via `eyebrow`. Product images are 4:5. Product grids are 2 / 3 / 4 columns (mobile / md / lg). Keep visible focus rings.
- Fonts are self-hosted (`src/app/fonts.ts`). Never use `next/font/google`.
- Components use semantic tokens (`primary`, `secondary`, `rounded-card`, `rounded-control`, `--button-*`, `--heading-*`) so a scoped theme (design B) can restyle them; Editorial values reproduce the original look.
- The design A shell (announcement bar, header, footer) lives in `src/app/(editorial)/layout.tsx`; the root layout only sets fonts, `<html>` and `<body>`.
- `src/app/_demo/catalog.ts` is temporary demo data for the homepage; replace with Drizzle queries when products exist.
- Demo photos (Unsplash, credited in `public/images/demo/CREDITS.md`) live in `public/images/demo/` and are self-hosted. Render images through `Media` (`src`/`alt`/`sizes`), which uses `next/image`; without `src` it shows a tonal placeholder. Never hot-link external image hosts.

# Design B review page

A second design (bold serif, white canvas, caramel buttons, rounded cards), modelled on a client reference screenshot, lives at `/design-b` while the client compares it with the homepage (design A). Prompt: `prompts/design-b-page.md`; reference: `references/design-b.webp` (not committed).

- Routes: `src/app/design-b/` (`layout.tsx` shell, `page.tsx`, `products/[slug]/page.tsx` product details, prerendered with `generateStaticParams`; unknown slugs call `notFound()`).
- Tokens: `src/styles/design-b.css` overrides tokens only inside the `.design-b` wrapper. Never change design A to fit B.
- Components: `src/components/design-b/` (header, footer, product card, promo tiles, mosaic, CTA banner, icons, `pdp/*`).
- Data: `src/app/design-b/_data/catalog.ts`, separate from design A's `src/app/_demo/catalog.ts`. Images: `public/images/design-b/` (Unsplash, credited in `CREDITS.md`). Do not share data or images between the two designs.
- Reference branding (Converse, Nike, Puma, Adidas) must never appear; use Angel Gallery branding and logo-free photos.
- Cart, wishlist, newsletter and the hero arrows are visual only until those features are built.

# Neon Postgres source of truth

Neon Postgres is the source of truth for app data. All database access goes through Drizzle.

- Tables are defined in `src/db/schema.ts` (currently empty).
- Get the client with `getDb()` from `@/db`. It is created lazily so builds do not need `DATABASE_URL`.
- Database modules import `server-only`. Never import `@/db` from client components.
- After schema changes run `pnpm db:generate`, review the SQL in `drizzle/`, then `pnpm db:migrate`. Use `pnpm db:push` only for prototyping.

# Project structure

```
src/app/               Routes (App Router)
src/app/(editorial)/   Design A: homepage + /design-system (route group, own layout)
src/app/design-b/      Design B review page + product details pages
src/app/api/health/    GET — database connectivity check
src/app/fonts.ts       Font definitions (all self-hosted)
src/styles/            theme.css (tokens), base.css, components.css (primitives), design-b.css (scoped)
src/components/ui/     Reusable design primitives
src/components/layout/ Announcement bar, header, mobile menu, footer
src/components/product/ Product UI (ProductCard)
src/components/design-b/ Design B components
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
