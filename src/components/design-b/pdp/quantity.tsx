"use client";

import { useState } from "react";

const MIN = 1;
const MAX = 10;

export function Quantity() {
  const [value, setValue] = useState(MIN);
  const button =
    "flex size-11 items-center justify-center text-h4 transition-colors hover:bg-surface disabled:opacity-40";

  return (
    <div className="flex items-center gap-4">
      <span id="quantity-label" className="text-small font-medium">Quantity</span>
      <div role="group" aria-labelledby="quantity-label" className="flex items-center overflow-hidden rounded-control border border-line">
        <button type="button" aria-label="Decrease quantity" className={button} disabled={value <= MIN} onClick={() => setValue((v) => Math.max(MIN, v - 1))}>
          −
        </button>
        <output aria-live="polite" className="w-10 text-center text-body tabular-nums">{value}</output>
        <button type="button" aria-label="Increase quantity" className={button} disabled={value >= MAX} onClick={() => setValue((v) => Math.min(MAX, v + 1))}>
          +
        </button>
      </div>
    </div>
  );
}
