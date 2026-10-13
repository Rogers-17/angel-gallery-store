import Link from "next/link";
import type { ReactNode } from "react";
import { audienceOptions, type Facets, listingHref, type ListingParams, priceBands } from "@/lib/listing";
import { cn } from "@/lib/cn";

type FilterPanelProps = {
  pathname: string;
  params: ListingParams;
  facets: Facets;
  /** Category slug → display name; only shown on /shop. */
  categoryNames?: Record<string, string>;
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="hairline border-b py-5 first:pt-0">
      <h3 className="font-sans text-small font-semibold">{title}</h3>
      <ul className="mt-3 flex flex-col gap-1">{children}</ul>
    </div>
  );
}

function Option({ href, selected, label, swatch, multi }: {
  href: string;
  selected: boolean;
  label: string;
  swatch?: string;
  multi?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        rel="nofollow"
        scroll={false}
        className="group flex items-center gap-3 rounded-control py-1.5 text-small text-ink-soft transition-colors hover:text-ink"
      >
        <span
          aria-hidden
          className={cn(
            "flex size-4 shrink-0 items-center justify-center border transition-colors",
            multi ? "rounded-sm" : "rounded-pill",
            selected ? "border-ink bg-ink" : "border-line-strong group-hover:border-ink",
          )}
        >
          {selected && <span className={cn("bg-paper", multi ? "size-1.5 rounded-xs" : "size-1.5 rounded-pill")} />}
        </span>
        {swatch && (
          <span
            aria-hidden
            className="size-4 shrink-0 rounded-pill border border-ink/15"
            // Swatch colours are product data, not design tokens.
            style={{ backgroundColor: swatch }}
          />
        )}
        <span className={cn(selected && "font-medium text-ink")}>{label}</span>
        {selected && <span className="sr-only">(selected)</span>}
      </Link>
    </li>
  );
}

/** Filter groups as plain links (no JS). Each link toggles one URL parameter. */
export function FilterPanel({ pathname, params, facets, categoryNames }: FilterPanelProps) {
  return (
    <nav aria-label="Filters">
      {categoryNames && facets.categories.length > 1 && (
        <Group title="Category">
          {/* Store order (categoryNames is built from categories sorted by position). */}
          {Object.keys(categoryNames).filter((slug) => facets.categories.includes(slug)).map((slug) => (
            <Option
              key={slug}
              href={listingHref(pathname, params, { key: "category", value: slug, toggle: true })}
              selected={params.category === slug}
              label={categoryNames[slug] ?? slug}
            />
          ))}
        </Group>
      )}

      <Group title="Shop For">
        {audienceOptions.map((option) => (
          <Option
            key={option.value}
            href={listingHref(pathname, params, { key: "audience", value: option.value, toggle: true })}
            selected={params.audience === option.value}
            label={option.label}
          />
        ))}
      </Group>

      <Group title="Price">
        {priceBands.map((band) => (
          <Option
            key={band.value}
            href={listingHref(pathname, params, { key: "price", value: band.value, toggle: true })}
            selected={params.price === band.value}
            label={band.label}
          />
        ))}
      </Group>

      {facets.sizes.length > 1 && (
        <div className="hairline border-b py-5">
          <h3 className="font-sans text-small font-semibold">Size</h3>
          {/* Compact chip grid: shoe and clothing sizes together would make a very long list. */}
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {facets.sizes.map((size) => {
              const selected = params.size.includes(size);
              return (
                <li key={size} className={size === "One size" ? "col-span-3" : undefined}>
                  <Link
                    href={listingHref(pathname, params, { key: "size", value: size })}
                    rel="nofollow"
                    scroll={false}
                    aria-current={selected ? "true" : undefined}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-control border text-caption transition-colors",
                      selected ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink hover:text-ink",
                    )}
                  >
                    {size.replace(/^EU /, "")}
                    <span className="sr-only">{size.startsWith("EU ") ? " (EU size)" : ""}{selected ? " (selected)" : ""}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {facets.colors.length > 1 && (
        <Group title="Colour">
          {facets.colors.map((color) => (
            <Option
              key={color.name}
              multi
              href={listingHref(pathname, params, { key: "color", value: color.name })}
              selected={params.color.includes(color.name)}
              label={color.name}
              swatch={color.hex}
            />
          ))}
        </Group>
      )}

      <Group title="Availability">
        <Option
          multi
          href={listingHref(pathname, params, { key: "instock", value: "1", toggle: true })}
          selected={params.instock === "1"}
          label="In stock only"
        />
      </Group>
    </nav>
  );
}
