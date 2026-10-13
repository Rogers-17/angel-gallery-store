import Link from "next/link";
import { HeaderFrame } from "./header-frame";
import { BagIcon, HeartIcon, Monogram, SearchIcon, UserIcon } from "./icons";
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
          <Link href="#" aria-label="Search" className={iconLink}><SearchIcon /></Link>
          <Link href="#" aria-label="Account" className={`${iconLink} max-md:hidden`}><UserIcon /></Link>
          <Link href="#" aria-label="Wishlist" className={`${iconLink} max-md:hidden`}><HeartIcon /></Link>
          <Link href="#" aria-label="Bag, 0 items" className={`${iconLink} relative`}>
            <BagIcon />
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-pill bg-primary text-label leading-none text-primary-fg">
              0
            </span>
          </Link>
        </div>
      </div>
    </HeaderFrame>
  );
}
