import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { OrderSummary } from "@/components/checkout/order-summary";
import { OrderStatusPill } from "@/components/orders/order-status-pill";
import { WhatsAppButton } from "@/components/orders/whatsapp-button";
import { Heading } from "@/components/ui/heading";
import { Tag } from "@/components/ui/tag";
import { getOrderForBuyer } from "@/db/queries/orders";
import { getStoreSettings } from "@/db/queries/settings";
import type { OrderView, StoreSettingsData } from "@/db/queries/types";
import { formatRate } from "@/lib/money";
import { formatPhone, paymentMethodLabels } from "@/lib/orders/labels";
import { buildOrderMessage, buildWaMeUrl } from "@/lib/orders/whatsapp";
import { absoluteUrl } from "@/lib/site";

// Guest order page: /orders/AG-1001?token=â€¦. The number alone is never enough (numbers are
// sequential); the token is checked against its stored hash. Read at request time, never cached.

// Order numbers are unknown at build time, so the root layout's pathname-aware header can't be
// prerendered for this route. It's a private page reached by redirect or a saved link, so a
// blocking render is fine (and avoids a per-order shell that generateStaticParams would save).
export const instant = false;

export const metadata: Metadata = {
  title: "Your Order",
  robots: { index: false, follow: false },
  // Keep the token out of Referer headers when links on this page are followed.
  referrer: "no-referrer",
};

type OrderPageProps = {
  params: Promise<{ number: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const placedFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Monrovia",
});

