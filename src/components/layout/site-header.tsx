import Link from "next/link";
import { Suspense } from "react";
import { CartButton, CartButtonFallback } from "@/components/cart/cart-button";
import { HeaderFrame } from "./header-frame";
import { HeartIcon, Monogram, SearchIcon, UserIcon } from "./icons";
import { MobileMenu } from "./mobile-menu";
import { primaryNav } from "./nav";

const iconLink =
  "inline-flex size-10 items-center justify-center rounded-pill transition-colors hover:bg-current/10";

export function SiteHeader() {
  return (
    <HeaderFrame>
      <div className="container-page flex h-header items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <MobileMenu links={primaryNav} />
          <Link href="/" className="flex items-center gap-2.5 font-display text-h4 font-heading whitespace-nowrap">
            <Monogram />
            <span className="hidden sm:inline">Angel Gallery</span>
          </Link>
        </div>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-small font-medium">
            {primaryNav.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="link-underline">{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/search" aria-label="Search" className={iconLink}><SearchIcon /></Link>
          <Link href="#" aria-label="Account" className={`${iconLink} max-md:hidden`}><UserIcon /></Link>
          <Link href="#" aria-label="Wishlist" className={`${iconLink} max-md:hidden`}><HeartIcon /></Link>
          {/* The cart reads a cookie, so it streams in; the fallback keeps the icon in place. */}
          <Suspense fallback={<CartButtonFallback />}>
            <CartButton />
          </Suspense>
        </div>
      </div>
    </HeaderFrame>
  );
}
