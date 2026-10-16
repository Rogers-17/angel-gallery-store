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
- Zod for validating all user input (forms, server actions, search params)
- Neon Auth (`@neondatabase/auth`, managed Better Auth) for customer and admin accounts (from roadmap Phase 5)
- Upstash Redis (`@upstash/redis`) for the `remote` cache handler (`cache-handlers/upstash-remote.js`) and, from Phase 4, rate limiting
- `tsx` to run CLI scripts in `scripts/` (seed, settings)
- Fonts self-hosted via `next/font/local`: Geist from the `geist` package, Fraunces from `@fontsource-variable/fraunces` (do not use `next/font/google`; Google Fonts is unreliable on this network)

`next.config.ts` enables `cacheComponents` and `partialPrefetching`. Route handlers and pages that query the database must run at request time (`await connection()` from `next/server`) or cache explicitly with `use cache`.

**Caching rules:**

- Data rendered into the static shell (catalog, settings) uses `"use cache"` + explicit `cacheLife` + `cacheTag` (tags in `src/db/queries/tags.ts`). Mutations invalidate with `updateTag()`.
- Request-time data (inside Suspense, or depending on `searchParams`, cookies or headers; e.g. Phase 2 filters/search) uses `"use cache: remote"`, stored in Upstash when `UPSTASH_REDIS_REST_*` is set (in-memory otherwise).
- Never use `"use cache: remote"` for static-shell data: network calls inside the cache handler never resolve during prerendering. The handler times out each Redis call (1.5s) so a stall becomes a cache miss, not a hang.
- Per-visitor data (the cart, orders; accounts from Phase 5) is never cached across requests: read it at request time inside `<Suspense>` (deduped per request with React `cache`) and never put its ids in cache keys or tags. After a mutation, call `refresh()` in the Server Action.

Build features in the order of the **Implementation roadmap** below and keep its checkboxes up to date. There is no online payment gateway: orders are placed on the site and completed over WhatsApp, with payment off-app (see the roadmap rules).

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
- Wishlist, newsletter and hero arrows are visual only until those features are built. `/design-b` URLs redirect to `/` (`next.config.ts`).

# Implementation roadmap

The plan for building the whole store. Work through it top to bottom.

**How to use it**

- Status: `[x]` done, `[~]` in progress, `[ ]` to do.
- Each item (or small group of items) goes through the normal workflow: prompt → approval → implement → checks → commit.
- When an item is finished and committed, tick it and add the short commit hash, e.g. `- [x] Seed script (a1b2c3d)`. Commit that CLAUDE.md update with the work.
- Don't start a phase before the phases it depends on are done, unless the user says so.
- If scope changes, edit this roadmap first, then build.

## How ordering works (business rules for every phase)

1. The buyer adds items to the cart and checks out, **as a guest or signed in**. An account is never required.
2. Placing the order saves it in Neon with an order number (e.g. `AG-1027`), then shows **"Send order on WhatsApp"**.
3. That button opens WhatsApp **from the buyer to the admin**, pre-filled with the order. All of the following is agreed in that chat, never computed or collected by the site:
   - payment
   - the delivery fee
   - delivery or pickup arrangements
4. **Payment happens off the app**, by one of:
   - **cash on delivery**
   - **MTN Mobile Money**
   - **Orange Money** (via USSD)
5. The admin updates the order in the dashboard: confirmed, agreed delivery fee, payment received, out for delivery, delivered.

Rules that follow from this:

- **No payment gateway**, and no card or wallet details are ever collected.
- **No automatic WhatsApp messages.** Use plain `wa.me` click-to-chat links only: buyer → admin at checkout, admin → buyer from the dashboard.
- **The database order is the source of truth.** WhatsApp is the conversation, not the record. The order is saved before the WhatsApp hand-off.
- **Never trust the client** for prices, stock, totals or status. Recompute server-side from the database when the order is placed, and snapshot it on the order.
- **Delivery is anywhere in Montserrado County.** Checkout collects area/community, street and landmark, or "pickup" (point agreed in chat). The site shows "Delivery fee: agreed on WhatsApp". Order totals at placement are the item subtotal; the admin adds the agreed fee later.
- **Currency:** prices are stored and charged in **USD**, with an **approximate LRD price** shown beside them. It uses an exchange rate the admin updates in settings, shown with its "last updated" date. Each order snapshots the rate in effect when it was placed.
- **Money** is stored as integers in minor units (cents). Never use floats.
- **Phone numbers:** validate and normalise every WhatsApp number to E.164 (`+231…`). Guests track orders through a secret link, or by order number + phone.

