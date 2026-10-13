import Link from "next/link";
import { audienceOptions, listingHref, type ListingParams, priceBands } from "@/lib/listing";

type Chip = { label: string; href: string };

/** Removable chips for every active filter, plus "Clear all". */
export function ActiveFilters({ pathname, params, categoryNames, includeCategory }: {
  pathname: string;
  params: ListingParams;
  categoryNames?: Record<string, string>;
  includeCategory: boolean;
}) {
  const chips: Chip[] = [];
  if (includeCategory && params.category) {
    chips.push({
      label: categoryNames?.[params.category] ?? params.category,
      href: listingHref(pathname, params, { key: "category" }),
    });
  }
  if (params.audience) {
    chips.push({
      label: audienceOptions.find((o) => o.value === params.audience)?.label ?? params.audience,
      href: listingHref(pathname, params, { key: "audience" }),
    });
  }
  if (params.price) {
    chips.push({
      label: priceBands.find((b) => b.value === params.price)?.label ?? params.price,
      href: listingHref(pathname, params, { key: "price" }),
    });
  }
  for (const size of params.size) chips.push({ label: size, href: listingHref(pathname, params, { key: "size", value: size }) });
  for (const color of params.color) chips.push({ label: color, href: listingHref(pathname, params, { key: "color", value: color }) });
  if (params.instock) chips.push({ label: "In stock", href: listingHref(pathname, params, { key: "instock" }) });

  if (chips.length === 0) return null;

  const clearAll = listingHref(pathname, {
    ...params,
    category: includeCategory ? undefined : params.category,
    audience: undefined,
    price: undefined,
    size: [],
    color: [],
    instock: undefined,
    page: 1,
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          rel="nofollow"
          scroll={false}
          className="inline-flex h-8 items-center gap-2 rounded-pill bg-tag pr-2 pl-3 text-caption font-medium text-tag-fg transition-colors hover:bg-secondary-hover"
        >
          {chip.label}
          <span aria-hidden className="text-small leading-none">×</span>
          <span className="sr-only">Remove filter</span>
        </Link>
      ))}
      <Link href={clearAll} rel="nofollow" scroll={false} className="link-inline ml-1 text-caption text-muted">
        Clear all
      </Link>
    </div>
  );
}
