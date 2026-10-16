import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderSummary, type SummaryLine } from "@/components/checkout/order-summary";
import { Breadcrumb } from "@/components/product/pdp/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { getCart } from "@/db/queries/cart";
import { getStoreSettings } from "@/db/queries/settings";
import type { CartView, StoreSettingsData } from "@/db/queries/types";
import { formatRate, formatUsd } from "@/lib/money";
import { paymentMethodLabels, paymentMethods, paymentMethodSummaries } from "@/lib/orders/labels";
import { newIdempotencyKey } from "@/lib/orders/token";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

const rateDateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function CheckoutPage() {
  return (
    <main className="flex-1">
      <Container className="pt-8 pb-section">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Bag", href: "/cart" }, { label: "Checkout" }]} />
        <Heading as="h1" size="h1" className="mt-5">Checkout</Heading>
        {/* The bag comes from a cookie, so the form and summary stream in at request time. */}
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutContents />
        </Suspense>
      </Container>
    </main>
  );
}

/** Lines that can't be ordered as they stand (same wording as the placeOrder action). */
function cartProblems(cart: CartView): string[] {
  return cart.lines.flatMap((line) => {
    const name = `${line.productName} (${line.color} / ${line.size})`;
    if (!line.available) return [`${name} is no longer available or sold out.`];
    if (line.quantity > line.maxQuantity) return [`${name}: only ${line.maxQuantity} available.`];
    return [];
  });
}

async function CheckoutContents() {
  const [cart, settings] = await Promise.all([getCart(), getStoreSettings()]);

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-card bg-surface px-6 py-16 text-center">
        <Heading as="h2" size="h3">Your Bag Is Empty</Heading>
        <p className="mt-3 max-w-md text-small text-muted">Add a few pieces before checking out.</p>
        <ButtonLink href="/shop" variant="primary" size="md" className="mt-6">Start shopping</ButtonLink>
      </div>
    );
  }

  // Request-time (after the cookie read): a fresh key per checkout visit.
  const idempotencyKey = newIdempotencyKey();
  const paymentOptions = paymentMethods.map((method) => ({
    value: method,
    label: settings.paymentInstructions[method]?.label || paymentMethodLabels[method],
    summary: paymentMethodSummaries[method],
  }));

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-12">
      <details className="group/summary rounded-card bg-surface lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-small [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 font-medium">
            Order summary ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})
            <Chevron />
          </span>
          <span className="font-semibold tabular-nums">{formatUsd(cart.subtotalCents)}</span>
        </summary>
        <div className="px-5 pb-5">
          <CheckoutSummary cart={cart} settings={settings} />
        </div>
      </details>

      <CheckoutForm idempotencyKey={idempotencyKey} paymentOptions={paymentOptions} problems={cartProblems(cart)} />

      <aside aria-label="Order summary" className="hidden rounded-card bg-surface p-6 lg:sticky lg:top-28 lg:block">
        <h2 className="mb-5 font-display text-h4 font-heading">Summary</h2>
        <CheckoutSummary cart={cart} settings={settings} />
      </aside>
    </div>
  );
}

function CheckoutSummary({ cart, settings }: { cart: CartView; settings: StoreSettingsData }) {
  const lines: SummaryLine[] = cart.lines
    .filter((line) => line.available)
    .map((line) => ({
      key: line.variantId,
      productName: line.productName,
      color: line.color,
      size: line.size,
      quantity: Math.min(line.quantity, line.maxQuantity),
      lineTotalCents: line.lineTotalCents,
      image: line.image,
    }));

  return (
    <OrderSummary
      lines={lines}
      subtotalCents={cart.subtotalCents}
      deliveryFeeCents={null}
      totalCents={cart.subtotalCents}
      lrdPerUsd={settings.lrdPerUsd}
      totalLabel="Total today"
      footer={
        <>
          <Link href="/cart" className="link-inline self-start text-small text-ink">Edit bag</Link>
          <p>
            LRD at {formatRate(settings.lrdPerUsd)} per $1 (updated{" "}
            {rateDateFormatter.format(new Date(settings.lrdRateUpdatedAt))}).
          </p>
        </>
      }
    />
  );
}

function Chevron() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="transition-transform group-open/summary:rotate-180">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckoutSkeleton() {
  const block = "animate-pulse rounded-control bg-surface";
  return (
    <div aria-busy="true" aria-label="Loading checkout" className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
      <div className="flex flex-col gap-6">
        <div className={`${block} h-7 w-48`} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className={`${block} h-11`} />
          <div className={`${block} h-11`} />
        </div>
        <div className={`${block} h-11`} />
        <div className={`${block} mt-4 h-7 w-56`} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`${block} h-24 rounded-card`} />
          <div className={`${block} h-24 rounded-card`} />
        </div>
      </div>
      <div className={`${block} hidden h-80 rounded-card lg:block`} />
    </div>
  );
}
