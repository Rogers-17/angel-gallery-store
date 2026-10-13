import localFont from "next/font/local";

export { GeistSans as sans } from "geist/font/sans";
export { GeistMono as mono } from "geist/font/mono";

// Display serif, self-hosted (no Google Fonts request). Full axes incl. SOFT for the
// rounded heavy headings.
export const fraunces = localFont({
  src: "../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2",
  weight: "100 900",
  variable: "--font-fraunces",
  display: "swap",
});
