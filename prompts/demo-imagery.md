# Demo imagery (Unsplash)

## Goal

Replace the tonal placeholder blocks on the test homepage with real photography from Unsplash, so the user can judge how the design system looks with images. Keep the design system unchanged. Images are demo content only.

## Research

- Unsplash's site and its unofficial search API block scripted access (bot challenge / "Authorization required"). The official API needs an access key, which we don't have.
- Individual photos were found through web search. Each photo's `unsplash.com/photos/{id}/download` link redirects to the CDN file for **free** photos and returns 403 for paid Unsplash+ photos, which filters out unlicensed images.
- About 30 candidates were downloaded at preview size and reviewed visually. Rejected:
  - Visible brand logos or text: a desk shot with branded keyboard and card, a "Happy birthday" letter board, branded loafers.
  - Off-palette or busy shots: a yellow satin street shot, a dark kitchen scene.
- License: [Unsplash License](https://unsplash.com/license). Free for commercial use, no attribution required. We still credit photographers in a credits file.

## Selected photos (13)

| Slot | Unsplash ID | Subject | Shown as |
| --- | --- | --- | --- |
| Hero | `z6Yn9hhlrJw` | Neutral living room, cream sofa, travertine table | Hero (21:9 desktop / 4:5 mobile) |
| Category: Clothing | `pkOSF1frs1g` | Minimal boutique, clothing rack | 3:4 tile |
| Category: Objects | `SITGdvztUdg` | Stacked white porcelain bowls | 3:4 tile |
| Category: Accessories | `mqbT8xBcGFA` | Black leather pouch on open book | 3:4 tile |
| Product 1 | `FPjFcX8ZCa4` | Camel wool coat (model) | Oversized Wool Coat, Camel |
| Product 2 | `O4uZbwuta8w` | Beige trench (model) | Cotton Trench, Sand |
| Product 3 | `mU88MlEFcoU` | Ecru ribbed knit | Ribbed Wool Sweater, Ecru |
| Product 4 | `WfEoXGtlQ6E` | White shirt on hanger | Cotton Poplin Shirt, Chalk |
| Product 5 | `l0ah3UBLppo` | Cobalt glazed bud vase | Glazed Bud Vase, Cobalt |
| Product 6 | `04pszRu0g68` | Speckled stoneware bowls | Speckled Bowls (set of 4), sale price |
| Product 7 | `NLcLjLNUJbY` | Stoneware bottle and cups | Sake Set, Ash glaze (Sold out) |
| Product 8 | `MqOGVcLcJ3E` | Black leather bifold wallet | Leather Bifold Wallet, Black |
| Journal | `BFBikYWtA9c` | Hands throwing a pot on a wheel | Editorial split (4:5 crop) |

## Existing code inspected

- `src/components/ui/media.tsx`: tonal placeholder frame (`ratio`, `tone`, `hoverTone`, `label`)
- `src/components/product/product-card.tsx`: uses `Media` with tone + hoverTone
- `src/app/_demo/catalog.ts`: demo products and categories
- `src/app/page.tsx`: hero, categories, new in, journal use `Media`
- `pnpm-workspace.yaml`: `sharp` is in `ignoredBuiltDependencies` (image optimization still works from sharp's prebuilt binaries; to verify)

## Decisions

1. **Self-host the images.** Download them once into `public/images/demo/` (hero about 2400px wide, everything else about 1200px). Do not hot-link the Unsplash CDN, because this network is unreliable for external requests and this keeps dev and build offline.
2. **Use `next/image`** (`fill` + `sizes` + `object-cover`) inside `Media`, so we get responsive sizes and lazy loading. The hero gets `priority`.
3. **`Media` gains optional `src` and `alt` props.**
   - With `src`, it renders the photo over the tone background (the tone shows while loading).
   - Without `src`, it keeps today's tonal placeholder, so `/design-system` and future empty states still work.
   - On hover, image cards zoom slightly (1.03). The second-tone crossfade is placeholder-only.
4. **Demo names and details follow the photos.** All copy stays original.
5. **Credits:** add `public/images/demo/CREDITS.md` listing each file, photographer and Unsplash URL.
6. **All demo assets stay clearly separated** (`_demo/`, `images/demo/`), to be deleted when real products exist.

## Files likely to change

- `public/images/demo/*.jpg` (13 new) + `public/images/demo/CREDITS.md`
- `src/components/ui/media.tsx`: optional `src`, `alt`, `sizes`, `priority`, `objectPosition`
- `src/components/product/product-card.tsx`: pass the image through
- `src/app/_demo/catalog.ts`: `image` fields, names updated to match photos, hero/category/journal image paths
- `src/app/page.tsx`: pass images to the hero, categories and journal
- `CLAUDE.md`: note that demo images live in `public/images/demo/`

## Security requirements

- No runtime requests to third-party hosts. All images are served from `public/`.
- No API keys or new env vars.

## Acceptance criteria

- The homepage shows real photos in the hero, the 3 category tiles, all 8 product cards and the journal block.
- Images are cropped cleanly at their ratios on mobile and desktop, and the hero text stays readable over the photo.
- `/design-system` still shows the tonal placeholders.
- `pnpm typecheck`, `pnpm lint` and `pnpm build` pass. Pages stay static.
- Committed after the checks pass.

## Checks to run

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Manual test steps

1. Restart `pnpm dev` (required anyway after the previous PostCSS change), then open http://localhost:3000.
2. Confirm photos appear in the hero, the categories, the product grid and the journal section.
3. Hover a product (slight zoom). Resize to 360px, 768px and 1280px and check the crops.
4. Open http://localhost:3000/design-system and confirm the tonal placeholders still render.
