import type { Metadata } from "next";
import { fraunces, mono, newsreader, sans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Angel Gallery Store",
  description: "Considered objects and clothing, curated by Angel Gallery.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${newsreader.variable} ${fraunces.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
