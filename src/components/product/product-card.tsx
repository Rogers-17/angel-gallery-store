import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { Tag } from "@/components/ui/tag";

export type ProductCardProps = {
  href: string;
  name: string;
  summary: string;
  tag: string;
  price: string;
  compareAtPrice?: string;
  badge?: string;
  image: { src: string; alt: string; position?: string };
};

/**
 * Price-first product card: image on a gradient well, price + tag pill, name, two-line summary,
 * then "Add to Cart" (secondary) and "Buy Now" (primary). Add to Cart is visual only for now.
 */
export function ProductCard({ href, name, summary, tag, price, compareAtPrice, badge, image }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col">
      <Link href={href} className="group block" tabIndex={-1} aria-hidden>
        <Media
          ratio="1/1"
          surface="well"
          src={image.src}
          alt=""
          objectPosition={image.position}
          sizes="(min-width: 1024px) 33vw, 50vw"
          zoomOnHover
        >
          {badge && (
            <span className="absolute top-3 left-3 rounded-pill bg-paper px-3 py-1 text-caption font-medium text-ink">
              {badge}
            </span>
          )}
        </Media>
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-price font-semibold tabular-nums">
          {compareAtPrice ? (
            <>
              <span className="text-primary">{price}</span>{" "}
              <s className="text-small font-normal text-muted">{compareAtPrice}</s>
            </>
          ) : (
            price
          )}
        </p>
        <Tag>{tag}</Tag>
      </div>

      <h3 className="mt-2 font-sans text-body font-medium">
        <Link href={href} className="hover:underline hover:underline-offset-4">{name}</Link>
      </h3>
      <p className="mt-1 line-clamp-2 text-caption text-muted">{summary}</p>

      <div className="mt-auto grid gap-2 pt-4 sm:grid-cols-2">
        <Button variant="secondary" size="sm">Add to Cart</Button>
        <ButtonLink href={href} variant="primary" size="sm">Buy Now</ButtonLink>
      </div>
    </article>
  );
}
