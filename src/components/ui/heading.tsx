import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const sizes = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
} as const;

type HeadingProps = ComponentProps<"h2"> & {
  /** Semantic level, independent of visual size. */
  as?: "h1" | "h2" | "h3" | "h4";
  size?: keyof typeof sizes;
};

export function Heading({ as: Tag = "h2", size, className, ...props }: HeadingProps) {
  return <Tag className={cn("font-serif", sizes[size ?? Tag], className)} {...props} />;
}

export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("eyebrow text-muted", className)} {...props} />;
}
