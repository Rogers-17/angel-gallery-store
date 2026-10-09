import { ButtonLink } from "@/components/ui/button";
import { Media, type MediaTone } from "@/components/ui/media";
import { cn } from "@/lib/cn";

export type PromoTile = {
  title: string;
  cta: string;
  href: string;
  tone: MediaTone;
  image: { src: string; alt: string; position?: string };
  /** Large centred label instead of a sentence. */
  display?: boolean;
};

/** Three rounded image tiles with copy over a gradient. Snap-scroll row on mobile. */
export function PromoTiles({ tiles }: { tiles: PromoTile[] }) {
  return (
    <ul className="scrollbar-none -mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
      {tiles.map((tile) => (
        <li key={tile.cta} className="w-[78%] shrink-0 snap-start md:w-auto">
          <div className="group relative overflow-hidden rounded-card">
            <Media
              ratio="4/5"
              tone={tile.tone}
              src={tile.image.src}
              alt={tile.image.alt}
              objectPosition={tile.image.position}
              sizes="(min-width: 768px) 33vw, 78vw"
              zoomOnHover
            />
            <div
              className={cn(
                "absolute inset-0",
                tile.display ? "bg-ink/30" : "bg-linear-to-t from-ink/80 via-ink/20 to-transparent",
              )}
            />
            {tile.display ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center text-inverse">
                <p className="font-serif text-h2 font-semibold tracking-wide">{tile.title}</p>
                <ButtonLink href={tile.href} variant="inverse" size="sm">{tile.cta}</ButtonLink>
              </div>
            ) : (
              <div className="absolute inset-x-0 bottom-0 p-5 text-inverse md:p-6">
                <p className="max-w-xs text-body font-semibold">{tile.title}</p>
                <ButtonLink href={tile.href} variant="dark" size="sm" className="mt-5">{tile.cta}</ButtonLink>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
