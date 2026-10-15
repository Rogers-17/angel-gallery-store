"use client";

import { lineCap } from "@/lib/cart/limits";

const MIN = 1;

/** Quantity stepper (controlled), capped at the selected variant's stock and the cart's per-line limit. */
export function Quantity({ value, onChange, max = 10, disabled }: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
}) {
  const limit = Math.max(MIN, lineCap(max));
  const button =
    "flex size-11 items-center justify-center text-h4 transition-colors hover:bg-surface disabled:opacity-40";

  return (
    <div className="flex items-center gap-4">
      <span id="quantity-label" className="text-small font-medium">Quantity</span>
      <div role="group" aria-labelledby="quantity-label" className="flex items-center overflow-hidden rounded-control border border-line">
        <button type="button" aria-label="Decrease quantity" className={button} disabled={disabled || value <= MIN} onClick={() => onChange(Math.max(MIN, value - 1))}>
          −
        </button>
        <output aria-live="polite" className="w-10 text-center text-body tabular-nums">{value}</output>
        <button type="button" aria-label="Increase quantity" className={button} disabled={disabled || value >= limit} onClick={() => onChange(Math.min(limit, value + 1))}>
          +
        </button>
      </div>
    </div>
  );
}
