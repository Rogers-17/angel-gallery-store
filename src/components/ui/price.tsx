import { formatLrd, formatUsd } from "@/lib/money";
import { cn } from "@/lib/cn";

type PriceProps = {
  /** USD cents. */
  cents: number;
  /** Original USD cents when on sale. */
  compareAtCents?: number | null;
  /** Liberian dollars per 1 USD; omit to hide the LRD line. */
  lrdPerUsd?: number;
  /** "line": compact, for cart line items. */
  size?: "card" | "pdp" | "line";
  className?: string;
};

/** USD price (charged currency) with an approximate Liberian-dollar line underneath. */
export function Price({ cents, compareAtCents, lrdPerUsd, size = "card", className }: PriceProps) {
  const onSale = compareAtCents != null && compareAtCents > cents;

  return (
    <div className={cn("flex flex-col", className)}>
      <p
        className={cn(
          "tabular-nums",
          size === "pdp" ? "text-h3 font-sans font-semibold" : size === "line" ? "text-small" : "text-price font-semibold",
        )}
      >
        <span className={cn(onSale && "text-primary")}>{formatUsd(cents)}</span>
        {onSale && (
          <>
            {" "}
            <s className="text-small font-normal text-muted">
              <span className="sr-only">Was </span>
              {formatUsd(compareAtCents)}
            </s>
          </>
        )}
      </p>
      {lrdPerUsd != null && (
        <p className="text-caption text-muted tabular-nums">≈ {formatLrd(cents, lrdPerUsd)}</p>
      )}
    </div>
  );
}
