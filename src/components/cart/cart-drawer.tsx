"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CartView } from "@/db/queries/types";
import { BagIcon } from "@/components/layout/icons";
import { ButtonLink } from "@/components/ui/button";
import { CartLines } from "./cart-lines";
import { CartSummary } from "./cart-summary";
import { useCartUI } from "./cart-ui-provider";
import { bagIconClass } from "./styles";

const DRAWER_ID = "cart-drawer";

/**
 * Header bag button + right-hand cart drawer (native <dialog>: focus trap, Esc, focus return).
 * The trigger is a real link to /cart, so it still works before hydration.
 */
export function CartDrawer({ cart, lrdPerUsd }: { cart: CartView | null; lrdPerUsd: number }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isOpen, open, close } = useCartUI();
  const count = cart?.itemCount ?? 0;
  const lines = cart?.lines ?? [];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <>
      <Link
        href="/cart"
        aria-label={count > 0 ? `Bag, ${count} ${count === 1 ? "item" : "items"}` : "Bag, empty"}
        aria-haspopup="dialog"
        aria-controls={DRAWER_ID}
        onClick={(event) => {
          event.preventDefault();
          open();
        }}
        className={bagIconClass}
      >
        <BagIcon />
        {count > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-pill bg-primary text-label leading-none text-primary-fg">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Link>

      <dialog
        id={DRAWER_ID}
        ref={dialogRef}
        aria-labelledby="cart-drawer-title"
        onClose={close}
        onClick={(event) => event.target === dialogRef.current && close()}
        className="m-0 ml-auto h-dvh max-h-none w-[min(26rem,92vw)] max-w-none bg-paper text-ink backdrop:bg-ink/40 open:flex open:flex-col"
      >
        <div className="hairline flex h-header shrink-0 items-center justify-between border-b px-gutter">
          <h2 id="cart-drawer-title" className="font-display text-h4 font-heading">
            Your Bag{" "}
            <span aria-live="polite" className="font-sans text-small font-normal text-muted">
              ({count})
            </span>
          </h2>
          <button type="button" onClick={close} className="-mr-2 h-11 px-2 text-small font-medium">
            Close
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-gutter text-center">
            <p className="font-display text-h4 font-heading">Your bag is empty</p>
            <p className="mt-2 text-small text-muted">Pieces you add will appear here.</p>
            <ButtonLink href="/shop" variant="primary" size="md" className="mt-6" onClick={close}>
              Start shopping
            </ButtonLink>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-gutter py-6">
              <CartLines lines={lines} lrdPerUsd={lrdPerUsd} onNavigate={close} />
            </div>
            <div className="hairline shrink-0 border-t bg-paper px-gutter py-5">
              <CartSummary subtotalCents={cart?.subtotalCents ?? 0} lrdPerUsd={lrdPerUsd} onNavigate={close}>
                <ButtonLink href="/cart" variant="secondary" size="md" fullWidth onClick={close}>
                  View bag
                </ButtonLink>
              </CartSummary>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
