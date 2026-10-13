import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { fraunces, mono, sans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Angel Gallery Store",
    template: "%s · Angel Gallery Store",
  },
  description: "Shoes, bags and clothing from independent makers, curated by Angel Gallery.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${fraunces.variable} h-full`}>
      <body className="relative flex min-h-full flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
