import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const ratios = {
  "4/5": "aspect-4/5",
  "3/4": "aspect-3/4",
  "1/1": "aspect-square",
  "16/9": "aspect-video",
  "21/9": "aspect-21/9",
} as const;

// Full class names so Tailwind can detect them.
const tones = {
  sand: "tone-sand",
  stone: "tone-stone",
  clay: "tone-clay",
  sage: "tone-sage",
  mist: "tone-mist",
  umber: "tone-umber",
} as const;

export type MediaRatio = keyof typeof ratios;
export type MediaTone = keyof typeof tones;

/** Tone background utility class, for image frames built outside `Media`. */
export function toneClass(tone: MediaTone): string {
  return tones[tone];
}

type MediaProps = {
  ratio?: MediaRatio;
  /** Background tone: the placeholder when there is no image, the loading color when there is. */
  tone?: MediaTone;
  /** Placeholder only: second tone revealed when a parent `group` is hovered. */
  hoverTone?: MediaTone;
  /** Image path; omit to render a tonal placeholder. */
  src?: string;
  /** Alt text for the image; omit (or "") for decorative media. */
  alt?: string;
  /** `next/image` sizes hint, e.g. "(min-width: 1024px) 25vw, 50vw". */
  sizes?: string;
  /** Load eagerly (above-the-fold images such as the hero). */
  priority?: boolean;
  /** Tailwind object-position class, e.g. "object-top". */
  objectPosition?: string;
  /** Slightly zoom the image when a parent `group` is hovered. */
  zoomOnHover?: boolean;
  className?: string;
  children?: ReactNode;
};

/** Fixed-ratio image frame. Renders a tonal placeholder when no image is given. */
export function Media({
  ratio = "4/5",
  tone = "sand",
  hoverTone,
  src,
  alt = "",
  sizes = "100vw",
  priority,
  objectPosition = "object-center",
  zoomOnHover,
  className,
  children,
}: MediaProps) {
  const zoom = "transition-transform duration-700 ease-out-soft group-hover:scale-103";

  return (
    <div
      role={!src && alt ? "img" : undefined}
      aria-label={!src && alt ? alt : undefined}
      className={cn("relative overflow-hidden", tones[tone], ratios[ratio], className)}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", objectPosition, zoomOnHover && zoom)}
        />
      ) : (
        hoverTone && (
          <div
            aria-hidden
            className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-500 ease-out-soft group-hover:opacity-100",
              tones[hoverTone],
            )}
          />
        )
      )}
      {children}
    </div>
  );
}
