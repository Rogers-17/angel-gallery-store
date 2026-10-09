import Link from "next/link";
import type { NavLink } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
import { Monogram } from "./icons";

const columns: { title: string; links: NavLink[] }[] = [
  {
    title: "Categories",
    links: [
      { label: "Women", href: "/design-b#new-arrivals" },
      { label: "Men", href: "/design-b#new-arrivals" },
      { label: "Shoes", href: "/design-b#new-arrivals" },
      { label: "Bags", href: "/design-b#summer" },
      { label: "Clothing", href: "/design-b#summer" },
      { label: "Collections", href: "/design-b#recommended" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms & Conditions", href: "#" },
      { label: "Refund Policy", href: "#" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "How To Order", href: "#" },
      { label: "Track Order", href: "#" },
      { label: "Returns & Exchanges", href: "#" },
      { label: "About Us", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Contact Us", href: "#" },
    ],
  },
];

const socials = ["Instagram", "Pinterest", "TikTok", "Facebook"];

const pill =
  "inline-flex h-8 items-center rounded-pill border border-inverse/15 px-4 text-inverse/80 transition-colors hover:border-inverse/40 hover:text-inverse";

export function DesignBFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-inverse">
      {/* Oversized low-contrast mark. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -bottom-24 font-serif text-watermark font-semibold text-inverse/5 select-none"
      >
        AG
      </span>

      <div className="container-page relative grid gap-12 py-16 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:py-20">
        <div className="max-w-sm">
          <Link href="/design-b" className="flex items-center gap-2.5 font-serif text-h4 font-semibold">
            <Monogram />
            Angel Gallery
          </Link>
          <p className="mt-4 text-small text-inverse/65">
            We specialise in shoes, bags and clothing from independent makers, chosen for material
            and made to be worn for years.
          </p>

          <p className="mt-8 text-small font-medium">Subscribe to Newsletter</p>
          {/* Visual only until the newsletter feature is built. */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="design-b-footer-email" className="sr-only">Email address</label>
            <input
              id="design-b-footer-email"
              type="email"
              placeholder="Enter your email address"
              className="h-10 w-full rounded-control border border-inverse/20 bg-inverse/5 px-4 text-small text-inverse placeholder:text-inverse/45 focus:border-inverse focus:outline-none"
            />
            <Button variant="secondary" size="sm" className="shrink-0">Subscribe</Button>
          </div>
        </div>

        {columns.map((group) => (
          <div key={group.title}>
            <h2 className="font-sans text-small font-semibold">{group.title}</h2>
            <ul className="mt-4 flex flex-col gap-3 text-small text-inverse/65">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-inverse">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-inverse/10">
        <div className="container-page flex flex-col gap-4 py-6 text-small text-inverse/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Copyright by Angel Gallery. All rights reserved.</p>
          <ul className="flex flex-wrap gap-2">
            {socials.map((label) => (
              <li key={label}>
                <Link href="#" className={pill}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
