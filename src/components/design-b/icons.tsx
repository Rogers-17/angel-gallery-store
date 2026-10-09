import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (props: IconProps) => (
  <Icon {...props}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Icon>
);

export const UserIcon = (props: IconProps) => (
  <Icon {...props}><circle cx="12" cy="8" r="4" /><path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></Icon>
);

export const HeartIcon = (props: IconProps) => (
  <Icon {...props}><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" /></Icon>
);

export const BagIcon = (props: IconProps) => (
  <Icon {...props}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></Icon>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <Icon {...props}><path d="M19 12H5m6-6-6 6 6 6" /></Icon>
);

export const ArrowRightIcon = (props: IconProps) => (
  <Icon {...props}><path d="M5 12h14m-6-6 6 6-6 6" /></Icon>
);

export const ArrowUpRightIcon = (props: IconProps) => (
  <Icon {...props}><path d="M7 17 17 7M9 7h8v8" /></Icon>
);

/** "AG" monogram used as the Bold theme logo mark (original, not from the reference). */
export function Monogram({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-pill border border-current font-serif text-small font-semibold",
        className,
      )}
    >
      AG
    </span>
  );
}
