// Loads the demo catalog and default store settings.
// Usage: pnpm db:seed [--reset-settings] [--force]
// - Replaces ALL catalog data (categories, collections, products, variants, images).
// - Creates the settings row if missing; only overwrites it with --reset-settings.
import { randomUUID } from "node:crypto";
import {
  categories,
  collectionProducts,
  collections,
  productImages,
  products,
  productVariants,
  storeSettings,
} from "../src/db/schema";
import { assertSafeTarget, db, dbHost } from "./db";
import { invalidateCacheTags } from "./cache";
import { seedCategories, seedCollections, seedProducts, seedSettings } from "./seed-data";

// Deterministic stock pattern; zeros demonstrate "sold out" variants.
const STOCK_PATTERN = [6, 3, 0, 8, 2, 5, 1, 4];

function skuPart(value: string, length: number) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, length) || "X";
}

function buildSku(slug: string, color: string, size: string) {
  const prefix = slug
    .split("-")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const sizePart = size === "One size" ? "OS" : skuPart(size, 6);
  return `${prefix}-${skuPart(color, 4)}-${sizePart}`;
}

async function main() {
  const args = process.argv.slice(2);
  assertSafeTarget(args);
  console.log(`Seeding ${dbHost} …`);

  const categoryIds = new Map(seedCategories.map((c) => [c.slug, randomUUID()]));
  const collectionIds = new Map(seedCollections.map((c) => [c.slug, randomUUID()]));
  const now = new Date();

  const productRows: (typeof products.$inferInsert)[] = [];
  const variantRows: (typeof productVariants.$inferInsert)[] = [];
  const imageRows: (typeof productImages.$inferInsert)[] = [];
  const membershipRows: (typeof collectionProducts.$inferInsert)[] = [];

  seedProducts.forEach((item, productIndex) => {
    const productId = randomUUID();
    productRows.push({
      id: productId,
      slug: item.slug,
      name: item.name,
      categoryId: categoryIds.get(item.category)!,
      tag: item.tag,
      summary: item.summary,
      description: item.description,
      materials: item.materials,
      care: item.care,
      badge: item.badge,
      status: "active",
      publishedAt: now,
    });

    let variantIndex = 0;
    item.colors.forEach((color) => {
      item.sizes.forEach((size) => {
        variantRows.push({
          productId,
          sku: buildSku(item.slug, color.name, size),
          color: color.name,
          colorHex: color.hex,
          size,
          priceCents: item.priceCents,
          compareAtCents: item.compareAtCents,
          stock: STOCK_PATTERN[(productIndex * 3 + variantIndex) % STOCK_PATTERN.length],
          position: variantIndex,
        });
        variantIndex += 1;
      });
    });

    imageRows.push({
      productId,
      url: item.image.url,
      alt: item.image.alt,
      objectPosition: item.image.objectPosition,
      position: 0,
    });

    membershipRows.push({
      collectionId: collectionIds.get(item.collection)!,
      productId,
      position: productIndex,
    });
  });

  const settingsInsert = db
    .insert(storeSettings)
    .values({ id: 1, ...seedSettings, lrdRateUpdatedAt: now });
  const settingsStatement = args.includes("--reset-settings")
    ? settingsInsert.onConflictDoUpdate({
        target: storeSettings.id,
        set: { ...seedSettings, lrdRateUpdatedAt: now },
      })
    : settingsInsert.onConflictDoNothing({ target: storeSettings.id });

  // neon-http runs a batch as a single transaction: all of it applies, or none of it.
  await db.batch([
    db.delete(products), // cascades to variants, images and collection memberships
    db.delete(collections),
    db.delete(categories),
    db.insert(categories).values(seedCategories.map((c) => ({ ...c, id: categoryIds.get(c.slug)! }))),
    db.insert(collections).values(seedCollections.map((c) => ({ ...c, id: collectionIds.get(c.slug)! }))),
    db.insert(products).values(productRows),
    db.insert(productVariants).values(variantRows),
    db.insert(productImages).values(imageRows),
    db.insert(collectionProducts).values(membershipRows),
    settingsStatement,
  ]);

  const soldOut = variantRows.filter((v) => v.stock === 0).length;
  console.table({
    categories: seedCategories.length,
    collections: seedCollections.length,
    products: productRows.length,
    variants: `${variantRows.length} (${soldOut} sold out)`,
    images: imageRows.length,
    settings: args.includes("--reset-settings") ? "reset" : "kept if present",
  });

  await invalidateCacheTags(["catalog", "settings"]);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
