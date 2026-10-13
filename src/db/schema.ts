// Drizzle table definitions. Column names are camelCase here and snake_case in SQL
// (`casing: "snake_case"` in src/db/index.ts, scripts/db.ts and drizzle.config.ts).
// After changes: `pnpm db:generate`, review the SQL in drizzle/, then `pnpm db:migrate`.
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// ── Enums ──────────────────────────────────────────────────────────────

export const productStatus = pgEnum("product_status", ["draft", "active", "archived"]);
export const productBadge = pgEnum("product_badge", ["new", "bestseller"]);

// ── Catalog ────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  description: text(),
  position: integer().notNull().default(0),
  ...timestamps,
});

export const collections = pgTable("collections", {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  description: text(),
  position: integer().notNull().default(0),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    categoryId: uuid()
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    /** Short label shown as the pill on product cards, e.g. "Men's Shoes". */
    tag: text().notNull(),
    /** Two-line card summary. */
    summary: text().notNull(),
    description: text().notNull(),
    materials: text().array().notNull().default(sql`'{}'::text[]`),
    care: text(),
    badge: productBadge(),
    status: productStatus().notNull().default("draft"),
    seoTitle: text(),
    seoDescription: text(),
    publishedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("products_status_idx").on(table.status), index("products_category_idx").on(table.categoryId)],
);

export const collectionProducts = pgTable(
  "collection_products",
  {
    collectionId: uuid()
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    position: integer().notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.collectionId, table.productId] })],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text().notNull().unique(),
    color: text().notNull(),
    /** Swatch colour for the picker (product data, not a design token). */
    colorHex: text().notNull(),
    size: text().notNull(),
    /** USD, integer cents. */
    priceCents: integer().notNull(),
    /** USD, integer cents. Original price when on sale. */
    compareAtCents: integer(),
    stock: integer().notNull().default(0),
    position: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [
    unique("product_variants_option_unique").on(table.productId, table.color, table.size),
    index("product_variants_product_idx").on(table.productId),
    check("product_variants_price_check", sql`${table.priceCents} >= 0`),
    check("product_variants_stock_check", sql`${table.stock} >= 0`),
    check(
      "product_variants_compare_at_check",
      sql`${table.compareAtCents} IS NULL OR ${table.compareAtCents} > ${table.priceCents}`,
    ),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    /** Public path or object-storage URL. */
    url: text().notNull(),
    alt: text().notNull(),
    /** Tailwind object-position class for cropping, e.g. "object-top". */
    objectPosition: text(),
    position: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [index("product_images_product_idx").on(table.productId)],
);

// ── Store settings (single row, id = 1) ────────────────────────────────

export type PaymentMethod = "cash_on_delivery" | "mtn_momo" | "orange_money";
export type PaymentInstructions = Record<PaymentMethod, { label: string; instructions: string }>;

export const storeSettings = pgTable(
  "store_settings",
  {
    id: integer().primaryKey().default(1),
    /** Admin WhatsApp number in E.164, e.g. +231779268242. */
    whatsappNumber: text(),
    /** Liberian dollars per 1 US dollar. */
    lrdPerUsd: numeric({ precision: 10, scale: 4, mode: "number" }).notNull(),
    lrdRateUpdatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    paymentInstructions: jsonb().$type<PaymentInstructions>().notNull(),
    contactEmail: text(),
    contactPhone: text(),
    orderMessageTemplate: text(),
    ...timestamps,
  },
  (table) => [
    check("store_settings_singleton_check", sql`${table.id} = 1`),
    check("store_settings_rate_check", sql`${table.lrdPerUsd} > 0`),
  ],
);

// ── Relations (typed relational queries) ───────────────────────────────

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionProducts: many(collectionProducts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  images: many(productImages),
  collectionProducts: many(collectionProducts),
}));

export const collectionProductsRelations = relations(collectionProducts, ({ one }) => ({
  collection: one(collections, { fields: [collectionProducts.collectionId], references: [collections.id] }),
  product: one(products, { fields: [collectionProducts.productId], references: [products.id] }),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));
