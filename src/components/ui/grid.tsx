import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Product listing grid: 2 columns on phones and tablets, 3 on desktop. */
export function ProductGrid({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      className={cn("grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3 lg:gap-x-6", className)}
      {...props}
    />
  );
}
