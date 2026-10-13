// Listing logic shared by /shop, /shop/[category], /collections/[slug] and /search:
// validate URL search params, filter/sort/paginate in memory, and build filter links.
import { z } from "zod";
import type { ListingItem, ProductAudience } from "@/db/queries/types";

export const PAGE_SIZE = 12;

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;
export type SortValue = (typeof sortOptions)[number]["value"];

export const priceBands = [
  { value: "under-100", label: "Under $100", min: 0, max: 9_999 },
  { value: "100-200", label: "$100 – $200", min: 10_000, max: 19_999 },
  { value: "200-300", label: "$200 – $300", min: 20_000, max: 29_999 },
  { value: "300-plus", label: "$300 and up", min: 30_000, max: Number.POSITIVE_INFINITY },
] as const;
export type PriceBand = (typeof priceBands)[number]["value"];

export const audienceOptions = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
] as const;

const slug = z.string().regex(/^[a-z0-9-]{1,40}$/);
const option = z.string().trim().min(1).max(40);

/** Each field falls back on its own, so one bad value never breaks the page. */
const listingParamsSchema = z.object({
  category: slug.optional().catch(undefined),
  audience: z.enum(["women", "men"]).optional().catch(undefined),
  size: z.array(option).max(20).catch([]),
  color: z.array(option).max(20).catch([]),
  price: z.enum(priceBands.map((b) => b.value) as [PriceBand, ...PriceBand[]]).optional().catch(undefined),
  instock: z.literal("1").optional().catch(undefined),
  sort: z.enum(sortOptions.map((o) => o.value) as [SortValue, ...SortValue[]]).catch("featured"),
  page: z.coerce.number().int().min(1).max(500).catch(1),
  q: z.string().max(80).optional().catch(undefined),
});

export type ListingParams = z.infer<typeof listingParamsSchema>;

const MULTI_KEYS = new Set(["size", "color"]);

export function parseListingParams(raw: RawSearchParams): ListingParams {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    const values = Array.isArray(value) ? value : [value];
    normalized[key] = MULTI_KEYS.has(key) ? [...new Set(values)] : values[0];
  }
  normalized.size ??= [];
  normalized.color ??= [];
  return listingParamsSchema.parse(normalized);
}

function matchesAudience(itemAudience: ProductAudience, wanted: ListingParams["audience"]) {
  return !wanted || itemAudience === wanted || itemAudience === "unisex";
}

export function filterItems(items: ListingItem[], params: ListingParams): ListingItem[] {
  const band = priceBands.find((b) => b.value === params.price);
  return items.filter(
    (item) =>
      (!params.category || item.categorySlug === params.category) &&
      matchesAudience(item.audience, params.audience) &&
      (params.size.length === 0 || item.sizes.some((s) => params.size.includes(s))) &&
      (params.color.length === 0 || item.colors.some((c) => params.color.includes(c.name))) &&
      (!band || (item.priceCents >= band.min && item.priceCents <= band.max)) &&
      (!params.instock || item.inStock),
  );
}

export function sortItems(items: ListingItem[], sort: SortValue): ListingItem[] {
  const sorted = [...items];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.position - b.position);
    case "price-asc":
      return sorted.sort((a, b) => a.priceCents - b.priceCents || a.position - b.position);
    case "price-desc":
      return sorted.sort((a, b) => b.priceCents - a.priceCents || a.position - b.position);
    default:
      return sorted.sort((a, b) => a.position - b.position);
  }
}

export type Page<T> = { items: T[]; page: number; pageCount: number; total: number; from: number; to: number };

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE): Page<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { items: slice, page: current, pageCount, total, from: total ? start + 1 : 0, to: start + slice.length };
}

// ── Facets ─────────────────────────────────────────────────────────────

const CLOTHING_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

/** EU 36 < EU 37, XS < S < M, "One size" last. */
export function compareSizes(a: string, b: string): number {
  const rank = (s: string) => {
    const eu = /^EU (\d+(?:\.\d)?)$/.exec(s);
    if (eu) return 100 + Number(eu[1]);
    const clothing = CLOTHING_ORDER.indexOf(s);
    if (clothing >= 0) return clothing;
    return s === "One size" ? 1_000 : 500;
  };
  return rank(a) - rank(b) || a.localeCompare(b);
}

export type Facets = {
  sizes: string[];
  colors: { name: string; hex: string }[];
  categories: string[];
};

/** Options available in the whole scope (before filters), so choices don't vanish as you filter. */
export function buildFacets(items: ListingItem[]): Facets {
  const colors = new Map<string, string>();
  for (const item of items) for (const c of item.colors) if (!colors.has(c.name)) colors.set(c.name, c.hex);
  return {
    sizes: [...new Set(items.flatMap((i) => i.sizes))].sort(compareSizes),
    colors: [...colors].map(([name, hex]) => ({ name, hex })).sort((a, b) => a.name.localeCompare(b.name)),
    categories: [...new Set(items.map((i) => i.categorySlug))],
  };
}

// ── Links ──────────────────────────────────────────────────────────────

type ParamChange = { key: keyof ListingParams; value?: string; toggle?: boolean };

function toSearchParams(params: ListingParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.audience) sp.set("audience", params.audience);
  for (const s of params.size) sp.append("size", s);
  for (const c of params.color) sp.append("color", c);
  if (params.price) sp.set("price", params.price);
  if (params.instock) sp.set("instock", params.instock);
  if (params.sort !== "featured") sp.set("sort", params.sort);
  if (params.page > 1) sp.set("page", String(params.page));
  return sp;
}

/**
 * Link to `pathname` with one parameter changed. Filter changes reset to page 1.
 * `toggle` adds/removes a value for multi-value keys (size, color) or clears a single one.
 */
export function listingHref(pathname: string, params: ListingParams, change?: ParamChange): string {
  const next: ListingParams = { ...params, size: [...params.size], color: [...params.color] };
  if (change) {
    const { key, value, toggle } = change;
    if (key === "size" || key === "color") {
      const list = next[key];
      next[key] = value === undefined ? [] : list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    } else if (key === "page") {
      next.page = Number(value ?? 1);
    } else {
      const current = next[key];
      (next as Record<string, unknown>)[key] = toggle && current === value ? undefined : value;
    }
    if (key !== "page") next.page = 1;
  }
  const query = toSearchParams(next).toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Number of active filters (for the mobile "Filters (n)" button). */
export function activeFilterCount(params: ListingParams, includeCategory: boolean): number {
  return (
    (includeCategory && params.category ? 1 : 0) +
    (params.audience ? 1 : 0) +
    params.size.length +
    params.color.length +
    (params.price ? 1 : 0) +
    (params.instock ? 1 : 0)
  );
}
