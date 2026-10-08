# Design system + test homepage

## Goal

Set up a global design system for Angel Gallery Store, based on principles from premium e-commerce sites: typography, color tokens, borders, buttons, links, spacing, containers and reusable responsive primitives. Then build a test homepage that uses only those primitives, so the user can review the visual direction.

The design follows observed principles only. No text, assets, logos or branding are copied from any site.

## Research (premium e-commerce patterns studied)

References: Aesop, COS, Arket, SSENSE, The Row, Totême, Byredo, Everlane, plus curated write-ups (Limely "Top 10 Minimalist Luxury Ecommerce Websites", Codal "Best luxury eCommerce websites"). Some live sites block automated fetches (403), so the analysis combines the write-ups, the markup of sites that allowed access (Everlane, Byredo), and well-known public patterns.

| Area | Observed principle |
| --- | --- |
| Typography | Two voices: an editorial **serif** for display and headlines, and a neutral **sans** for UI and body. Small **uppercase labels with wide tracking** for nav, eyebrows and CTAs. Few weights (regular/medium). Large type contrast between headline and UI. |
| Color | Near-monochrome. Warm off-white or paper backgrounds, near-black ink, a single muted gray for secondary text, hairline neutral borders. Accent color used very sparingly (sale, focus, small highlights). Imagery supplies the color. |
| Spacing | Generous whitespace. Large vertical gaps between sections (80–160px desktop). Tight, consistent spacing inside components. |
| Layout | Wide max container (~1440px) with fluid side gutters. Strict grids. Full-bleed hero imagery. Split (image/text) editorial blocks. |
| Navigation | Thin announcement bar. Header with nav left, logo center, utilities (search/account/bag) right. Sticky, quiet header with a hairline bottom border. Hamburger drawer on mobile. |
| Product presentation | Image-first cards. Portrait **4:5** images on a soft tonal background. Name and price small, below the image, left-aligned, no boxes or shadows. Subtle hover (image swap/zoom, underline). 2 columns on mobile, 3–4 on desktop. |
| Imagery | Large, calm, tonal photography. Consistent aspect ratios. No collage clutter. |
| Buttons | **Square corners** (0 radius). Solid ink primary, outline secondary, text/link tertiary. Uppercase, small, tracked labels. Tall tap targets (44–52px). Simple color inversion on hover. |
| Borders | 1px hairlines only, no shadows. Dividers instead of cards. |
| Responsiveness | Mobile-first. Type scales fluidly (`clamp`). Grids collapse 4 → 2 columns. Nav collapses to a drawer. Gutters shrink to 16px on phones. Horizontal scroll rows for categories on mobile. |

## Docs read

- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` (Tailwind v4 setup, global CSS)
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` (`next/font/local`)
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` (client boundary for the mobile menu)
- Tailwind CSS v4.3 conventions: `@theme` tokens, `@utility`, `@layer base`

## Existing code inspected

- `src/app/globals.css`: `@import "tailwindcss"`, basic `--background`/`--foreground`, dark-mode media query, Arial body font (overrides Geist)
- `src/app/layout.tsx`: Geist Sans/Mono from the `geist` package (local), `h-full antialiased`
- `src/app/page.tsx`: placeholder heading
- `next.config.ts`: Turbopack CSS loader `@tailwindcss/turbopack`, `cacheComponents: true`
- No components directory yet; `@/*` alias maps to `src/*`

## Decisions and assumptions

1. **Fonts:**
   - Display serif: **Newsreader** (variable, optical sizes), self-hosted with `next/font/local` from `@fontsource-variable/newsreader`. No Google Fonts fetch, which is unreliable on this network.
   - UI and body sans: **Geist Sans**, already installed.
2. **Palette:**
   - Light, warm, near-monochrome theme.
   - Light-only for now: the existing dark-mode override is removed, because premium stores rarely invert and imagery is tuned for light.
   - Every color is a token, so a dark theme can be added later.
3. **Radius:** 0 for buttons, inputs and cards; `--radius-pill` exists only for small badges.
4. **No shadows.** Hierarchy comes from whitespace, type and hairlines.
5. **Placeholder imagery:** tonal CSS gradient blocks at fixed aspect ratios, not stock photos or copied assets. Real product images replace them later.
6. **Demo data:**
   - The test homepage uses a small static demo catalog in `src/app/_demo/catalog.ts`.
   - It is clearly marked as temporary. This does **not** violate "Postgres is source of truth", because no real product data exists yet.
   - It will be replaced by Drizzle queries when product schema work is approved.
   - All names are original and generic (apparel and objects), with no brand references.
7. **No new feature logic:** no cart, auth, search, filters or newsletter submission. Interactive elements are visual only (links to `#`, a disabled newsletter form or a `type="button"`).
8. **Class merging:** a tiny `cn()` helper (filter + join), with no `clsx`/`tailwind-merge` dependency.

## Files likely to change

| File | Change |
| --- | --- |
| `package.json` / `pnpm-lock.yaml` | add `@fontsource-variable/newsreader` |
| `src/app/fonts.ts` | new: font definitions (Geist Sans, Geist Mono, Newsreader) exposing CSS variables |
| `src/styles/theme.css` | new: Tailwind `@theme` tokens (colors, fonts, type scale, tracking, spacing, radius, breakpoints, container widths, easing) |
| `src/styles/base.css` | new: `@layer base` (body, headings, links, selection, focus-visible, reduced motion) |
| `src/styles/components.css` | new: `@utility` primitives (`container-page`, `container-narrow`, `section`, `eyebrow`, `link-underline`, `btn`, `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-sm`/`btn-lg`, `field`, `hairline`) |
| `src/app/globals.css` | rewritten as the entry point: `@import "tailwindcss"` + the three style files |
| `src/app/layout.tsx` | use `fonts.ts`, set body classes, real metadata |
| `src/lib/cn.ts` | new: class join helper |
| `src/components/ui/container.tsx` | new: `Container` (`page`/`narrow`/`full` widths) |
| `src/components/ui/section.tsx` | new: `Section` (vertical rhythm, optional divider) |
| `src/components/ui/button.tsx` | new: `Button` and `ButtonLink` (variants: primary/secondary/ghost; sizes: sm/md/lg; `fullWidth`) |
| `src/components/ui/text-link.tsx` | new: underline link (`next/link`) |
| `src/components/ui/heading.tsx` | new: `Eyebrow`, `Heading` (display/h1–h4 mapped to the type scale) |
| `src/components/ui/media.tsx` | new: aspect-ratio media frame with tonal placeholder |
| `src/components/ui/grid.tsx` | new: responsive `ProductGrid` (2 → 3 → 4 cols) |
| `src/components/layout/announcement-bar.tsx`, `site-header.tsx`, `mobile-menu.tsx` (client), `site-footer.tsx` | new: shell |
| `src/components/product/product-card.tsx` | new |
| `src/app/_demo/catalog.ts` | new: temporary demo data |
| `src/app/page.tsx` | rewritten: test homepage |
| `CLAUDE.md` | add a short "Design system" section (where tokens live, the rules to follow) |

## Implementation requirements

### Tokens (`src/styles/theme.css`, Tailwind `@theme`)

- **Colors** (Tailwind utilities like `bg-paper`, `text-ink`, `border-line`):
  - `paper` #F7F5F1 (page background)
  - `surface` #EFEBE4 (image wells, tonal blocks)
  - `surface-strong` #E4DED4
  - `ink` #1A1917 (text, primary button)
  - `ink-soft` #3A3834
  - `muted` #6E6A63 (secondary text, meets AA on paper)
  - `line` #E2DDD4 (hairlines)
  - `line-strong` #C9C2B6
  - `accent` #7A2E26 (muted oxblood: sale, small highlights, focus)
  - `success` #2F5D46
  - `danger` #A1312A
  - `inverse` #FFFFFF
- **Font families:** `--font-sans` (Geist), `--font-serif` (Newsreader), `--font-mono` (Geist Mono).
- **Type scale:** fluid `clamp()` sizes with paired line-height and tracking.

  | Token | Size | Notes |
  | --- | --- | --- |
  | `text-display` | 44 → 88px | serif, leading 1.02, tracking -0.02em |
  | `text-h1` | 36 → 60px | |
  | `text-h2` | 28 → 40px | |
  | `text-h3` | 22 → 28px | |
  | `text-h4` | 18 → 20px | |
  | `text-body-lg` | 18px | |
  | `text-body` | 15px | leading 1.6 |
  | `text-small` | 13px | |
  | `text-label` | 11px | uppercase via utility, tracking 0.14em |

- **Tracking:** `--tracking-label: 0.14em`, `--tracking-tight: -0.02em`.
- **Spacing:** keep Tailwind's 4px base. Add semantic tokens:
  - `--spacing-gutter`: clamp 16 → 48px
  - `--spacing-section`: clamp 64 → 144px
  - `--spacing-section-sm`: clamp 40 → 80px
- **Containers:** `--container-page: 1440px`, `--container-narrow: 720px`.
- **Radius:** `--radius-none: 0`, `--radius-pill: 999px`.
- **Breakpoints:** Tailwind defaults (sm 640, md 768, lg 1024, xl 1280) plus `3xl: 1680px`.
- **Motion:** `--ease-out-soft: cubic-bezier(.2,.7,.2,1)`, durations 200/400ms.

### Base (`src/styles/base.css`)

- `body`: `bg-paper text-ink font-sans text-body`, antialiased.
- `h1`–`h4`: serif, normal weight, tight tracking.
- Global `a` inherits color.
- `::selection` in ink/paper.
- `:focus-visible` shows a 2px accent outline with offset on all interactive elements. Never remove focus without a replacement.
- `prefers-reduced-motion` disables transitions and transforms.

### Primitives (`src/styles/components.css`, `@utility` so variants like `md:` and `hover:` work)

- `container-page`: centered, max `--container-page`, inline padding `--spacing-gutter`. `container-narrow` is the same at narrow width.
- `section-y` / `section-y-sm`: vertical padding from the section tokens.
- `eyebrow`: `text-label`, uppercase, tracked, `text-muted`.
- `link-underline`: 1px underline offset 4px; animates from 0 → full width on hover (background-size technique); thickness constant.
- **Buttons:**
  - `btn` base: inline-flex, center, gap 8px, 0 radius, `text-label` uppercase tracked, height 48px (sm 40px, lg 56px), padding-x 28px, 1px border, 200ms color transition, disabled at 40% opacity with `cursor-not-allowed`.
  - `btn-primary`: ink fill, paper text; on hover, ink-soft fill.
  - `btn-secondary`: transparent fill, ink border; on hover, inverts to ink fill and paper text.
  - `btn-ghost`: no border, underline on hover.
  - `btn-inverse`: paper fill, ink text (for use on images).
- `field`: 48px input, 0 radius, 1px `line-strong` bottom/border, transparent bg, focus border ink.
- `hairline`: `border-line` 1px.

### React primitives (`src/components/ui/*`)

- Server components, typed props, `className` passthrough via `cn()`.
- `Button` renders `<button>`. `ButtonLink` renders `next/link`. Both share the variant/size maps.
- `Heading` takes `as` (h1–h4) separately from `size` so semantics and visuals are independent.
- `Media` takes `ratio` (`4/5` | `1/1` | `3/4` | `16/9` | `21/9`), a `tone` (one of several gradient tones built from the surface tokens), and optional `label` for `aria-label`.
- `ProductGrid` columns:

  | Viewport | Columns | Gap (x / y) |
  | --- | --- | --- |
  | Default | 2 | 12px / 40px |
  | `md` | 3 | 20px / 40px |
  | `lg` | 4 | 24px / 56px |

### Test homepage (`src/app/page.tsx`)

Sections, top to bottom:

1. **Announcement bar:** thin ink strip with a single centered label line.
2. **Header (sticky):**
   - Nav links left (desktop), wordmark "Angel Gallery" center (serif), and Search / Account / Bag (0) text links right. Bag stays visible on mobile.
   - Hairline bottom border.
   - Below `lg`, a menu button opens a full-height drawer (the only client component; Esc closes it and focus returns to the button; `aria-expanded`).
3. **Hero:**
   - Full-bleed 21:9 desktop / 4:5 mobile tonal image.
   - Overlaid, bottom-left: eyebrow, display headline (serif) and two buttons (`btn-inverse` plus a ghost link).
4. **Category row:** 3 tiles (portrait 3:4 media plus label and arrow link). A horizontal snap-scroll row on mobile, 3-column grid on desktop.
5. **New arrivals:**
   - Section header (eyebrow + h2 left, "View all" `link-underline` right).
   - `ProductGrid` of 8 `ProductCard`s.
   - Each card: 4:5 media in a `surface` well; hover crossfades to a second tone and shows a subtle 1.03 scale; name `text-small`, price `text-small text-muted` below; optional "New" / "Sold out" label in `eyebrow` style; one item shows a sale price in `accent` with the original price struck through.
6. **Editorial split:** 50/50 image + text block (stacked on mobile), serif h2, body paragraph, secondary button.
7. **Values strip:** 3 columns, hairline-divided (shipping / returns / craftsmanship), with small label + body; stacks on mobile.
8. **Newsletter:** narrow container, centered serif h3, `field` input + primary button inline on `sm+`, stacked on mobile. Visual only; no submit handler.
9. **Footer:** 4 link columns (2×2 on mobile), hairline top border, bottom row with a small © line and a type specimen link list.

Also: a **design system preview** route, `/design-system`, showing a type scale specimen, color swatches, all button variants and sizes, links, field, and a container width demo. This lets the user verify the tokens in isolation. It is linked from the footer.

## Security requirements

- No secrets, env vars or database access in any new UI code. The homepage is fully static (prerendered).
- Only the mobile menu is a client component; nothing server-only is imported into it.
- No external network assets: fonts are self-hosted, imagery is CSS only, and there are no third-party scripts.

## Acceptance criteria

- `pnpm typecheck`, `pnpm lint` and `pnpm build` pass. `/` and `/design-system` build as static (○).
- All colors, fonts, sizes and container widths come from tokens. No arbitrary hex values in components.
- Buttons, links and fields look identical wherever they are used, through shared utilities/components.
- The homepage has no horizontal scroll at 360px width. Gutters are 16px on phones and grow to 48px on wide screens.
- The product grid shows 2 / 3 / 4 columns at mobile / md / lg.
- The header collapses to a menu button below `lg`. The drawer opens and closes, closes on Esc, and is keyboard accessible.
- Focus rings are visible on all interactive elements, and text contrast meets WCAG AA.
- No copied text, logos or assets from any reference site.
- Changes are committed after the checks pass (per CLAUDE.md).

## Checks to run

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Manual test steps (after implementation)

1. `pnpm dev`, then open http://localhost:3000.
2. Scroll the homepage. Check the announcement bar, sticky header, hero, categories, product grid, editorial split, values, newsletter and footer.
3. Hover product cards (tone crossfade and slight zoom) and links (animated underline). Hover the buttons (color inversion).
4. Press Tab through the page and confirm visible focus rings.
5. Open DevTools responsive mode:
   - At **360px**: no horizontal scroll, 2-column grid, menu button visible, category row swipes.
   - At **768px**: 3 columns.
   - At **1280px+**: 4 columns, full desktop nav.
6. Open the mobile menu, press Esc, and confirm focus returns to the menu button.
7. Open http://localhost:3000/design-system and review the type scale, colors, buttons and fields.
