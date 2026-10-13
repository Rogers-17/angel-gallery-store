import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MailIcon, Monogram } from "./icons";
import { footerNav, socialLinks } from "./nav";

export function SiteFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-cream">
      {/* Oversized low-contrast logo mark. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -bottom-24 font-display text-watermark font-heading text-cream/5 select-none"
      >
        AG
      </span>

      <div className="container-page relative grid gap-12 py-16 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:py-20">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2.5 font-display text-h4 font-heading">
            <Monogram />
            Angel Gallery
          </Link>
          <p className="mt-4 text-small text-cream/65">
            We specialise in shoes, bags and clothing from independent makers, chosen for material
            and made to be worn for years.
          </p>

          <h2 className="mt-8 text-body">Subscribe to Newsletter</h2>
          {/* Visual only until the newsletter feature is built. */}
          <div className="relative mt-3">
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <MailIcon aria-hidden width={18} height={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-cream/60" />
            <input id="footer-email" type="email" placeholder="Enter your email address" className="field-dark h-12 pr-32 pl-11" />
            <Button variant="cream" size="sm" className="absolute top-1 right-1 h-10">
              Subscribe
            </Button>
          </div>
        </div>

        {footerNav.map((group) => (
          <div key={group.title}>
            <h2 className="text-body">{group.title}</h2>
            <ul className="mt-4 flex flex-col gap-3 text-small text-cream/65">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-cream">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-cream/10">
        <div className="container-page flex flex-col gap-4 py-6 text-small text-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Copyright by Angel Gallery. All rights reserved.</p>
          <ul className="flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="inline-flex h-9 items-center rounded-pill bg-espresso-soft px-4 font-display text-small text-cream/85 transition-colors hover:text-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
