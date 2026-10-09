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