## Decisions (agreed with the client)

| Topic | Decision |
| --- | --- |
| Currency | USD prices, plus LRD shown at an admin-set rate (changes over time) |
| Delivery | Anywhere in Montserrado County. Fee and pickup points are agreed in the WhatsApp chat. |
| Payment methods | Cash on delivery, MTN Mobile Money, Orange Money, all off-app |
| WhatsApp | Plain click-to-chat links only; no WhatsApp API or automatic alerts |
| Admin | A single admin account |
| Email | Account emails (verification, password reset): Neon Auth with **custom SMTP via Gmail**. Order emails: **Resend**, with Gmail SMTP as fallback. |
| Image storage | **Neon Object Storage** (S3-compatible, branches with the database). Requires the Neon project to be in a supported region. |
| Auth | **Neon Auth** (managed Better Auth) for buyers and the admin |

## Phase 0: Foundation ✅

- [x] Next.js 16 + TypeScript + Tailwind v4 + pnpm scaffold, Drizzle + Neon client, `/api/health` (8481fe1)
- [x] CLAUDE.md workflow and commit rules (8e7d619, 691af05)
- [x] Global design system: tokens, primitives, `/design-system` (3aceedd)
- [x] Storefront UI on demo data: homepage, product details pages, header, footer, mobile menu (efb380b, 3aceedd)
- [x] Implementation roadmap and client decisions (9eaf2e3)

## Phase 1: Catalog data model ✅

Goal: a real catalog in Neon replaces `src/app/_data/catalog.ts`.

- [x] **Schema:** (09b6209)
  - `categories`, `collections` + `collection_products`
  - `products`: slug, name, summary, description, materials, care, status `draft|active|archived`, category, badge, SEO fields
  - `product_variants`: sku, colour, size, `price_cents` (USD), `compare_at_cents`, stock, position
  - `product_images`: storage key or URL, alt, position, crop position
  - timestamps on all tables
- [x] **`store_settings` table:** (09b6209)
  - admin WhatsApp number (E.164)
  - USD→LRD exchange rate + `rate_updated_at`
  - payment instructions per method (USSD steps for MTN MoMo and Orange Money, cash-on-delivery note)
  - store contact info
  - WhatsApp order message template
- [x] Migrations with drizzle-kit. Indexes: unique slug/sku, status, category. (09b6209)
- [x] Seed script (`pnpm db:seed`) that imports the current demo catalog and default settings, plus `pnpm settings:rate` / `pnpm settings:whatsapp` until the admin settings page exists. (09b6209)
- [x] Server-only data-access layer (`src/db/queries/*`) using `use cache` + `cacheTag`, so admin edits can revalidate per product, collection or setting. (09b6209)
- [x] Upstash Redis `remote` cache handler with cross-instance tag invalidation and timeouts (09b6209)
- [x] `Price` component: USD price plus "≈ L$…" from the current rate. Formatting lives in one money helper (cents, never floats). (09b6209)
- [x] Homepage, product pages and `/design-system` read from the database. Delete `_data/catalog.ts`. (09b6209)
- [x] Variant-aware product page: colour and size pick a real variant, and price, stock and "sold out" follow it. (09b6209)

## Phase 2: Browse, search & SEO ✅

- [x] Listing pages (`/shop`, `/shop/[category]`, `/collections/[slug]`) with sort (newest, price) and filters (category, audience, size, colour, price, in stock) in URL search params, plus pagination. (fc3b4d7)
- [x] Search (`/search`) using Postgres full-text search over name, tag, summary and description, plus the category name at query time. (fc3b4d7)
- [x] Header, footer and homepage links point to real pages (no `#` placeholders left; footer Legal/Help stay `#` until Phase 8). (fc3b4d7)
- [x] SEO: per-page metadata and Open Graph images, Product JSON-LD (USD price, availability), `sitemap.ts`, `robots.ts`, canonical URLs. (fc3b4d7)
- [x] Loading, empty and not-found states for every listing. Unknown slugs render the not-found page with status 200 + `noindex` (streaming has started; a real 404 would cost the instant App Shell). (fc3b4d7)

## Phase 3: Cart (guest-first) ✅

