// TEMPORARY demo data for the design-system test homepage.
// Replace with Drizzle queries once the product schema exists.
// Images live in public/images/demo (see CREDITS.md there).
import type { MediaTone } from "@/components/ui/media";

export type DemoImage = {
  src: string;
  alt: string;
  /** Tailwind object-position class for cropping. */
  position?: string;
};

export type DemoProduct = {
  id: string;
  name: string;
  detail: string;
  price: number;
  compareAtPrice?: number;
  badge?: "New" | "Sold out";
  tone: MediaTone;
  image: DemoImage;
};

const img = (file: string, alt: string, position?: string): DemoImage => ({
  src: `/images/demo/${file}`,
  alt,
  position,
});

export const heroImage = img("hero-living-room.jpg", "Neutral living room with a cream sofa and travertine table");

export const journalImage = img("journal-pottery.jpg", "Hands shaping a clay pot on a potter's wheel");

export const newArrivals: DemoProduct[] = [
  { id: "1", name: "Oversized Wool Coat", detail: "Camel", price: 420, badge: "New", tone: "clay", image: img("wool-coat.jpg", "Model wearing a camel wool coat", "object-top") },
  { id: "2", name: "Cotton Trench", detail: "Sand", price: 360, tone: "sand", image: img("cotton-trench.jpg", "Model wearing a sand cotton trench coat", "object-top") },
  { id: "3", name: "Ribbed Wool Sweater", detail: "Ecru", price: 210, badge: "New", tone: "mist", image: img("ribbed-sweater.jpg", "Ecru ribbed wool sweater") },
  { id: "4", name: "Cotton Poplin Shirt", detail: "Chalk", price: 160, tone: "mist", image: img("poplin-shirt.jpg", "White cotton shirt on a wooden hanger", "object-[40%_center]") },
  { id: "5", name: "Glazed Bud Vase", detail: "Cobalt", price: 120, tone: "mist", image: img("bud-vase.jpg", "Cobalt glazed bud vase on a white surface") },
  { id: "6", name: "Speckled Bowls, Set of 4", detail: "Stoneware", price: 95, compareAtPrice: 130, tone: "stone", image: img("speckled-bowls.jpg", "Stacked speckled stoneware bowls", "object-[65%_center]") },
  { id: "7", name: "Sake Set", detail: "Ash glaze", price: 140, badge: "Sold out", tone: "stone", image: img("sake-set.jpg", "Stoneware bottle and two cups") },
  { id: "8", name: "Leather Bifold Wallet", detail: "Black", price: 85, tone: "stone", image: img("bifold-wallet.jpg", "Black leather bifold wallet held in a hand") },
];

export const categories: { name: string; tone: MediaTone; image: DemoImage }[] = [
  { name: "Clothing", tone: "stone", image: img("category-clothing.jpg", "Clothing rack in a minimal boutique") },
  { name: "Objects", tone: "mist", image: img("category-objects.jpg", "Stacked white porcelain bowls") },
  { name: "Accessories", tone: "mist", image: img("category-accessories.jpg", "Black leather pouch on an open book", "object-bottom") },
];

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
