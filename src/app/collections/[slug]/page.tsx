import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HeaderSkeleton, ResultsSkeleton } from "@/components/listing/listing-skeleton";
import { ListingView } from "@/components/listing/listing-view";
import { PageHeader } from "@/components/listing/page-header";
import { Container } from "@/components/ui/container";
import { getCategories, getCollections } from "@/db/queries/catalog";
import { getListing } from "@/db/queries/listing";
import { getStoreSettings } from "@/db/queries/settings";
import { parseListingParams } from "@/lib/listing";

type Props = PageProps<"/collections/[slug]">;

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = (await getCollections()).find((c) => c.slug === slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: collection.description ?? `Shop the ${collection.name} at Angel Gallery.`,
    alternates: { canonical: `/collections/${collection.slug}` },
  };
}

export default function CollectionPage({ params, searchParams }: Props) {
  return (
    <main className="flex-1">
      <Container className="pt-8 pb-section">
        <Suspense
          fallback={
            <>
              <HeaderSkeleton />
              <ResultsSkeleton />
            </>
          }
        >
          <CollectionContent params={params} searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}

async function CollectionContent({ params, searchParams }: Props) {
  const { slug } = await params;
  const collection = (await getCollections()).find((c) => c.slug === slug);
  if (!collection) notFound();

  return (
    <>
      <PageHeader
        path={`/collections/${collection.slug}`}
        crumbs={[{ label: "Home", href: "/" }, { label: "Collections" }, { label: collection.name }]}
        title={collection.name}
        description={collection.description}
      />
      <Suspense fallback={<ResultsSkeleton />}>
        <CollectionResults slug={collection.slug} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CollectionResults({ slug, searchParams }: { slug: string; searchParams: Props["searchParams"] }) {
  const params = parseListingParams(await searchParams);
  const [items, categories, settings] = await Promise.all([
    getListing({ kind: "collection", slug }),
    getCategories(),
    getStoreSettings(),
  ]);

  return (
    <ListingView
      pathname={`/collections/${slug}`}
      params={params}
      items={items}
      lrdPerUsd={settings.lrdPerUsd}
      categoryNames={Object.fromEntries(categories.map((c) => [c.slug, c.name]))}
    />
  );
}