export default function OrderPage({ params, searchParams }: OrderPageProps) {
  return (
    <main className="flex-1">
      <div className="container-narrow pt-10 pb-section">
        <Suspense fallback={<OrderSkeleton />}>
          <OrderContents params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function OrderContents({ params, searchParams }: OrderPageProps) {
  const [{ number }, query] = await Promise.all([params, searchParams]);
  const token = typeof query.token === "string" ? query.token : "";
  const [order, settings] = await Promise.all([getOrderForBuyer(number, token), getStoreSettings()]);
  if (!order) notFound();

  const methodLabel = settings.paymentInstructions[order.paymentMethod]?.label || paymentMethodLabels[order.paymentMethod];
  const whatsappUrl = whatsAppLink(order, settings, methodLabel);

  return (
    <>
      <section className="flex flex-col items-center text-center">
        <Tag>Order {order.number}</Tag>
        <Heading as="h1" size="h1" className="mt-4">One Last Step</Heading>
        <p className="mx-auto mt-3 max-w-xl text-body-lg text-ink-soft">
          Send your order to us on WhatsApp so we can confirm it, agree the delivery fee and arrange payment.
        </p>
        {whatsappUrl ? (
          <>
            <WhatsAppButton href={whatsappUrl} className="mt-8 w-full sm:w-auto sm:min-w-80" />
            <p className="mt-3 text-caption text-muted">Opens WhatsApp with your order filled in. Just press send.</p>
          </>
        ) : (
          <p className="mt-8 rounded-control border border-line-strong px-5 py-4 text-small">
            Message us{settings.contactPhone ? ` on ${formatPhone(settings.contactPhone)}` : ""} with your order number,{" "}
            {order.number}.
          </p>
        )}
      </section>

      <div className="mt-12 flex flex-col gap-6">
        <Card title="Order Status">
          <div className="flex flex-wrap items-center gap-3">
            <OrderStatusPill status={order.status} />
            <p className="text-small text-muted">Placed {placedFormatter.format(new Date(order.placedAt))}</p>
          </div>
        </Card>

        <Card title="What Happens Next">
          <ol className="flex flex-col gap-4">
            {[
              "Send the order on WhatsApp (button above).",
              "We confirm availability and agree the delivery fee with you.",
              `Pay by ${methodLabel}, then ${order.fulfilment === "pickup" ? "collect your order" : "we deliver"}.`,
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-small">
                <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-paper text-small font-semibold">
                  {index + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="How to Pay">
          <p className="text-small font-semibold">{methodLabel}</p>
          <p className="mt-2 text-small whitespace-pre-line text-ink-soft">
            {settings.paymentInstructions[order.paymentMethod]?.instructions}
          </p>
        </Card>

        <Card title="Your Order">
          <OrderSummary
            lines={order.lines.map((line, index) => ({ ...line, key: `${line.sku}-${index}` }))}
            subtotalCents={order.subtotalCents}
            deliveryFeeCents={order.deliveryFeeCents}
            totalCents={order.totalCents}
            lrdPerUsd={order.lrdPerUsd}
            totalLabel="Total"
            footer={<p>LRD at {formatRate(order.lrdPerUsd)} per $1, the rate when you ordered.</p>}
          />
        </Card>

        <Card title={order.fulfilment === "pickup" ? "Pickup Details" : "Delivery Details"}>
          <dl className="grid gap-x-6 gap-y-3 text-small sm:grid-cols-[8rem_1fr]">
            <Detail label="Name">{order.customerName}</Detail>
            <Detail label="WhatsApp">{formatPhone(order.whatsappPhone)}</Detail>
            {order.email && <Detail label="Email">{order.email}</Detail>}
            {order.delivery ? (
              <>
                <Detail label="Area">{order.delivery.area}</Detail>
                {order.delivery.street && <Detail label="Street">{order.delivery.street}</Detail>}
                <Detail label="Landmark">{order.delivery.landmark}</Detail>
                {order.delivery.notes && <Detail label="Notes">{order.delivery.notes}</Detail>}
              </>
            ) : (
              <Detail label="Pickup">Point agreed on WhatsApp</Detail>
            )}
          </dl>
        </Card>
      </div>

      <p className="mt-8 text-center text-caption text-muted">
        Bookmark this page to check your order later. Anyone with this link can see your order, so keep it private.
        <br />
        Lost the link? Use{" "}
        <Link href="/orders/lookup" className="link-inline text-ink">Track order</Link>
        {" "}with your order number and WhatsApp number.
      </p>
    </>
  );
}

/** wa.me link to the admin with the order pre-filled, or null when no admin number is set. */
function whatsAppLink(order: OrderView, settings: StoreSettingsData, methodLabel: string): string | null {
  if (!settings.whatsappNumber) {
    console.error("[orders] no admin WhatsApp number in store settings; showing the contact fallback.");
    return null;
  }
  const message = buildOrderMessage(
    {
      number: order.number,
      customerName: order.customerName,
      whatsappPhone: order.whatsappPhone,
      fulfilment: order.fulfilment,
      delivery: order.delivery,
      paymentMethodLabel: methodLabel,
      subtotalCents: order.subtotalCents,
      lrdPerUsd: order.lrdPerUsd,
      items: order.lines,
    },
    { template: settings.orderMessageTemplate, orderLink: absoluteUrl(`/admin/orders/${order.number}`) },
  );
  return buildWaMeUrl(settings.whatsappNumber, message);
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-card bg-surface p-5 sm:p-6">
      <h2 className="mb-4 font-display text-h4 font-heading">{title}</h2>
      {children}
    </section>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="-mt-2 break-words sm:mt-0">{children}</dd>
    </>
  );
}

function OrderSkeleton() {
  const block = "animate-pulse rounded-control bg-surface";
  return (
    <div aria-busy="true" aria-label="Loading your order" className="flex flex-col items-center gap-4">
      <div className={`${block} h-6 w-32 rounded-pill`} />
      <div className={`${block} h-10 w-64`} />
      <div className={`${block} h-5 w-full max-w-md`} />
      <div className={`${block} mt-4 h-13 w-full max-w-80`} />
      <div className={`${block} mt-8 h-32 w-full rounded-card`} />
      <div className={`${block} h-48 w-full rounded-card`} />
    </div>
  );
}
