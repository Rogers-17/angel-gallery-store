import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/db";
import { categories, collections, productImages, products, productVariants } from "@/db/schema";
import { toListingItem } from "./mappers";
import { cacheTags } from "./tags";
import type { ListingItem } from "./types";

export type ListingScope =
  | { kind: "all" }
  | { kind: "category"; slug: string }
  | { kind: "collection"; slug: string };

const listingRelations = {
  category: true as const,
  variants: { orderBy: [asc(productVariants.position)] },
  images: { orderBy: [asc(productImages.position)], limit: 1 },
};

/**
 * Every active product in a scope, with facet data. Request-time listings filter, sort and
 * paginate this in memory, so there is one cache entry per scope (high hit rate), stored in
 * Upstash via `use cache: remote`. Revisit with SQL-side filtering past ~1,000 products a scope.
 */
export async function getListing(scope: ListingScope): Promise<ListingItem[]> {
  "use cache: remote";
  cacheLife("hours");
  cacheTag(
    cacheTags.catalog,
    scope.kind === "collection" ? cacheTags.collection(scope.slug) : `listing:${scope.kind}`,
  );

  const db = getDb();

  if (scope.kind === "collection") {
    const collection = await db.query.collections.findFirst({
      where: eq(collections.slug, scope.slug),
      with: {
        collectionProducts: {
          orderBy: (cp, { asc: ascending }) => [ascending(cp.position)],
          with: { product: { with: listingRelations } },
        },
      },
    });
    if (!collection) return [];
    return collection.collectionProducts
      .map((cp) => cp.product)
      .filter((p) => p.status === "active")
      .map((p, i) => toListingItem(p, p.variants, p.images, i));
  }

  let categoryFilter;
  if (scope.kind === "category") {
    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, scope.slug));
    if (!category) return [];
    categoryFilter = eq(products.categoryId, category.id);
  }

  const rows = await db.query.products.findMany({
    where: and(eq(products.status, "active"), categoryFilter),
    orderBy: [desc(products.createdAt), asc(products.name)],
    with: listingRelations,
  });
  return rows.map((p, i) => toListingItem(p, p.variants, p.images, i));
}

const MAX_SEARCH_TOKENS = 6;

/** Lowercase letters/digits tokens, de-duplicated. Shared by the cache key and the tsquery. */
export function normalizeSearchQuery(query: string): string {
  const tokens = query
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  return [...new Set(tokens)].slice(0, MAX_SEARCH_TOKENS).join(" ");
}

/**
 * Full-text search over active products (name > tag > summary > description), each token
 * prefix-matched ("loaf" finds "loafer"). Results are ranked by relevance and cached in
 * Upstash per normalised query for a few minutes.
 */
export async function searchProducts(normalizedQuery: string): Promise<ListingItem[]> {
  "use cache: remote";
  cacheLife("minutes");
  cacheTag(cacheTags.catalog, "search");

  const tokens = normalizedQuery.split(" ").filter((t) => /^[a-z0-9]+$/.test(t));
  if (tokens.length === 0) return [];
  const tsquery = tokens.map((t) => `${t}:*`).join(" & ");

  const db = getDb();
  const ranked = await db
    .select({
      id: products.id,
      rank: sql<number>`ts_rank(${products.searchVector}, to_tsquery('english', ${tsquery}))`,
    })
    .from(products)
    .where(
      and(
        eq(products.status, "active"),
        sql`${products.searchVector} @@ to_tsquery('english', ${tsquery})`,
      ),
    )
    .orderBy(desc(sql`ts_rank(${products.searchVector}, to_tsquery('english', ${tsquery}))`))
    .limit(100);
  if (ranked.length === 0) return [];

  const rows = await db.query.products.findMany({
    where: inArray(
      products.id,
      ranked.map((r) => r.id),
    ),
    with: listingRelations,
  });
  const order = new Map(ranked.map((r, i) => [r.id, i]));
  return rows
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .map((p, i) => toListingItem(p, p.variants, p.images, i));
}
