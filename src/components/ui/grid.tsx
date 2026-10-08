import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Product listing grid: 2 columns on phones, 3 on tablets, 4 on desktop. */
export function ProductGrid({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14",
        className,
      )}
      {...props}
    />
  );
}
