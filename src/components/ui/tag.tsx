import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Small category pill (beige fill, brown text). */
export function Tag({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("tag", className)} {...props} />;
}
