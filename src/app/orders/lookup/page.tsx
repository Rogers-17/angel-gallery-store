import type { Metadata } from "next";
import { LookupForm } from "@/components/orders/lookup-form";
import { Heading } from "@/components/ui/heading";
import { getStoreSettings } from "@/db/queries/settings";
import { buildWaMeUrl } from "@/lib/orders/whatsapp";

export const metadata: Metadata = {
  title: "Track Your Order",
  robots: { index: false, follow: false },
};

export default async function OrderLookupPage() {
  // Cached settings (`use cache`), so the page still prerenders.
  const settings = await getStoreSettings();
  const helpUrl = settings.whatsappNumber
    ? buildWaMeUrl(settings.whatsappNumber, "Hello Angel Gallery, I need help finding my order.")
    : null;

  return (
    <main className="flex-1">
      <div className="container-narrow pt-10 pb-section">
        <div className="text-center">
          <Heading as="h1" size="h1">Track Your Order</Heading>
          <p className="mx-auto mt-3 max-w-xl text-body-lg text-ink-soft">
            Enter your order number and the WhatsApp number you ordered with.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md rounded-card bg-surface p-5 sm:p-8">
          <LookupForm />
        </div>

        {helpUrl && (
          <p className="mt-6 text-center text-caption text-muted">
            Can&apos;t find it?{" "}
            <a href={helpUrl} target="_blank" rel="noopener noreferrer" className="link-inline text-ink">
              Message us on WhatsApp
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
