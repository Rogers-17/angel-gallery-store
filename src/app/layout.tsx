import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { mono, newsreader, sans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Angel Gallery Store",
  description: "Considered objects and clothing, curated by Angel Gallery.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${newsreader.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <AnnouncementBar>Complimentary shipping on orders over $150</AnnouncementBar>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