- [x] `carts` + `cart_items` tables. The cart ID lives in an httpOnly, signed cookie (`ag_cart`, HMAC with `CART_COOKIE_SECRET`), so guests get a persistent cart with no account. Lines store no prices. (96e7084)
- [x] Server actions to add, update quantity and remove (`src/app/actions/cart.ts`). Each one checks the variant exists, is active and is in stock, and caps quantities (≤ stock, ≤ 10 per line, ≤ 30 lines). (96e7084)
- [x] Cart drawer (header bag icon with live count) and a `/cart` page (96e7084):
  - subtotal in USD + ≈ LRD, recomputed on the server
  - "Delivery fee: agreed on WhatsApp" line
  - checkout button disabled ("Checkout opens soon") until Phase 4
  - product cards: "Choose Options" → product page; single-variant products add from the card
- [x] Cart expiry (sliding 30 days) and cleanup: a batch of expired carts is swept after each new cart (`after()`), plus `pnpm carts:cleanup`. (96e7084)

## Phase 4: Checkout & WhatsApp order hand-off (core flow)

Built in two parts:

- **Part 1** (`prompts/phase-4-part-1-checkout.md`, 8ebc976): order tables, `/checkout`, `placeOrder`, the WhatsApp builder, the confirmation page, abuse protection, the inventory policy.
- **Part 2:** order lookup and tests.

- [x] **Order tables:**
  - `orders`:
    - number like `AG-1027`, status, optional `customer_id`
    - contact: full name, WhatsApp phone, optional email
    - fulfilment: `delivery` (area/community, street, landmark, notes; Montserrado County) or `pickup` (arranged in chat)
    - preferred payment method: `cash_on_delivery | mtn_momo | orange_money`
    - `subtotal_cents`, `delivery_fee_cents` (null until agreed), `total_cents`, currency `USD`, `lrd_rate` snapshot
    - hashed guest access token, idempotency key, timestamps
  - `order_items`: snapshot of name, variant label, sku, unit price, quantity, line total, image
  - `order_events`: status history with actor and note
  - `payments`
- [x] **`/checkout`** for guests (signed-in prefill arrives with Phase 5):
  - contact details, with the WhatsApp phone required, validated and normalised to `+231…`
  - delivery or pickup, and address details for delivery
  - preferred payment method (3 options, with a short explanation of each)
  - consent to be contacted on WhatsApp
  - Zod validation; signed-in users are prefilled from their profile
  - the summary shows subtotal (USD + ≈ LRD) and "Delivery fee: agreed on WhatsApp"
- [x] **`placeOrder` server action** (use the `drizzle-orm/neon-serverless` WebSocket driver for a real transaction; the HTTP driver only supports batches):
  - an idempotency key so a double submit can't create two orders
  - re-read prices and stock from the database and compute the subtotal
  - snapshot the line items and the LRD rate
  - create the order as `pending` with an order number and a guest access token (store only its hash)
  - clear the cart
- [x] **WhatsApp message builder** (server-side, from the settings template):
  - contents: order number, items (variant, quantity, price), subtotal in USD and ≈ LRD, fulfilment and address/landmark, preferred payment method, customer name and phone, and the admin link to the order
  - output: `https://wa.me/<admin-number>?text=<encoded>`, kept under URL length limits (summarise long orders)
- [x] **Order confirmation page** (`/orders/[number]?token=…`):
  - a large "Send order on WhatsApp" primary button
  - the order summary
  - the next steps: chat with the admin, agree the delivery fee, pay by your chosen method
  - USSD payment steps for the chosen method, from settings
  - the current order status
- [ ] **Order lookup** (`/orders/lookup`, Part 2): order number + phone, for buyers who lose the link. It gets its own rate limit.
- [x] **Abuse protection** on guest checkout: rate limits per IP and phone (`@upstash/ratelimit` on the existing Upstash database), a honeypot field (add Cloudflare Turnstile if spam appears), quantity limits.
- [x] **Inventory policy:**
  - placement re-checks stock and refuses changed bags, but does not decrement stock
  - stock is committed when the admin confirms the order and released if it's cancelled (built in Phase 6)
  - availability is shown honestly
- [ ] **Tests** (Part 2): unit tests for money/LRD conversion, phone normalisation and the WhatsApp message builder; an end-to-end test of guest checkout.

## Phase 5: Authentication (Neon Auth, managed Better Auth)

