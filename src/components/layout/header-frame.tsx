"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Transparent header over the homepage hero; solid sticky header everywhere else. */
export function HeaderFrame({ children }: { children: ReactNode }) {
  const overHero = usePathname() === "/";

  return (
    <header
      className={cn(
        "z-40 w-full",
        overHero
          ? "absolute inset-x-0 top-0 text-cream"
          : "hairline sticky top-0 border-b bg-paper/95 text-ink backdrop-blur-sm",
      )}
    >
      {children}
    </header>
  );
}
