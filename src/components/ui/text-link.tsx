import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type TextLinkProps = ComponentProps<typeof Link> & {
  /** "hover": underline grows on hover (nav, CTAs). "inline": always underlined (body copy). */
  underline?: "hover" | "inline";
};

export function TextLink({ underline = "hover", className, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn(underline === "hover" ? "link-underline" : "link-inline", className)}
      {...props}
    />
  );
}
