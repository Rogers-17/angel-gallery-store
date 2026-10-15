"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { removeCartLine, updateCartLine } from "@/app/actions/cart";
import type { CartLine } from "@/db/queries/types";
import { Media } from "@/components/ui/media";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/cn";
import { formatUsd } from "@/lib/money";

type CartLinesProps = {
  lines: CartLine[];
  lrdPerUsd: number;
  /** "drawer": compact rows; "page": larger images and touch targets. */
  variant?: "drawer" | "page";
  /** Called when a product link is followed (the drawer closes itself). */
  onNavigate?: () => void;
};

/**
 * Cart line items. Each line is one <form>: − / + submit the new quantity, Remove submits to
 * removeCartLine. Plain form actions, so they work before hydration.
 */
export function CartLines({ lines, lrdPerUsd, variant = "drawer", onNavigate }: CartLinesProps) {
  return (
    <ul className="divide-y divide-line">
      {lines.map((line) => (
        <li key={line.variantId} className="py-5 first:pt-0 last:pb-0">
          <form action={updateCartLine}>
            <input type="hidden" name="variantId" value={line.variantId} />
            <LineBody line={line} lrdPerUsd={lrdPerUsd} variant={variant} onNavigate={onNavigate} />
          </form>
        </li>
      ))}
    </ul>
  );
}

function LineBody({ line, lrdPerUsd, variant, onNavigate }: {
  line: CartLine;
  lrdPerUsd: number;
  variant: "drawer" | "page";
  onNavigate?: () => void;
}) {
  const { pending } = useFormStatus();
  const href = `/products/${line.productSlug}`;
  const shown = line.available ? Math.min(line.quantity, line.maxQuantity) : line.quantity;
  const page = variant === "page";

  return (
    <div aria-busy={pending} className={cn("flex gap-4 transition-opacity", pending && "opacity-60")}>
      <Link href={href} onClick={onNavigate} tabIndex={-1} aria-hidden className={cn("shrink-0", page ? "w-24" : "w-18")}>
        <Media
          ratio="1/1"
          surface="well"
          radius="control"
          src={line.image?.url}
          objectPosition={line.image?.objectPosition ?? undefined}
          sizes={page ? "96px" : "72px"}
          className={line.available ? undefined : "opacity-60"}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={href}
              onClick={onNavigate}
              className="block truncate text-small font-medium hover:underline hover:underline-offset-4"
            >
              {line.productName}
            </Link>
            <p className="text-caption text-muted">
              {line.color} / {line.size}
            </p>
          </div>
          <p className="shrink-0 text-small font-semibold tabular-nums">
            {line.available ? formatUsd(line.lineTotalCents) : "—"}
          </p>
        </div>

        <Price cents={line.unitPriceCents} compareAtCents={line.compareAtCents} lrdPerUsd={lrdPerUsd} size="line" />

        {!line.available ? (
          <Notice>No longer available</Notice>
        ) : line.quantity > line.maxQuantity ? (
          <Notice>Only {line.maxQuantity} available</Notice>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          {line.available && (
            <Stepper name={line.productName} value={shown} max={line.maxQuantity} disabled={pending} large={page} />
          )}
          <button
            type="submit"
            formAction={removeCartLine}
            disabled={pending}
            className="link-inline text-caption text-muted disabled:opacity-50"
          >
            Remove<span className="sr-only"> {line.productName}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return <p className="text-caption font-medium text-danger">{children}</p>;
}

function Stepper({ name, value, max, disabled, large }: {
  name: string;
  value: number;
  max: number;
  disabled: boolean;
  large: boolean;
}) {
  const button = cn(
    "flex items-center justify-center transition-colors hover:bg-surface disabled:opacity-40 disabled:hover:bg-transparent",
    large ? "size-11" : "size-9",
  );
  return (
    <div role="group" aria-label={`Quantity of ${name}`} className="flex items-center overflow-hidden rounded-control border border-line">
      <button
        type="submit"
        name="quantity"
        value={value - 1}
        disabled={disabled || value <= 1}
        aria-label={`Decrease quantity of ${name}`}
        className={button}
      >
        −
      </button>
      <output aria-live="polite" className="w-8 text-center text-small tabular-nums">{value}</output>
      <button
        type="submit"
        name="quantity"
        value={value + 1}
        disabled={disabled || value >= max}
        aria-label={`Increase quantity of ${name}`}
        className={button}
      >
        +
      </button>
    </div>
  );
}
