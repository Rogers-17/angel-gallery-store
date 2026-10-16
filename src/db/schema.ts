// Drizzle table definitions. Column names are camelCase here and snake_case in SQL
// (`casing: "snake_case"` in src/db/index.ts, scripts/db.ts and drizzle.config.ts).
// After changes: `pnpm db:generate`, review the SQL in drizzle/, then `pnpm db:migrate`.
import { relations, type SQL, sql } from "drizzle-orm";
import {
  check,
  customType,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgSequence,
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
/** Who a product is for. "unisex" products appear under both Women and Men. */
export const productAudience = pgEnum("product_audience", ["women", "men", "unisex"]);

/** How the buyer prefers to pay. Payment always happens off the app. */
export const paymentMethod = pgEnum("payment_method", ["cash_on_delivery", "mtn_momo", "orange_money"]);
export const fulfilmentMethod = pgEnum("fulfilment_method", ["delivery", "pickup"]);
/** Order lifecycle. Part 1 of Phase 4 only creates `pending`; the admin workflow arrives in Phase 6. */
export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "awaiting_payment",
  "paid",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
]);
export const orderActor = pgEnum("order_actor", ["customer", "admin", "system"]);

/** Order numbers: AG-1001, AG-1002, … (guessable, so never enough on their own to see an order). */
export const orderNumberSeq = pgSequence("order_number_seq", { startWith: 1001 });

/** Postgres full-text search vector (read-only, generated). */
const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

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
    audience: productAudience().notNull().default("unisex"),
    status: productStatus().notNull().default("draft"),
    seoTitle: text(),
    seoDescription: text(),
    publishedAt: timestamp({ withTimezone: true }),
    /** Weighted search document: name (A), tag (B), summary (C), description (D). */
    searchVector: tsvector().generatedAlwaysAs(
      (): SQL =>
        sql`setweight(to_tsvector('english', ${products.name}), 'A') || setweight(to_tsvector('english', ${products.tag}), 'B') || setweight(to_tsvector('english', ${products.summary}), 'C') || setweight(to_tsvector('english', ${products.description}), 'D')`,
    ),
    ...timestamps,
  },
  (table) => [
    index("products_status_idx").on(table.status),
    index("products_category_idx").on(table.categoryId),
    index("products_audience_idx").on(table.audience),
    index("products_search_idx").using("gin", table.searchVector),
  ],
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

// ── Cart (guest-first; found through the signed `ag_cart` cookie) ──────

export const carts = pgTable(
  "carts",
  {
    id: uuid().primaryKey().defaultRandom(),
    /** Sliding expiry: pushed 30 days ahead on every change. Expired carts are ignored and cleaned up. */
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index("carts_expires_at_idx").on(table.expiresAt)],
);

/** One line per variant. No prices: they are always read live from product_variants. */
export const cartItems = pgTable(
  "cart_items",
  {
    cartId: uuid()
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: uuid()
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer().notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.cartId, table.variantId] }),
    index("cart_items_variant_idx").on(table.variantId),
    check("cart_items_quantity_check", sql`${table.quantity} BETWEEN 1 AND 10`),
  ],
);

// ── Store settings (single row, id = 1) ────────────────────────────────

export type PaymentMethod = (typeof paymentMethod.enumValues)[number];
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

// ── Orders (saved before the WhatsApp hand-off; the source of truth) ────

