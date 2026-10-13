import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HeaderSkeleton, ResultsSkeleton } from "@/components/listing/listing-skeleton";
import { ListingView } from "@/components/listing/listing-view";
import { PageHeader } from "@/components/listing/page-header";
import { Container } from "@/components/ui/container";
import { getCategories } from "@/db/queries/catalog";
import { getListing } from "@/db/queries/listing";
import { getStoreSettings } from "@/db/queries/settings";
import { parseListingParams } from "@/lib/listing";

type Props = PageProps<"/shop/[category]">;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name.toLowerCase()} at Angel Gallery.`,
    alternates: { canonical: `/shop/${category.slug}` },
  };
}

export default function CategoryPage({ params, searchParams }: Props) {
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
          <CategoryContent params={params} searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}

async function CategoryContent({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <>
      <PageHeader
        path={`/shop/${category.slug}`}
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: category.name }]}
        title={category.name}
        description={category.description}
      />
      <Suspense fallback={<ResultsSkeleton />}>
        <CategoryResults slug={category.slug} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CategoryResults({ slug, searchParams }: { slug: string; searchParams: Props["searchParams"] }) {
  const params = parseListingParams(await searchParams);
  const [items, settings] = await Promise.all([getListing({ kind: "category", slug }), getStoreSettings()]);

  return (
    <ListingView
      pathname={`/shop/${slug}`}
      params={{ ...params, category: undefined }}
      items={items}
      lrdPerUsd={settings.lrdPerUsd}
    />
  );
}
