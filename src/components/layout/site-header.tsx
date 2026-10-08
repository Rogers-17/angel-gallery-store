import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { primaryNav } from "./nav";

export function SiteHeader() {
  return (
    <header className="hairline sticky top-0 z-40 border-b bg-paper/95 backdrop-blur-sm">
      <div className="container-page grid h-header grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center">
          <MobileMenu links={primaryNav} />
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {primaryNav.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="eyebrow link-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Link href="/" className="font-serif text-h4 whitespace-nowrap sm:text-h3">
          Angel Gallery
        </Link>

        <div className="flex items-center justify-end gap-6">
          <Link href="#" className="eyebrow link-underline hidden md:inline">
            Search
          </Link>
          <Link href="#" className="eyebrow link-underline hidden md:inline">
            Account
          </Link>
          <Link href="#" className="eyebrow link-underline">
            Bag (0)
          </Link>
        </div>
      </div>
    </header>
  );
}
