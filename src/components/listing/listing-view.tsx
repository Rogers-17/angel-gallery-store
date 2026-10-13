import Link from "next/link";
import type { ListingItem } from "@/db/queries/types";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { ProductGrid } from "@/components/ui/grid";
import { Heading } from "@/components/ui/heading";
import {
  activeFilterCount,
  buildFacets,
  filterItems,
  type ListingParams,
  paginate,
  sortItems,
} from "@/lib/listing";
import { ActiveFilters } from "./active-filters";
import { FilterDrawer } from "./filter-drawer";
import { FilterPanel } from "./filter-panel";
import { Pagination } from "./pagination";
import { SortMenu } from "./sort-menu";

type ListingViewProps = {
  /** Base path of the listing, e.g. "/shop/shoes". */
  pathname: string;
  params: ListingParams;
  /** Every product in the scope; filtered, sorted and paginated here. */
  items: ListingItem[];
  lrdPerUsd: number;
  /** Category slug → name. Pass on /shop to show the category filter. */
  categoryNames?: Record<string, string>;
  /** Hide filters (e.g. search results). */
  showFilters?: boolean;
  featuredLabel?: string;
  emptyTitle?: string;
  emptyText?: string;
};

export function ListingView({
  pathname,
  params,
  items,
  lrdPerUsd,
  categoryNames,
  showFilters = true,
  featuredLabel,
  emptyTitle = "No Products Match These Filters",
  emptyText = "Try removing a filter or browse another category.",
}: ListingViewProps) {
  const includeCategory = Boolean(categoryNames);
  const facets = buildFacets(items);
  const filtered = sortItems(filterItems(items, params), params.sort);
  const page = paginate(filtered, params.page);
  const filterCount = activeFilterCount(params, includeCategory);
  const panel = <FilterPanel pathname={pathname} params={params} facets={facets} categoryNames={categoryNames} />;

  return (
    <div className={showFilters ? "lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10" : undefined}>
      {showFilters && <aside className="hidden lg:block">{panel}</aside>}

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-small text-muted">
            {page.total === 0
              ? "No products"
              : `Showing ${page.from}–${page.to} of ${page.total} ${page.total === 1 ? "product" : "products"}`}
          </p>
          <div className="flex items-center gap-2">
            {showFilters && <FilterDrawer count={filterCount}>{panel}</FilterDrawer>}
            <SortMenu pathname={pathname} params={params} featuredLabel={featuredLabel} />
          </div>
        </div>

        {showFilters && (
          <div className="mt-4">
            <ActiveFilters
              pathname={pathname}
              params={params}
              categoryNames={categoryNames}
              includeCategory={includeCategory}
            />
          </div>
        )}

        {page.total === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-card bg-surface px-6 py-16 text-center">
            <Heading as="h2" size="h3">{emptyTitle}</Heading>
            <p className="mt-3 max-w-md text-small text-muted">{emptyText}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {filterCount > 0 && (
                <ButtonLink href={pathname + (params.q ? `?q=${encodeURIComponent(params.q)}` : "")} variant="primary" size="sm">
                  Clear Filters
                </ButtonLink>
              )}
              <ButtonLink href="/shop" variant="secondary" size="sm">Shop All</ButtonLink>
            </div>
          </div>
        ) : (
          <>
            <ProductGrid className="mt-8">
              {page.items.map((item) => (
                <li key={item.slug}>
                  <ProductCard product={item} lrdPerUsd={lrdPerUsd} />
                </li>
              ))}
            </ProductGrid>
            <Pagination pathname={pathname} params={params} page={page.page} pageCount={page.pageCount} />
          </>
        )}

        {page.total > 0 && params.page > page.pageCount && (
          <p className="mt-6 text-center text-small text-muted">
            That page doesn&apos;t exist; showing the last page. <Link href={pathname} className="link-inline">Back to start</Link>
          </p>
        )}
      </div>
    </div>
  );
}
