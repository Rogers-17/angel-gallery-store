import Link from "next/link";
import { MobileMenu } from "@/components/layout/mobile-menu";
import type { NavLink } from "@/components/layout/nav";
import { HeaderFrame } from "./header-frame";
import { BagIcon, HeartIcon, Monogram, SearchIcon, UserIcon } from "./icons";

const links: NavLink[] = [
  { label: "Women", href: "/design-b#new-arrivals" },
  { label: "Men", href: "/design-b#new-arrivals" },
  { label: "Shoes", href: "/design-b#new-arrivals" },
  { label: "Bags", href: "/design-b#summer" },
  { label: "Collections", href: "/design-b#recommended" },
];

const iconLink =
  "inline-flex size-10 items-center justify-center rounded-pill transition-colors hover:bg-current/10";

export function DesignBHeader() {
  return (
    <HeaderFrame>
      <div className="container-page flex h-header items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <MobileMenu links={links} />
          <Link href="/design-b" className="flex items-center gap-2.5 font-serif text-h4 font-semibold whitespace-nowrap">
            <Monogram />
            <span className="hidden sm:inline">Angel Gallery</span>
          </Link>
        </div>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-small font-medium">
            {links.map((link) => (
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
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-pill bg-primary text-label leading-none tracking-normal text-primary-fg">
              0
            </span>
          </Link>
        </div>
      </div>
    </HeaderFrame>
  );
}