export const orders = pgTable(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    /** "AG-1001", from order_number_seq. */
    number: text().notNull().unique(),
    status: orderStatus().notNull().default("pending"),
    /** Neon Auth user id once accounts exist (Phase 5). Null for guests. */
    customerId: text(),
    customerName: text().notNull(),
    /** E.164, e.g. +231770123456. */
    whatsappPhone: text().notNull(),
    email: text(),
    fulfilment: fulfilmentMethod().notNull(),
    deliveryArea: text(),
    deliveryStreet: text(),
    deliveryLandmark: text(),
    deliveryNotes: text(),
    paymentMethod: paymentMethod().notNull(),
    /** USD cents, recomputed from the database at placement. */
    subtotalCents: integer().notNull(),
    /** USD cents agreed on WhatsApp; null until the admin enters it. */
    deliveryFeeCents: integer(),
    /** subtotal + delivery fee (USD cents). */
    totalCents: integer().notNull(),
    currency: text().notNull().default("USD"),
    /** Snapshot of the LRD per USD rate when the order was placed. */
    lrdPerUsd: numeric({ precision: 10, scale: 4, mode: "number" }).notNull(),
    /** SHA-256 (hex) of the guest access token. The token itself is never stored. */
    accessTokenHash: text().notNull(),
    /** Random key rendered into the checkout form, so a resubmit can't create a second order. */
    idempotencyKey: text().notNull().unique(),
    whatsappConsentAt: timestamp({ withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
    index("orders_whatsapp_phone_idx").on(table.whatsappPhone),
    index("orders_customer_idx").on(table.customerId),
    check("orders_subtotal_check", sql`${table.subtotalCents} >= 0`),
    check("orders_delivery_fee_check", sql`${table.deliveryFeeCents} IS NULL OR ${table.deliveryFeeCents} >= 0`),
    check(
      "orders_total_check",
      sql`${table.totalCents} = ${table.subtotalCents} + coalesce(${table.deliveryFeeCents}, 0)`,
    ),
    check("orders_currency_check", sql`${table.currency} = 'USD'`),
    check("orders_rate_check", sql`${table.lrdPerUsd} > 0`),
    check(
      "orders_delivery_address_check",
      sql`${table.fulfilment} <> 'delivery' OR (${table.deliveryArea} IS NOT NULL AND ${table.deliveryLandmark} IS NOT NULL)`,
    ),
  ],
);

/** Line items snapshotted at placement, so later catalog edits never change an order. */
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: uuid().references(() => productVariants.id, { onDelete: "set null" }),
    productId: uuid().references(() => products.id, { onDelete: "set null" }),
    productName: text().notNull(),
    productSlug: text().notNull(),
    sku: text().notNull(),
    color: text().notNull(),
    size: text().notNull(),
    /** USD cents. */
    unitPriceCents: integer().notNull(),
    compareAtCents: integer(),
    quantity: integer().notNull(),
    /** unit × quantity (USD cents). */
    lineTotalCents: integer().notNull(),
    imageUrl: text(),
    imageAlt: text(),
    position: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("order_items_order_idx").on(table.orderId),
    check("order_items_quantity_check", sql`${table.quantity} BETWEEN 1 AND 10`),
    check("order_items_price_check", sql`${table.unitPriceCents} >= 0`),
    check("order_items_line_total_check", sql`${table.lineTotalCents} = ${table.unitPriceCents} * ${table.quantity}`),
  ],
);

/** Status history: every change, with who made it. */
export const orderEvents = pgTable(
  "order_events",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: orderStatus(),
    toStatus: orderStatus().notNull(),
    actor: orderActor().notNull(),
    actorId: text(),
    note: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("order_events_order_idx").on(table.orderId, table.createdAt)],
);

/** Payments received off the app, recorded by the admin (Phase 6). */
export const payments = pgTable(
  "payments",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    method: paymentMethod().notNull(),
    /** USD cents credited to the order. */
    amountCents: integer().notNull(),
    /** Liberian dollars received, when paid in LRD. */
    amountLrd: numeric({ precision: 12, scale: 2, mode: "number" }),
    /** Mobile-money transaction ID, if any. */
    transactionRef: text(),
    receivedAt: timestamp({ withTimezone: true }).notNull(),
    notes: text(),
    recordedBy: text(),
    ...timestamps,
  },
  (table) => [
    index("payments_order_idx").on(table.orderId),
    check("payments_amount_check", sql`${table.amountCents} > 0`),
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

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  variant: one(productVariants, { fields: [cartItems.variantId], references: [productVariants.id] }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  events: many(orderEvents),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));
