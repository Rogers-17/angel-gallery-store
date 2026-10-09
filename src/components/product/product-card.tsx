import Link from "next/link";
import { Media, type MediaTone } from "@/components/ui/media";
import { cn } from "@/lib/cn";

export type ProductCardProps = {
  href: string;
  name: string;
  detail?: string;
  price: string;
  compareAtPrice?: string;
  badge?: string;
  tone: MediaTone;
  hoverTone?: MediaTone;
  image?: { src: string; alt: string; position?: string };
  soldOut?: boolean;
};

export function ProductCard({
  href,
  name,
  detail,
  price,
  compareAtPrice,
  badge,
  tone,
  hoverTone,
  image,
  soldOut,
}: ProductCardProps) {
  return (
    <Link href={href} className="group block">
      <Media
        ratio="4/5"
        tone={tone}
        hoverTone={hoverTone}
        src={image?.src}
        alt={image?.alt}
        objectPosition={image?.position}
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
        zoomOnHover
        className={cn(soldOut && "opacity-60")}
      >
        {badge && (
          <span className="eyebrow absolute top-3 left-3 bg-paper px-2 py-1 text-ink">{badge}</span>
        )}
      </Media>
      <div className="mt-3 flex flex-col gap-0.5 text-small sm:flex-row sm:justify-between sm:gap-4">
        <div>
          <h3 className="font-sans group-hover:underline group-hover:underline-offset-4">{name}</h3>
          {detail && <p className="text-muted">{detail}</p>}
        </div>
        <p className="shrink-0 tabular-nums">
          {compareAtPrice ? (
            <>
              <span className="text-accent">{price}</span>{" "}
              <s className="text-muted">{compareAtPrice}</s>
            </>
          ) : (
            price
          )}
        </p>
      </div>
    </Link>
  );
}
