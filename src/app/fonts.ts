import localFont from "next/font/local";

export { GeistSans as sans } from "geist/font/sans";
export { GeistMono as mono } from "geist/font/mono";

// Self-hosted (no Google Fonts request): variable weight, upright + italic.
export const newsreader = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2",
      style: "italic",
    },
  ],
  weight: "200 800",
  variable: "--font-newsreader",
  display: "swap",
});

// Bold theme display serif. All axes (incl. SOFT) for the rounded heavy look.
// Not preloaded: only downloaded when the Bold theme is active.
export const fraunces = localFont({
  src: "../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2",
  weight: "100 900",
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
});
