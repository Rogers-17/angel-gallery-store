import type { ReactNode } from "react";
import type { ImageData } from "@/db/queries/types";
import { Media } from "@/components/ui/media";
import { cn } from "@/lib/cn";
import { formatLrd, formatUsd } from "@/lib/money";

export type SummaryLine = {
  key: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  lineTotalCents: number;
  image: ImageData | null;
};

type OrderSummaryProps = {
  lines: SummaryLine[];
  subtotalCents: number;
  /** Null: "Agreed on WhatsApp". */
  deliveryFeeCents: number | null;
  totalCents: number;
  lrdPerUsd: number;
  /** "Total today" at checkout, "Total" on a placed order. */
  totalLabel: string;
  /** Links or notes under the totals. */
  footer?: ReactNode;
  className?: string;
};

/**
 * Compact order lines and totals, used by /checkout (live cart) and the order page (snapshot).
 * All amounts come from the server.
 */
export function OrderSummary({ lines, subtotalCents, deliveryFeeCents, totalCents, lrdPerUsd, totalLabel, footer, className }: OrderSummaryProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <ul className="divide-y divide-line">
        {lines.map((line) => (
          <li key={line.key} className="flex items-center gap-4 py-3 first:pt-0">
            <div className="relative w-14 shrink-0">
              <Media
                ratio="1/1"
                surface="well"
                radius="control"
                src={line.image?.url}
                alt=""
                objectPosition={line.image?.objectPosition ?? undefined}
                sizes="56px"
              />
              <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-pill bg-ink text-label leading-none text-cream tabular-nums">
                <span className="sr-only">Quantity </span>
                {line.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-small font-medium">{line.productName}</p>
              <p className="text-caption text-muted">
                {line.color} / {line.size}
              </p>
            </div>
            <p className="shrink-0 text-small tabular-nums">{formatUsd(line.lineTotalCents)}</p>
          </li>
        ))}
      </ul>

      <dl className="hairline mt-4 flex flex-col gap-3 border-t pt-4 text-small">
        <div className="flex items-start justify-between gap-4">
          <dt>Subtotal</dt>
          <dd className="text-right">
            <span className="block font-semibold tabular-nums">{formatUsd(subtotalCents)}</span>
            <span className="block text-caption text-muted tabular-nums">≈ {formatLrd(subtotalCents, lrdPerUsd)}</span>
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt>Delivery fee</dt>
          <dd className={cn("text-right", deliveryFeeCents == null ? "text-muted" : "tabular-nums")}>
            {deliveryFeeCents == null ? "Agreed on WhatsApp" : formatUsd(deliveryFeeCents)}
          </dd>
        </div>
        <div className="hairline flex items-start justify-between gap-4 border-t pt-3">
          <dt className="font-medium">{totalLabel}</dt>
          <dd className="text-right">
            <span className="block text-price font-semibold tabular-nums">{formatUsd(totalCents)}</span>
            <span className="block text-caption text-muted tabular-nums">≈ {formatLrd(totalCents, lrdPerUsd)}</span>
          </dd>
        </div>
      </dl>

      {footer && <div className="mt-4 flex flex-col gap-2 text-caption text-muted">{footer}</div>}
    </div>
  );
}
