"use client";

import { useMemo, useState } from "react";
import type { VariantData } from "@/db/queries/types";
import { AddToCartButtons } from "@/components/cart/add-to-cart-buttons";
import { HeartIcon } from "@/components/layout/icons";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/cn";
import { Quantity } from "./quantity";

type VariantPickerProps = {
  variants: VariantData[];
  /** Liberian dollars per 1 USD, for the ≈ LRD line. */
  lrdPerUsd: number;
};

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => (seen.has(key(item)) ? false : (seen.add(key(item)), true)));
}

function stockLabel(stock: number) {
  if (stock <= 0) return { text: "Sold out", tone: "text-danger" };
  if (stock <= 3) return { text: `Only ${stock} left`, tone: "text-primary" };
  return { text: "In stock", tone: "text-success" };
}

/**
 * Colour + size selection driven by real variants. Price, stock, SKU, quantity and the cart
 * actions follow the selected variant; the server re-checks stock when adding.
 */
export function VariantPicker({ variants, lrdPerUsd }: VariantPickerProps) {
  const colors = useMemo(() => uniqueBy(variants, (v) => v.color), [variants]);
  const sizes = useMemo(() => uniqueBy(variants, (v) => v.size).map((v) => v.size), [variants]);
  const singleSize = sizes.length === 1;

  const find = (color: string, size: string) => variants.find((v) => v.color === color && v.size === size);
  const firstAvailable = (color: string) =>
    variants.find((v) => v.color === color && v.stock > 0) ?? variants.find((v) => v.color === color);

  const initial = variants.find((v) => v.stock > 0) ?? variants[0];
  const [color, setColor] = useState(initial.color);
  const [size, setSize] = useState(initial.size);
  const [quantity, setQuantity] = useState(1);
  const selected = find(color, size) ?? firstAvailable(color) ?? initial;
  const soldOut = selected.stock <= 0;
  const stock = stockLabel(selected.stock);

  function chooseColor(next: string) {
    setColor(next);
    setQuantity(1);
    const keep = find(next, size);
    if (!keep || keep.stock <= 0) {
      const fallback = firstAvailable(next);
      if (fallback) setSize(fallback.size);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <Price cents={selected.priceCents} compareAtCents={selected.compareAtCents} lrdPerUsd={lrdPerUsd} size="pdp" />
        <p className="mt-2 flex flex-wrap items-center gap-x-3 text-small">
          <span className={cn("font-medium", stock.tone)}>{stock.text}</span>
          <span className="text-muted">SKU {selected.sku}</span>
        </p>
      </div>

      <fieldset>
        <legend className="text-small font-medium">
          Colour: <span className="font-normal text-muted">{color}</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {colors.map((option) => {
            const active = option.color === color;
            const anyStock = variants.some((v) => v.color === option.color && v.stock > 0);
            return (
              <button
                key={option.color}
                type="button"
                aria-pressed={active}
                onClick={() => chooseColor(option.color)}
                className={cn(
                  "flex items-center gap-2 rounded-pill border py-1 pr-3 pl-1 text-small transition-colors",
                  active ? "border-ink" : "border-line hover:border-line-strong",
                  !anyStock && "text-muted",
                )}
              >
                <span
                  aria-hidden
                  className="size-6 rounded-pill border border-ink/15"
                  // Swatch colours are product data, not design tokens.
                  style={{ backgroundColor: option.colorHex }}
                />
                {option.color}
                {!anyStock && <span className="sr-only"> (sold out)</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <div className="flex items-baseline justify-between">
          <legend className="text-small font-medium">Size</legend>
          {!singleSize && <span className="text-small text-muted underline underline-offset-4">Size guide</span>}
        </div>
        <div className={cn("mt-3 grid gap-2", singleSize ? "grid-cols-1" : "grid-cols-4 sm:grid-cols-5")}>
          {sizes.map((option) => {
            const variant = find(color, option);
            const unavailable = !variant || variant.stock <= 0;
            const active = option === selected.size;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                disabled={unavailable}
                onClick={() => {
                  setSize(option);
                  setQuantity(1);
                }}
                className={cn(
                  "flex h-11 items-center justify-center rounded-control border text-small transition-colors",
                  active ? "border-ink bg-ink text-paper" : "border-line hover:border-line-strong",
                  unavailable && "cursor-not-allowed border-line text-muted line-through opacity-60 hover:border-line",
                )}
              >
                {option}
                {unavailable && <span className="sr-only"> (sold out)</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Quantity value={quantity} onChange={setQuantity} max={selected.stock} disabled={soldOut} />

      <div className="flex items-start gap-2">
        <div className="flex-1">
          <AddToCartButtons
            variantId={soldOut ? null : selected.id}
            quantity={Math.min(quantity, Math.max(1, selected.stock))}
            soldOut={soldOut}
            className="sm:grid-cols-2"
          />
        </div>
        {/* Wishlist is visual only until roadmap Phase 8. */}
        <Button variant="secondary" size="lg" aria-label="Add to wishlist" className="w-14 shrink-0 px-0!">
          <HeartIcon />
        </Button>
      </div>
    </div>
  );
}
