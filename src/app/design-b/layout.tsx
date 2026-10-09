import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DesignBFooter } from "@/components/design-b/site-footer";
import { DesignBHeader } from "@/components/design-b/site-header";

export const metadata: Metadata = {
  title: {
    default: "Design B · Angel Gallery Store",
    template: "%s · Angel Gallery Store",
  },
};

/** Design B review shell. `.design-b` scopes its tokens (src/styles/design-b.css). */
export default function DesignBLayout({ children }: { children: ReactNode }) {
  return (
    <div className="design-b relative flex flex-1 flex-col">
      <DesignBHeader />
      {children}
      <DesignBFooter />
    </div>
  );
}
