// Plain, serializable shapes returned by the data-access layer (safe to pass to client components).
import type { PaymentInstructions } from "../schema";

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
};
