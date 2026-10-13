import Link from "next/link";
import type { ProductCardData } from "@/db/queries/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { Price } from "@/components/ui/price";
import { Tag } from "@/components/ui/tag";

const badgeLabels = { new: "New", bestseller: "Bestseller" } as const;

export function productHref(slug: string): string {
  return `/products/${slug}`;
}

type ProductCardProps = {
  product: ProductCardData;
  /** Liberian dollars per 1 USD, for the ≈ LRD line. */
  lrdPerUsd?: number;
};

/**
 * Price-first product card: image on a gradient well, price (USD + ≈ LRD) and tag pill, name,
 * two-line summary, then "Add to Cart" (secondary) and "Buy Now" (primary).
 * Add to Cart is visual only until the cart exists (roadmap Phase 3).
 */
export function ProductCard({ product, lrdPerUsd }: ProductCardProps) {
  const href = productHref(product.slug);
  const badge = !product.inStock ? "Sold out" : product.badge ? badgeLabels[product.badge] : null;

  return (
    <article className="flex h-full flex-col">
      <Link href={href} className="group block" tabIndex={-1} aria-hidden>
        <Media
          ratio="1/1"
          surface="well"
          src={product.image?.url}
          alt=""
          objectPosition={product.image?.objectPosition ?? undefined}
          sizes="(min-width: 1024px) 33vw, 50vw"
          zoomOnHover
          className={product.inStock ? undefined : "opacity-70"}
        >
          {badge && (
            <span className="absolute top-3 left-3 rounded-pill bg-paper px-3 py-1 text-caption font-medium text-ink">
              {badge}
            </span>
          )}
        </Media>
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <Price cents={product.priceCents} compareAtCents={product.compareAtCents} lrdPerUsd={lrdPerUsd} />
        <Tag className="mt-1">{product.tag}</Tag>
      </div>

      <h3 className="mt-2 font-sans text-body font-medium">
        <Link href={href} className="hover:underline hover:underline-offset-4">{product.name}</Link>
      </h3>
      <p className="mt-1 line-clamp-2 text-caption text-muted">{product.summary}</p>

      <div className="mt-auto grid gap-2 pt-4 sm:grid-cols-2">
        <Button variant="secondary" size="sm" disabled={!product.inStock}>Add to Cart</Button>
        <ButtonLink href={href} variant="primary" size="sm">
          {product.inStock ? "Buy Now" : "View"}
        </ButtonLink>
      </div>
    </article>
  );
}
