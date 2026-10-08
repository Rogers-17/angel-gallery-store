import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const spacings = {
  default: "section-y",
  sm: "section-y-sm",
  none: "",
} as const;

type SectionProps = ComponentProps<"section"> & {
  spacing?: keyof typeof spacings;
  /** Adds a hairline divider above the section. */
  divider?: boolean;
};

export function Section({ spacing = "default", divider, className, ...props }: SectionProps) {
  return (
    <section
      className={cn(spacings[spacing], divider && "hairline border-t", className)}
      {...props}
    />
  );
}
