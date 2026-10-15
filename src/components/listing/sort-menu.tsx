import Link from "next/link";
import { listingHref, type ListingParams, sortOptions } from "@/lib/listing";
import { cn } from "@/lib/cn";

/** Sort dropdown built from <details> + links: works without JavaScript. */
export function SortMenu({ pathname, params, featuredLabel = "Featured" }: {
  pathname: string;
  params: ListingParams;
  /** Search uses "Relevance" for the default order. */
  featuredLabel?: string;
}) {
  const labelFor = (value: string, label: string) => (value === "featured" ? featuredLabel : label);
  const current = sortOptions.find((o) => o.value === params.sort) ?? sortOptions[0];

  return (
    // Keyed by URL: after a sort link navigates, React mounts a fresh (closed) <details>.
    <details key={listingHref(pathname, params)} className="group relative">
      <summary className="btn btn-outline btn-sm btn-pill cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        Sort: {labelFor(current.value, current.label)}
        <span aria-hidden className="transition-transform group-open:rotate-180">▾</span>
      </summary>
      <ul className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-card border border-line bg-paper py-2">
        {sortOptions.map((option) => (
          <li key={option.value}>
            <Link
              href={listingHref(pathname, params, { key: "sort", value: option.value })}
              rel="nofollow"
              scroll={false}
              aria-current={option.value === params.sort ? "true" : undefined}
              className={cn(
                "block px-4 py-2 text-small transition-colors hover:bg-surface",
                option.value === params.sort && "font-semibold",
              )}
            >
              {labelFor(option.value, option.label)}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
