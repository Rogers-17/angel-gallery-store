"use client";

import { useState, useTransition } from "react";
import { addToCart, buyNow, type CartActionResult } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useCartUI } from "./cart-ui-provider";

type AddToCartButtonsProps = {
  /** Variant to add; null while nothing purchasable is selected. */
  variantId: string | null;
  quantity?: number;
  soldOut?: boolean;
  size?: "sm" | "lg";
  /** Grid classes for the two buttons (layout differs between card and product page). */
  className?: string;
};

/** "Add to Cart" (opens the drawer) and "Buy Now" (adds, then goes to the bag), with pending and error states. */
export function AddToCartButtons({ variantId, quantity = 1, soldOut, size = "lg", className }: AddToCartButtonsProps) {
  const { open } = useCartUI();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<"add" | "buy" | null>(null);
  const [result, setResult] = useState<CartActionResult | null>(null);
  const disabled = soldOut || !variantId || pending;

  function run(kind: "add" | "buy") {
    if (!variantId) return;
    setActive(kind);
    setResult(null);
    startTransition(async () => {
      const input = { variantId, quantity };
      const next = kind === "add" ? await addToCart(input) : await buyNow(input);
      setResult(next);
      if (next.ok && kind === "add") open();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("grid gap-2", className)}>
        <Button variant="secondary" size={size} disabled={disabled} onClick={() => run("add")}>
          {pending && active === "add" ? "Adding…" : "Add to Cart"}
        </Button>
        <Button variant="primary" size={size} disabled={disabled} onClick={() => run("buy")}>
          {soldOut ? "Sold Out" : pending && active === "buy" ? "Adding…" : "Buy Now"}
        </Button>
      </div>
      <p role="status" className={cn("text-caption", result?.ok === false ? "text-danger" : "text-muted")}>
        {result ? (result.ok ? result.message : result.error) : null}
      </p>
    </div>
  );
}
