import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/** Design A (Editorial) shell: homepage and design-system reference. */
export default function EditorialLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar>Complimentary shipping on orders over $150</AnnouncementBar>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
