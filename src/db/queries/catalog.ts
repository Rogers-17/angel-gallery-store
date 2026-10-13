import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/db";
import { collections, productImages, products, productVariants } from "@/db/schema";
import { cacheTags } from "./tags";
import type { ImageData, ProductCardData, ProductDetail, VariantData } from "./types";

type VariantRow = typeof productVariants.$inferSelect;
type ImageRow = typeof productImages.$inferSelect;
type ProductRow = typeof products.$inferSelect;

function toImage(row: ImageRow): ImageData {
  return { url: row.url, alt: row.alt, objectPosition: row.objectPosition };
}

function toVariant(row: VariantRow): VariantData {
  return {
    id: row.id,
    sku: row.sku,
    color: row.color,
    colorHex: row.colorHex,
    size: row.size,
    priceCents: row.priceCents,
    compareAtCents: row.compareAtCents,
    stock: row.stock,
  };
}

/** Card fields shared by listings and product pages. Price = cheapest variant. */
function toCard(product: ProductRow, variants: VariantRow[], images: ImageRow[]): ProductCardData {
  const cheapest = variants.reduce<VariantRow | undefined>(
    (min, v) => (!min || v.priceCents < min.priceCents ? v : min),
    undefined,
  );
  return {
    slug: product.slug,
    name: product.name,
    tag: product.tag,
    summary: product.summary,
    badge: product.badge,
    priceCents: cheapest?.priceCents ?? 0,
    compareAtCents: cheapest?.compareAtCents ?? null,
    inStock: variants.some((v) => v.stock > 0),
    image: images[0] ? toImage(images[0]) : null,
  };
}

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

  // The catalog is small; rank in JS. Revisit with a SQL ORDER BY when it grows (Phase 2).
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
