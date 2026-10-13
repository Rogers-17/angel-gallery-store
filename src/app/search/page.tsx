import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResultsSkeleton } from "@/components/listing/listing-skeleton";
import { ListingView } from "@/components/listing/listing-view";
import { SearchForm } from "@/components/search/search-form";
import { Breadcrumb } from "@/components/product/pdp/breadcrumb";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { getCategories } from "@/db/queries/catalog";
import { normalizeSearchQuery, searchProducts } from "@/db/queries/listing";
import { getStoreSettings } from "@/db/queries/settings";
import { parseListingParams } from "@/lib/listing";

export const metadata: Metadata = {
  title: "Search",
  // Arbitrary queries would otherwise become endless indexable pages.
  robots: { index: false, follow: true },
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <main className="flex-1">
      <Container className="pt-8 pb-section">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
        <Heading as="h1" size="h1" className="mt-5">Search</Heading>
        <Suspense fallback={<ResultsSkeleton />}>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}

async function SearchResults({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const params = parseListingParams(await searchParams);
  const query = normalizeSearchQuery(params.q ?? "");
  const [results, categories, settings] = await Promise.all([
    query ? searchProducts(query) : Promise.resolve([]),
    getCategories(),
    getStoreSettings(),
  ]);

  return (
    <>
      <div className="mt-6 mb-10">
        <SearchForm defaultValue={params.q} autoFocus={!params.q} />
      </div>

      {!query ? (
        <div className="rounded-card bg-surface px-6 py-12 text-center">
          <p className="text-body text-ink-soft">Search by name, material or style, or browse a category:</p>
          <CategoryLinks categories={categories} />
        </div>
      ) : (
        <ListingView
          pathname="/search"
          params={params}
          items={results}
          lrdPerUsd={settings.lrdPerUsd}
          showFilters={false}
          featuredLabel="Relevance"
          emptyTitle={`No Results For “${params.q}”`}
          emptyText="Check the spelling, try a more general word, or browse a category below."
        />
      )}

      {query && results.length === 0 && <CategoryLinks categories={categories} />}
    </>
  );
}

function CategoryLinks({ categories }: { categories: { slug: string; name: string }[] }) {
  return (
    <ul className="mt-6 flex flex-wrap justify-center gap-2">
      {categories.map((c) => (
        <li key={c.slug}>
          <Link href={`/shop/${c.slug}`} className="btn btn-outline btn-sm btn-pill">{c.name}</Link>
        </li>
      ))}
    </ul>
  );
}
