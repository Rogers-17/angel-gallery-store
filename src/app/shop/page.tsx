import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultsSkeleton } from "@/components/listing/listing-skeleton";
import { ListingView } from "@/components/listing/listing-view";
import { PageHeader } from "@/components/listing/page-header";
import { Container } from "@/components/ui/container";
import { getCategories } from "@/db/queries/catalog";
import { getListing } from "@/db/queries/listing";
import { getStoreSettings } from "@/db/queries/settings";
import { parseListingParams } from "@/lib/listing";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Shop all shoes, bags and clothing at Angel Gallery. Order online and finish on WhatsApp.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <main className="flex-1">
      <Container className="pt-8 pb-section">
        <PageHeader
          path="/shop"
          crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
          title="Shop All"
          description="Shoes, bags and clothing from independent makers, chosen to be worn every day."
        />
        {/* Results depend on the URL, so they render at request time inside Suspense. */}
        <Suspense fallback={<ResultsSkeleton />}>
          <ShopResults searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}

async function ShopResults({ searchParams }: Pick<PageProps<"/shop">, "searchParams">) {
  const params = parseListingParams(await searchParams);
  const [items, categories, settings] = await Promise.all([
    getListing({ kind: "all" }),
    getCategories(),
    getStoreSettings(),
  ]);

  return (
    <ListingView
      pathname="/shop"
      params={params}
      items={items}
      lrdPerUsd={settings.lrdPerUsd}
      categoryNames={Object.fromEntries(categories.map((c) => [c.slug, c.name]))}
    />
  );
}
