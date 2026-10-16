import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { formatLrd, formatUsd } from "@/lib/money";
import { cn } from "@/lib/cn";

/**
 * Subtotal (USD + ≈ LRD), the delivery-fee line and the checkout button. Totals come from the
 * server-computed CartView; the client never sums prices.
 */
export function CartSummary({ subtotalCents, lrdPerUsd, className, onNavigate, children }: {
  subtotalCents: number;
  lrdPerUsd: number;
  className?: string;
  /** Called when Checkout is followed (the drawer closes itself). */
  onNavigate?: () => void;
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
        <ButtonLink href="/checkout" variant="primary" size="md" fullWidth onClick={onNavigate}>
          Checkout
        </ButtonLink>
        {children}
      </div>
    </div>
  );
}
