// Cache tags for `use cache` reads. Admin mutations (roadmap Phase 6) call
// `updateTag(...)` with these after writing, so the storefront refreshes immediately.
export const cacheTags = {
  /** Every catalog read (lists, product pages, related products). */
  catalog: "catalog",
  collection: (slug: string) => `collection:${slug}`,
  product: (slug: string) => `product:${slug}`,
  settings: "settings",
} as const;
