// TEMPORARY demo data for the design-system test homepage.
// Replace with Drizzle queries once the product schema exists.
import type { MediaTone } from "@/components/ui/media";

export type DemoProduct = {
  id: string;
  name: string;
  detail: string;
  price: number;
  compareAtPrice?: number;
  badge?: "New" | "Sold out";
  tone: MediaTone;
  hoverTone: MediaTone;
};

export const newArrivals: DemoProduct[] = [
  { id: "1", name: "Washed Linen Overshirt", detail: "Oat", price: 185, badge: "New", tone: "sand", hoverTone: "stone" },
  { id: "2", name: "Stoneware Vessel No. 3", detail: "Ash glaze", price: 120, tone: "stone", hoverTone: "mist" },
  { id: "3", name: "Wool Crepe Trouser", detail: "Charcoal", price: 240, tone: "mist", hoverTone: "stone" },
  { id: "4", name: "Hand-dyed Silk Scarf", detail: "Rust", price: 95, compareAtPrice: 130, tone: "clay", hoverTone: "sand" },
  { id: "5", name: "Merino Rib Knit", detail: "Moss", price: 210, badge: "New", tone: "sage", hoverTone: "mist" },
  { id: "6", name: "Cast Brass Candleholder", detail: "Unlacquered", price: 75, tone: "umber", hoverTone: "clay" },
  { id: "7", name: "Cotton Poplin Shirt", detail: "Chalk", price: 160, badge: "Sold out", tone: "sand", hoverTone: "mist" },
  { id: "8", name: "Leather Card Wallet", detail: "Tobacco", price: 85, tone: "clay", hoverTone: "umber" },
];

export const categories: { name: string; tone: MediaTone }[] = [
  { name: "Clothing", tone: "stone" },
  { name: "Objects", tone: "clay" },
  { name: "Accessories", tone: "sage" },
];

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
