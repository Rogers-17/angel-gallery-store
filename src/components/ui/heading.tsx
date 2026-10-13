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

/** Display-serif heading. Use Title Case for headings. */
export function Heading({ as: Tag = "h2", size, className, ...props }: HeadingProps) {
  return <Tag className={cn("font-display", sizes[size ?? Tag], className)} {...props} />;
}

type SectionHeaderProps = {
  id?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
};

/** Section title with a short muted subtitle. Centred by default. */
export function SectionHeader({ id, title, subtitle, align = "center", className }: SectionHeaderProps) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-xl text-center", className)}>
      <Heading id={id} size="h2">{title}</Heading>
      {subtitle && <p className="mt-3 text-small text-muted">{subtitle}</p>}
    </div>
  );
}
