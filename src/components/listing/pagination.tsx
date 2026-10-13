import Link from "next/link";
import { listingHref, type ListingParams } from "@/lib/listing";
import { cn } from "@/lib/cn";

/** Page numbers with ellipses: 1 … 4 5 6 … 12 */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function Pagination({ pathname, params, page, pageCount }: {
  pathname: string;
  params: ListingParams;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  const href = (p: number) => listingHref(pathname, params, { key: "page", value: String(p) });
  const control = "inline-flex h-10 min-w-10 items-center justify-center rounded-control px-3 text-small transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={cn(control, "hover:bg-surface")}>← Previous</Link>
      ) : (
        <span className={cn(control, "text-muted")} aria-disabled="true">← Previous</span>
      )}
      {pageWindow(page, pageCount).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} aria-hidden className={cn(control, "text-muted")}>…</span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(control, p === page ? "bg-ink text-paper" : "hover:bg-surface")}
          >
            <span className="sr-only">Page </span>
            {p}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={href(page + 1)} rel="next" className={cn(control, "hover:bg-surface")}>Next →</Link>
      ) : (
        <span className={cn(control, "text-muted")} aria-disabled="true">Next →</span>
      )}
    </nav>
  );
}
