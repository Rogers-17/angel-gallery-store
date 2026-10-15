import Link from "next/link";
import type { ProductCardData } from "@/db/queries/types";
import { AddToCartButtons } from "@/components/cart/add-to-cart-buttons";
import { ButtonLink } from "@/components/ui/button";
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
 * two-line summary, then the actions. A single in-stock variant can be added from the card;
 * anything with options links to the product page ("Choose Options").
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

      <div className="mt-auto pt-4">
        {product.singleVariantId ? (
          <AddToCartButtons variantId={product.singleVariantId} size="sm" className="sm:grid-cols-2" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {product.inStock && (
              <ButtonLink href={href} variant="secondary" size="sm">Choose Options</ButtonLink>
            )}
            <ButtonLink href={href} variant="primary" size="sm" className={product.inStock ? undefined : "sm:col-span-2"}>
              {product.inStock ? "Buy Now" : "View"}
            </ButtonLink>
          </div>
        )}
      </div>
    </article>
  );
}
