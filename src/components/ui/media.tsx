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

type MediaProps = {
  ratio?: MediaRatio;
  tone?: MediaTone;
  /** Second tone revealed when a parent `group` is hovered. */
  hoverTone?: MediaTone;
  /** Describes the image; omit for decorative media. */
  label?: string;
  className?: string;
  children?: ReactNode;
};

/** Fixed-ratio image frame. Renders a tonal placeholder until real imagery exists. */
export function Media({ ratio = "4/5", tone = "sand", hoverTone, label, className, children }: MediaProps) {
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("relative overflow-hidden bg-surface", ratios[ratio], className)}
    >
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-700 ease-out-soft",
          hoverTone && "group-hover:scale-103",
          tones[tone],
        )}
      />
      {hoverTone && (
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-500 ease-out-soft group-hover:opacity-100",
            tones[hoverTone],
          )}
        />
      )}
      {children}
    </div>
  );
}
