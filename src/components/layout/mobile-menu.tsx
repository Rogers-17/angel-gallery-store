"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { NavLink } from "./nav";

// Native <dialog> gives focus trapping, Esc to close and focus return for free.
export function MobileMenu({ links, id = "mobile-menu" }: { links: NavLink[]; id?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  function show() {
    dialogRef.current?.showModal();
    setOpen(true);
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-expanded={open}
        aria-controls={id}
        className="eyebrow -ml-2 inline-flex h-11 items-center gap-2 px-2 lg:hidden"
      >
        <svg aria-hidden width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor">
          <path d="M1 5h16M1 13h16" strokeWidth="1.2" />
        </svg>
        Menu
      </button>

      <dialog
        id={id}
        ref={dialogRef}
        aria-label="Menu"
        onClose={() => setOpen(false)}
        onClick={(event) => event.target === dialogRef.current && close()}
        className="m-0 h-dvh max-h-none w-[min(24rem,88vw)] max-w-none bg-paper text-ink backdrop:bg-ink/40 open:flex open:flex-col"
      >
        <div className="hairline flex h-header items-center justify-between border-b px-gutter">
          <span className="font-serif text-h4">Angel Gallery</span>
          <button type="button" onClick={close} className="eyebrow -mr-2 h-11 px-2">
            Close
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-gutter py-8">
          <ul className="flex flex-col gap-5">
            {links.map((link) => (
              <li key={link.label}>
                <Link href={link.href} onClick={close} className="font-serif text-h2">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hairline flex gap-6 border-t px-gutter py-6 text-small">
          <Link href="#" onClick={close} className="link-underline">Account</Link>
          <Link href="#" onClick={close} className="link-underline">Search</Link>
        </div>
      </dialog>
    </>
  );
}
