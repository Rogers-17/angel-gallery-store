import "server-only";
import type { categories, productImages, products, productVariants } from "@/db/schema";
import type { ImageData, ListingItem, ProductCardData, VariantData } from "./types";

type VariantRow = typeof productVariants.$inferSelect;
type ImageRow = typeof productImages.$inferSelect;
type ProductRow = typeof products.$inferSelect;
type CategoryRow = typeof categories.$inferSelect;

export function toImage(row: ImageRow): ImageData {
  return { url: row.url, alt: row.alt, objectPosition: row.objectPosition };
}

export function toVariant(row: VariantRow): VariantData {
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
export function toCard(product: ProductRow, variants: VariantRow[], images: ImageRow[]): ProductCardData {
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
    singleVariantId: variants.length === 1 && variants[0].stock > 0 ? variants[0].id : null,
  };
}

/** Card + facet data for in-memory filtering and sorting. */
export function toListingItem(
  product: ProductRow & { category: CategoryRow },
  variants: VariantRow[],
  images: ImageRow[],
  position: number,
): ListingItem {
  const colors = new Map<string, string>();
  for (const v of variants) if (!colors.has(v.color)) colors.set(v.color, v.colorHex);
  return {
    ...toCard(product, variants, images),
    audience: product.audience,
    categorySlug: product.category.slug,
    sizes: [...new Set(variants.map((v) => v.size))],
    colors: [...colors].map(([name, hex]) => ({ name, hex })),
    createdAt: product.createdAt.toISOString(),
    position,
  };
}