- [ ] **Setup:**
  - enable Auth in the Neon console (Project → Branch → Auth)
  - install `@neondatabase/auth`
  - env vars `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET`
  - `src/lib/auth/server.ts` (`createNeonAuth`) and `src/lib/auth/client.ts`
  - catch-all route `src/app/api/auth/[...path]/route.ts`
  - `src/proxy.ts` (it must live in `src/`) guarding `/account/*` and `/admin/*`
- [ ] **Sessions:** read the session at request time inside Suspense boundaries (Cache Components; no `force-dynamic`) through a per-request `getCurrentUser()` helper. Wrap SDK calls in try/catch (the beta client throws on failure).
- [ ] **Auth emails:** configure Neon Auth custom SMTP with Gmail (`smtp.gmail.com`, App Password), sender name "Angel Gallery". Send a test email and brand the templates.
- [ ] **Customer auth UI** in the design system: sign up, sign in, sign out, forgot/reset password, email verification.
- [ ] **`customers` profile table** linked to `neon_auth.user.id` (WhatsApp phone, default delivery address). Account pages: profile, saved addresses, order history, order detail.
- [ ] **Claim guest orders:** after sign-up or sign-in, offer to attach past guest orders that match the verified email or phone.
- [ ] Merge the guest cart into the account on sign-in (add `carts.customer_id`), and prefill checkout from the profile.
- [ ] **Single admin:**
  - the admin is the Neon Auth user whose **verified** email matches the server-only `ADMIN_EMAIL` env var
  - there is no admin sign-up flow
  - `requireAdmin()` re-checks this on the server in every admin page and server action; the proxy is only the first gate

## Phase 6: Admin dashboard

- [ ] `/admin` layout (admin-only, `noindex`). Overview: new orders awaiting confirmation, orders awaiting payment, recorded revenue, low stock.
- [ ] **Orders:**
  - list with filters (status, date, payment method, search by number or phone) and a detail page
  - status workflow: `pending → confirmed → awaiting_payment → paid → processing → out_for_delivery → delivered`, plus `cancelled` (and `refunded` if ever needed)
  - every change is written to `order_events`
