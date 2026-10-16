// Plain, serializable shapes returned by the data-access layer (safe to pass to client components).
import type { Fulfilment, OrderStatus } from "@/lib/orders/labels";
import type { PaymentInstructions, PaymentMethod } from "../schema";

export type ProductBadge = "new" | "bestseller";

export type ImageData = {
  url: string;
  alt: string;
  /** Tailwind object-position class, e.g. "object-top". */
  objectPosition: string | null;
};

export type VariantData = {
  id: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  priceCents: number;
  compareAtCents: number | null;
  stock: number;
};

export type ProductCardData = {
  slug: string;
  name: string;
  tag: string;
  summary: string;
  badge: ProductBadge | null;
  /** Lowest variant price (USD cents). */
  priceCents: number;
  compareAtCents: number | null;
  inStock: boolean;
  image: ImageData | null;
  /** Set when the product has exactly one variant and it's in stock, so cards can add it directly. */
  singleVariantId: string | null;
};

export type ProductDetail = ProductCardData & {
  id: string;
  description: string;
  materials: string[];
  care: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  category: { id: string; slug: string; name: string };
  images: ImageData[];
  variants: VariantData[];
};

export type StoreSettingsData = {
  whatsappNumber: string | null;
  lrdPerUsd: number;
  /** ISO timestamp. */
  lrdRateUpdatedAt: string;
  paymentInstructions: PaymentInstructions;
  contactEmail: string | null;
  contactPhone: string | null;
  /** WhatsApp order message with {{placeholders}}; null uses the built-in default. */
  orderMessageTemplate: string | null;
};

export type ProductAudience = "women" | "men" | "unisex";

/** A product card plus the facet data listings filter and sort on (in memory). */
export type ListingItem = ProductCardData & {
  audience: ProductAudience;
  categorySlug: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  /** ISO timestamp, for "newest". */
  createdAt: string;
  /** Position in the scope's natural order (collection order, else newest first). */
  position: number;
};

/** One cart line, priced from the live variant (carts store no prices). */
export type CartLine = {
  variantId: string;
  productSlug: string;
  productName: string;
  image: ImageData | null;
  color: string;
  size: string;
  sku: string;
  /** Current USD cents. */
  unitPriceCents: number;
  compareAtCents: number | null;
  quantity: number;
  /** min(stock, MAX_LINE_QUANTITY); 0 when unavailable. */
  maxQuantity: number;
  /** Product is active and the variant has stock. */
  available: boolean;
  /** unit × min(quantity, maxQuantity); 0 when unavailable. */
  lineTotalCents: number;
};

export type CartView = {
  lines: CartLine[];
  /** Sum of line quantities (header badge). */
  itemCount: number;
  /** USD cents over available lines, each counted up to its stock. */
  subtotalCents: number;
};

/** A snapshotted order line (prices as they were at placement). */
export type OrderLine = {
  productSlug: string;
  productName: string;
  color: string;
  size: string;
  sku: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  image: ImageData | null;
};

/** An order as its buyer sees it. Never includes the token hash, idempotency key or customer id. */
export type OrderView = {
  number: string;
  status: OrderStatus;
  /** ISO timestamp. */
  placedAt: string;
  customerName: string;
  /** E.164. */
  whatsappPhone: string;
  email: string | null;
  fulfilment: Fulfilment;
  delivery: { area: string; street: string | null; landmark: string; notes: string | null } | null;
  paymentMethod: PaymentMethod;
  subtotalCents: number;
  /** Null until agreed on WhatsApp. */
  deliveryFeeCents: number | null;
  totalCents: number;
  /** LRD per USD when the order was placed. */
  lrdPerUsd: number;
  lines: OrderLine[];
  itemCount: number;
};

export type CategoryData ={ id: string; slug: string; name: string; description: string | null };
export type CollectionData = { id: string; slug: string; name: string; description: string | null };
