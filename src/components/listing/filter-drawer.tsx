"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

/**
 * Mobile filters: a button that opens the server-rendered filter panel in a native <dialog>
 * (focus trap, Esc to close). Closes itself after a filter link navigates.
 */
export function FilterDrawer({ count, children }: { count: number; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname, searchParams]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        shape="pill"
        aria-haspopup="dialog"
        aria-controls="filter-drawer"
        onClick={() => dialogRef.current?.showModal()}
        className="lg:hidden"
      >
        Filters{count > 0 ? ` (${count})` : ""}
      </Button>
      <dialog
        id="filter-drawer"
        ref={dialogRef}
        aria-label="Filters"
        onClick={(event) => event.target === dialogRef.current && dialogRef.current?.close()}
        className="m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-paper text-ink backdrop:bg-ink/40 open:flex open:flex-col"
      >
        <div className="hairline flex h-header shrink-0 items-center justify-between border-b px-gutter">
          <span className="font-display text-h4 font-heading">Filters</span>
          <button type="button" onClick={() => dialogRef.current?.close()} className="-mr-2 h-11 px-2 text-small font-medium">
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-gutter py-6">{children}</div>
      </dialog>
    </>
  );
}
