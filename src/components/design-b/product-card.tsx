import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Media, type MediaTone } from "@/components/ui/media";

export type DesignBProductCardProps = {
  href: string;
  name: string;
  summary: string;
  tag: string;
  price: string;
  compareAtPrice?: string;
  badge?: string;
  tone: MediaTone;
  image: { src: string; alt: string; position?: string };
};

/** Price-first card with a tag pill and two actions. "Add to Cart" is visual only for now. */
export function DesignBProductCard({
  href,
  name,
  summary,
  tag,
  price,
  compareAtPrice,
  badge,
  tone,
  image,
}: DesignBProductCardProps) {
  return (
    <article className="flex h-full flex-col">
      <Link href={href} className="group block" tabIndex={-1} aria-hidden>
        <Media
          ratio="1/1"
          tone={tone}
          src={image.src}
          alt=""
          objectPosition={image.position}
          sizes="(min-width: 1024px) 33vw, 50vw"
          zoomOnHover
          className="rounded-card"
        >
          {badge && (
            <span className="absolute top-3 left-3 rounded-pill bg-paper px-3 py-1 text-small font-medium text-ink">
              {badge}
            </span>
          )}
        </Media>
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <p className="text-h4 font-semibold tabular-nums">
          {compareAtPrice ? (
            <>
              <span className="text-accent">{price}</span>{" "}
              <s className="text-small font-normal text-muted">{compareAtPrice}</s>
            </>
          ) : (
            price
          )}
        </p>
        <span className="mt-0.5 shrink-0 rounded-pill bg-surface px-2.5 py-1 text-label tracking-normal text-ink-soft">
          {tag}
        </span>
      </div>

      <h3 className="mt-1 font-sans text-body font-medium">
        <Link href={href} className="hover:underline hover:underline-offset-4">{name}</Link>
      </h3>
      <p className="mt-1 line-clamp-2 text-small text-muted">{summary}</p>

      <div className="mt-auto grid gap-2 pt-4 sm:grid-cols-2">
        <Button variant="secondary" size="sm">Add to Cart</Button>
        <ButtonLink href={href} variant="primary" size="sm">Buy Now</ButtonLink>
      </div>
    </article>
  );
}
