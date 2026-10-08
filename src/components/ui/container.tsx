import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const widths = {
  page: "container-page",
  narrow: "container-narrow",
  full: "w-full",
} as const;

type ContainerProps = ComponentProps<"div"> & {
  width?: keyof typeof widths;
};

export function Container({ width = "page", className, ...props }: ContainerProps) {
  return <div className={cn(widths[width], className)} {...props} />;
}
