"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

// Demo data has one photo per product, so the thumbnails are framed crops of it.
// Swap `views` for real alternate shots when product photography exists.
const views = [
  { label: "Full view", className: "object-center" },
  { label: "Detail, left", className: "object-left scale-150" },
  { label: "Detail, right", className: "object-right scale-150" },
  { label: "Close-up", className: "object-bottom scale-[1.8]" },
];

type ProductGalleryProps = {
  src: string;
  alt: string;
  position?: string;
  /** Tone utility for the loading background, e.g. "tone-sand". */
  toneClass: string;
};

export function ProductGallery({ src, alt, position, toneClass }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const view = views[active];

  return (
    <div className="flex flex-col gap-3">
      <div className={cn("relative aspect-square overflow-hidden rounded-card", toneClass)}>
        <Image
          src={src}
          alt={`${alt} (${view.label.toLowerCase()})`}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={cn("object-cover transition-transform duration-500 ease-out-soft", active === 0 && position, view.className)}
        />
      </div>
      <ul className="grid grid-cols-4 gap-3" aria-label="Product views">
        {views.map((thumb, index) => (
          <li key={thumb.label}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-label={thumb.label}
              aria-pressed={active === index}
              className={cn(
                "relative block aspect-square w-full overflow-hidden rounded-control border-2 transition-colors",
                toneClass,
                active === index ? "border-primary" : "border-transparent hover:border-line-strong",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 1024px) 12vw, 25vw"
                className={cn("object-cover", index === 0 && position, thumb.className)}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
