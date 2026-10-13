import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/db";
import { categories, collections, productImages, products, productVariants } from "@/db/schema";
import { toCard, toImage, toVariant } from "./mappers";
import { cacheTags } from "./tags";
import type { CategoryData, CollectionData, ProductCardData, ProductDetail } from "./types";

const cardRelations = {
  variants: { orderBy: [asc(productVariants.position)] },
  images: { orderBy: [asc(productImages.position)], limit: 1 },
};

/** Active products in a collection, in collection order. */
export async function getCollectionProducts(slug: string): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.catalog, cacheTags.collection(slug));

  const collection = await getDb().query.collections.findFirst({
    where: eq(collections.slug, slug),
    with: {
      collectionProducts: {
        orderBy: (cp, { asc: ascending }) => [ascending(cp.position)],
        with: { product: { with: cardRelations } },
      },
    },
  });
  if (!collection) return [];

  return collection.collectionProducts
    .map((cp) => cp.product)
    .filter((product) => product.status === "active")
    .map((product) => toCard(product, product.variants, product.images));
}

/** A single active product with all variants and images, or null. */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.catalog, cacheTags.product(slug));

  const product = await getDb().query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.status, "active")),
    with: {
      category: true,
      variants: { orderBy: [asc(productVariants.position)] },
      images: { orderBy: [asc(productImages.position)] },
    },
  });
  if (!product) return null;

  return {
    ...toCard(product, product.variants, product.images),
    id: product.id,
    description: product.description,
    materials: product.materials,
    care: product.care,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    category: { id: product.category.id, slug: product.category.slug, name: product.category.name },
    images: product.images.map(toImage),
    variants: product.variants.map(toVariant),
  };
}

/** Other active products, same category first. */
export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 3,
): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.catalog);

  // The catalog is small; rank in JS. Revisit with a SQL ORDER BY when it grows.
  const rows = await getDb().query.products.findMany({
    where: eq(products.status, "active"),
    orderBy: [asc(products.createdAt)],
    with: cardRelations,
  });

  return rows
    .filter((p) => p.id !== productId)
    .sort((a, b) => Number(b.categoryId === categoryId) - Number(a.categoryId === categoryId))
    .slice(0, limit)
    .map((p) => toCard(p, p.variants, p.images));
}

/** Slugs of every active product, for generateStaticParams. */
export async function getActiveProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.catalog);

  const rows = await getDb()
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.status, "active"));
  return rows.map((r) => r.slug);
}

export async function getCategories(): Promise<CategoryData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.catalog);

  const rows = await getDb().select().from(categories).orderBy(asc(categories.position));
  return rows.map(({ id, slug, name, description }) => ({ id, slug, name, description }));
}

export async function getCollections(): Promise<CollectionData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.catalog);

  const rows = await getDb().select().from(collections).orderBy(asc(collections.position));
  return rows.map(({ id, slug, name, description }) => ({ id, slug, name, description }));
}

/** Data for sitemap.xml: active product slugs with their last update. */
export async function getSitemapProducts(): Promise<{ slug: string; updatedAt: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.catalog);

  const rows = await getDb()
    .select({ slug: products.slug, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.status, "active"));
  return rows.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt.toISOString() }));
}
