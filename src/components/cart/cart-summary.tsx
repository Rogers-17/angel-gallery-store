import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { formatLrd, formatUsd } from "@/lib/money";
import { cn } from "@/lib/cn";

/**
 * Subtotal (USD + ≈ LRD), the delivery-fee line and the checkout button. Totals come from the
 * server-computed CartView; the client never sums prices. Checkout is disabled until Phase 4.
 */
export function CartSummary({ subtotalCents, lrdPerUsd, className, children }: {
  subtotalCents: number;
  lrdPerUsd: number;
  className?: string;
  /** Extra actions or notes under the checkout button. */
  children?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <span className="text-small font-medium">Subtotal</span>
        <div className="text-right">
          <p className="text-price font-semibold tabular-nums">{formatUsd(subtotalCents)}</p>
          <p className="text-caption text-muted tabular-nums">≈ {formatLrd(subtotalCents, lrdPerUsd)}</p>
        </div>
      </div>
      <p className="text-caption text-muted">Delivery fee: agreed on WhatsApp</p>
      <div className="flex flex-col gap-2">
        {/* Phase 4 replaces this with a link to /checkout. */}
        <Button variant="primary" size="md" fullWidth disabled>
          Checkout
        </Button>
        <p className="text-center text-caption text-muted">Checkout opens soon</p>
        {children}
      </div>
    </div>
  );
}
