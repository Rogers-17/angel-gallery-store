import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CartLines } from "@/components/cart/cart-lines";
import { CartSummary } from "@/components/cart/cart-summary";
import { Breadcrumb } from "@/components/product/pdp/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { getCart } from "@/db/queries/cart";
import { getCategories } from "@/db/queries/catalog";
import { getStoreSettings } from "@/db/queries/settings";
import { formatRate } from "@/lib/money";

export const metadata: Metadata = {
  title: "Your Bag",
  robots: { index: false, follow: false },
};

const rateDateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function CartPage() {
  return (
    <main className="flex-1">
      <Container className="pt-8 pb-section">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Bag" }]} />
        <Heading as="h1" size="h1" className="mt-5">Your Bag</Heading>
        {/* The cart comes from a cookie, so it streams in at request time. */}
        <Suspense fallback={<CartSkeleton />}>
          <CartContents />
        </Suspense>
      </Container>
    </main>
  );
}

async function CartContents() {
  const [cart, settings, categories] = await Promise.all([getCart(), getStoreSettings(), getCategories()]);

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-card bg-surface px-6 py-16 text-center">
        <Heading as="h2" size="h3">Your Bag Is Empty</Heading>
        <p className="mt-3 max-w-md text-small text-muted">Pieces you add will appear here.</p>
        <ButtonLink href="/shop" variant="primary" size="md" className="mt-6">Start shopping</ButtonLink>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/shop/${c.slug}`} className="btn btn-outline btn-sm btn-pill">{c.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-12">
      <section aria-label="Items in your bag">
        <p className="mb-6 text-small text-muted">
          {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
        </p>
        <CartLines lines={cart.lines} lrdPerUsd={settings.lrdPerUsd} variant="page" />
      </section>

      <aside aria-label="Order summary" className="rounded-card bg-surface p-6 lg:sticky lg:top-28">
        <h2 className="mb-5 font-display text-h4 font-heading">Summary</h2>
        <CartSummary subtotalCents={cart.subtotalCents} lrdPerUsd={settings.lrdPerUsd}>
          <div className="hairline mt-3 flex flex-col gap-2 border-t pt-4 text-caption text-muted">
            <p>We confirm delivery and payment with you on WhatsApp.</p>
            <p>We accept cash on delivery, MTN Mobile Money and Orange Money.</p>
            <p>
              LRD at {formatRate(settings.lrdPerUsd)} per $1 (updated{" "}
              {rateDateFormatter.format(new Date(settings.lrdRateUpdatedAt))}).
            </p>
          </div>
        </CartSummary>
      </aside>
    </div>
  );
}

function CartSkeleton() {
  const block = "animate-pulse rounded-control bg-surface";
  return (
    <div aria-busy="true" aria-label="Loading your bag" className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12">
      <div className="flex flex-col gap-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-4">
            <div className="well size-24 shrink-0 animate-pulse" />
            <div className="flex flex-1 flex-col gap-2">
              <div className={`${block} h-4 w-1/2`} />
              <div className={`${block} h-3 w-1/3`} />
              <div className={`${block} mt-2 h-11 w-36`} />
            </div>
          </div>
        ))}
      </div>
      <div className={`${block} h-72 rounded-card`} />
    </div>
  );
}