- [ ] **Agreed delivery fee:** the admin enters the fee agreed in the chat (or "pickup, no fee"), and the order total updates.
- [ ] **Payment recording:**
  - fields: method (cash on delivery, MTN MoMo or Orange Money), amount (USD, or LRD converted at the order's rate), mobile-money transaction ID if any, received-at, notes
  - partial payments are allowed; the order becomes `paid` when fully paid
- [ ] **WhatsApp from admin:** a "Message customer" button (`wa.me` to the buyer's number) with prefilled messages for confirmed + payment instructions, payment received, out for delivery and delivered.
- [ ] **Catalog management:**
  - products: create, edit, publish and archive
  - variants, and stock adjustments with a reason
  - categories and collections
- [ ] **Images on Neon Object Storage:**
  - a `public_read` bucket for product images
  - server-side presigned uploads, admin only, with a type and size allowlist
  - `next/image` `remotePatterns` for the bucket endpoint
  - move the seeded demo images into the bucket
- [ ] **Store settings UI:**
  - WhatsApp number
  - **LRD exchange rate**, shown with its last-updated date
  - payment instructions (USSD steps)
  - store contact info and the order message template
  - policy page content
- [ ] Every admin change revalidates the affected cache tags.

## Phase 7: Order emails & status updates

- [ ] The order status page reflects admin updates for buyers holding the order link or using order lookup.
- [ ] Order emails for buyers who gave an email (order received, confirmed, out for delivery), sent with **Resend**. Gmail SMTP is the fallback; templates use the brand.
- [ ] Admin email alert for each new order (Resend). This is a backup to the WhatsApp chat, not an automatic WhatsApp message.

## Phase 8: Trust, quality & launch

- [ ] Content pages:
  - How to Order & Pay: the WhatsApp flow, plus USSD steps for MTN MoMo and Orange Money, admin-editable
  - Delivery (Montserrado County)
  - Returns, FAQ, Contact
  - Privacy Policy, Terms & Conditions
- [ ] Optional wishlist: stored in the browser for guests, synced for account holders.
- [ ] **Accessibility:** keyboard, focus, contrast and screen-reader labels.
- [ ] **Performance:** image sizes and LCP; Lighthouse 90+ on mobile; light pages for slow mobile networks.
- [ ] **Monitoring:** privacy-friendly analytics, error monitoring, structured logs for the order flow.
- [ ] **Security review:** validation on every input, rate limits, admin checks on every server action, no secrets in client code, security headers.
- [ ] **Production:**
  - Vercel project and env vars
  - a Neon production branch with preview branches (auth state and storage branch with the database); a Preview `DATABASE_URL` (none yet, so preview builds fail)
  - `CACHE_NAMESPACE` per environment: `production` for Production, `preview` for Preview (currently one shared value)
  - run `pnpm db:migrate` automatically on deploy (today it's manual; see "Production database")
  - a scheduled expired-cart cleanup (Vercel Cron), replacing the opportunistic sweep
  - custom domain, backups and point-in-time restore
- [ ] Replace the demo photos and catalog with real content; remove the `/design-b` redirects.

# Neon Postgres source of truth

Neon Postgres is the source of truth for app data. All database access goes through Drizzle.

- Tables are defined in `src/db/schema.ts`:
  - catalog
  - `carts` + `cart_items`
  - `orders` + `order_items` + `order_events` + `payments`
  - `store_settings`

  Column names are camelCase in TS and snake_case in SQL (`casing: "snake_case"` in the client, scripts and `drizzle.config.ts`).
- Read data only through `src/db/queries/*` (server-only, returns plain serializable DTOs from `src/db/queries/types.ts`).
  - catalog and settings reads are cached
  - `cart.ts` and `orders.ts` are request-time
  - storefront queries return `active` products only
- Writes go through `src/db/mutations/*` (server-only), called from thin Server Actions in `src/app/actions/*`. The actions validate input with Zod and derive identity server-side (the cart from the signed cookie, never from the client).
- `getDb()` is the neon-http client: reads and batches only. For an interactive transaction, use `withTransaction()` from `src/db/transaction.ts`. It opens a per-call WebSocket `Pool` and closes it when done. Only `placeOrder` needs it.
- **Orders:**
  - numbers are `AG-` + `order_number_seq` (from 1001)
  - order lines are snapshots (name, variant, sku, price, image), so catalog edits never change past orders
  - guests open an order with `/orders/<number>?token=…`. The token is `HMAC(ORDER_TOKEN_SECRET, idempotency key)`, and only its SHA-256 is stored (`src/lib/orders/token.ts`).
  - never log buyer details or tokens
- Rate limits (`src/lib/rate-limit.ts`, `@upstash/ratelimit`) fail open, and they are skipped when Upstash isn't configured.
- Money is integer USD cents (`src/lib/money.ts` formats USD and ≈ LRD). Phone numbers go through `src/lib/phone.ts` (E.164 `+231…`).
- CLI scripts (`scripts/*`) use their own client (`scripts/db.ts`): `src/db/index.ts` is `server-only` and can't load outside Next.
- Get the client with `getDb()` from `@/db`. It is created lazily so builds do not need `DATABASE_URL`.
- Database modules import `server-only`. Never import `@/db` from client components.
- After schema changes run `pnpm db:generate`, review the SQL in `drizzle/`, then `pnpm db:migrate`. Use `pnpm db:push` only for prototyping.

## Production database

- Vercel's Production `DATABASE_URL` is managed by the Neon–Vercel integration. Its Neon project lives in the Vercel-managed Neon organization (not your own project list): open it from Vercel → Storage → the database → Open in Neon. Local development uses a separate development branch in `.env`.
- Migrations do **not** run on deploy. Before deploying a schema change, migrate production from PowerShell (scripts and drizzle-kit don't override a variable already set in the shell):

  ```powershell
  $env:DATABASE_URL = "<Vercel Production DATABASE_URL>"
  $env:CACHE_NAMESPACE = "production"
  pnpm db:migrate
  Remove-Item Env:DATABASE_URL, Env:CACHE_NAMESPACE
  ```

  Seed a fresh production database the same way with `pnpm db:seed` (it replaces all catalog data, so only on an empty database) and `pnpm settings:*`. Check the `Seeding ep-…` host line before trusting a script's target.

# Project structure

```
src/app/               Routes (App Router): / (home), /shop, /shop/[category], /collections/[slug],
                       /search, /products/[slug], /cart, /checkout, /orders/[number], /design-system;
                       sitemap.ts, robots.ts, opengraph-image.tsx, not-found.tsx
src/app/actions/       Server Actions ("use server"): cart add / buy now / update / remove; checkout placeOrder
src/content/home.ts    Editorial homepage content (hero, tiles, mosaic, banner, section titles)
src/app/api/health/    GET — database connectivity check
src/app/fonts.ts       Font definitions (all self-hosted)
src/styles/            theme.css (tokens), base.css, components.css (primitives)
src/components/ui/     Reusable design primitives
src/components/layout/ Header, header frame, mobile menu, footer, icons, nav data
src/components/product/ Product card + product details (pdp/*)
src/components/home/   Homepage sections (promo tiles, mosaic, CTA banner)
src/components/listing/ Listing view, filter panel/drawer, active filters, sort, pagination, skeletons
src/components/search/ GET search form (works without JS)
src/components/seo/    Escaped JSON-LD helper + BreadcrumbList builder
src/components/cart/   Cart UI provider (drawer state), header bag + drawer, line items, summary,
                       Add to Cart / Buy Now buttons
src/components/checkout/ Checkout form (useActionState), choice cards, order summary
src/components/orders/ WhatsApp button, order status pill
src/db/index.ts        Drizzle client (server-only, lazy, neon-http)
src/db/transaction.ts  withTransaction(): per-call WebSocket Pool for interactive transactions
src/db/schema.ts       Drizzle table definitions
src/db/queries/        Server-only reads: catalog + settings (`use cache`), listing + search
                       (`use cache: remote`), cart + orders (request-time), mappers, tags, DTO types
src/db/mutations/      Server-only writes (cart, orders)
src/lib/cart/          Cart cookie signing (server-only) and shared limits
src/lib/orders/        Checkout schema (Zod), order token helpers (server-only), labels,
                       WhatsApp message builder
src/lib/rate-limit.ts  Upstash rate limits (fail open) + client IP
src/lib/env.ts         Server-only env access (throws on missing vars)
src/lib/listing.ts     Search-param schema (Zod), in-memory filter/sort/paginate, facet + link helpers
src/lib/site.ts        Site URL/name/description, absoluteUrl()
src/lib/money.ts       USD cents + LRD formatting
src/lib/phone.ts       Liberian phone normalisation (E.164) and wa.me digits
cache-handlers/        Upstash "use cache: remote" handler + Redis key layout
scripts/               CLI: seed, settings, script-only DB client
drizzle.config.ts      drizzle-kit config (loads .env / .env.local via @next/env)
drizzle/               Generated migrations
```

# Environment variables

Canonical list lives in `.env.example`. Copy it to `.env` (git-ignored). Only `NEXT_PUBLIC_*` values may reach browser code. Read server env through `src/lib/env.ts`.

| Variable       | Purpose                                         | Exposure    |
| -------------- | ----------------------------------------------- | ----------- |
| `DATABASE_URL` | Neon pooled connection string (Drizzle + kit). Use a development branch locally. | server only |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (remote cache, checkout rate limits) | server only |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash **read-write** REST token (the read-only token fails) | server only |
| `CACHE_NAMESPACE` | Redis key namespace per environment/database: `local`, `preview`, `production` | server only |
| `CART_COOKIE_SECRET` | HMAC key signing the `ag_cart` cookie; ≥ 32 random chars, different per environment. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. Rotating it empties existing carts. | server only |
| `ORDER_TOKEN_SECRET` | HMAC key deriving guest order-link tokens; ≥ 32 random chars, different per environment (generate like `CART_COOKIE_SECRET`). Rotating it doesn't break existing order links (they're checked against stored hashes). | server only |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for `metadataBase`, canonical URLs, Open Graph, sitemap and JSON-LD (`src/lib/site.ts`). Falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000`. | public |

Keep this table and `.env.example` in sync when variables change.

If Upstash is slow from your network (calls past the handler's 1.5s timeout log `[cache] … timed out` and every request becomes a cache miss), leave the two `UPSTASH_*` variables unset locally: `next.config.ts` then uses the in-memory cache. Production on Vercel is unaffected.

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
- `pnpm db:seed` — replace all catalog data with the demo catalog; creates settings if missing (`--reset-settings` overwrites them)
- `pnpm settings:rate 172.5` — set the LRD per USD rate
- `pnpm settings:whatsapp +231…` — set the admin WhatsApp number
- `pnpm carts:cleanup` — delete expired carts
- Scripts refuse to run with `NODE_ENV=production` unless `--force` is passed. After a script change, restart `pnpm dev` (or redeploy) to refresh prerendered pages.

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
