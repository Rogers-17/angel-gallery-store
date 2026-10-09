import { ButtonLink } from "@/components/ui/button";
import { Media, type MediaTone } from "@/components/ui/media";
import { cn } from "@/lib/cn";
import { ArrowUpRightIcon } from "./icons";

export type MosaicItem = {
  label: string;
  cta: string;
  href: string;
  tone: MediaTone;
  image: { src: string; alt: string; position?: string };
};

function MosaicCard({ item, className, mediaClassName, sizes }: {
  item: MosaicItem;
  className?: string;
  mediaClassName?: string;
  sizes: string;
}) {
  return (
    <div className={cn("group relative overflow-hidden rounded-card", className)}>
      <Media
        ratio="4/5"
        tone={item.tone}
        src={item.image.src}
        alt={item.image.alt}
        objectPosition={item.image.position}
        sizes={sizes}
        zoomOnHover
        className={mediaClassName}
      />
      <div className="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-4 p-5 text-inverse md:p-7">
        <p className="font-serif text-h2 font-light">{item.label}</p>
        <ButtonLink href={item.href} variant="inverse" size="sm" shape="pill">
          {item.cta}
          <ArrowUpRightIcon width={16} height={16} />
        </ButtonLink>
      </div>
    </div>
  );
}

/**
 * Tall card left, two stacked right, wide card below (md+). Single column on mobile.
 */
export function Mosaic({ tall, topRight, bottomRight, wide }: {
  tall: MosaicItem;
  topRight: MosaicItem;
  bottomRight: MosaicItem;
  wide: MosaicItem;
}) {
  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div className="grid gap-4 md:grid-cols-2 md:grid-rows-2 md:gap-5">
        <MosaicCard item={tall} className="md:row-span-2" sizes="(min-width: 768px) 50vw, 100vw" />
        <MosaicCard item={topRight} mediaClassName="md:aspect-auto md:h-full" sizes="(min-width: 768px) 50vw, 100vw" />
        <MosaicCard item={bottomRight} mediaClassName="md:aspect-auto md:h-full" sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
      <MosaicCard item={wide} mediaClassName="md:aspect-21/9" sizes="100vw" />
    </div>
  );
}
