"use client";

import { createContext, type ReactNode, use, useMemo, useState } from "react";

type CartUI = { isOpen: boolean; open: () => void; close: () => void };

const CartUIContext = createContext<CartUI | null>(null);

/** Holds only whether the cart drawer is open, so any Add to Cart button can open it. */
export function CartUIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const value = useMemo(() => ({ isOpen, open: () => setOpen(true), close: () => setOpen(false) }), [isOpen]);
  return <CartUIContext value={value}>{children}</CartUIContext>;
}

export function useCartUI(): CartUI {
  const value = use(CartUIContext);
  if (!value) throw new Error("useCartUI must be used inside <CartUIProvider>.");
  return value;
}
