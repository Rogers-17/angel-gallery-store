export type NavLink = { label: string; href: string };

export const primaryNav: NavLink[] = [
  { label: "Women", href: "/shop?audience=women" },
  { label: "Men", href: "/shop?audience=men" },
  { label: "Shoes", href: "/shop/shoes" },
  { label: "Bags", href: "/shop/bags" },
  { label: "Clothing", href: "/shop/clothing" },
  { label: "New In", href: "/collections/new-arrivals" },
];

// Legal and Help pages are built in roadmap Phase 8; their links stay "#" until then.
export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Categories",
    links: [
      { label: "Shop All", href: "/shop" },
      { label: "Women", href: "/shop?audience=women" },
      { label: "Men", href: "/shop?audience=men" },
      { label: "Shoes", href: "/shop/shoes" },
      { label: "Bags", href: "/shop/bags" },
      { label: "Clothing", href: "/shop/clothing" },
      { label: "New Arrivals", href: "/collections/new-arrivals" },
      { label: "Summer Collection", href: "/collections/summer" },
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
      { label: "Design System", href: "/design-system" },
    ],
  },
];

export const socialLinks: NavLink[] = [
  { label: "Instagram", href: "#" },
  { label: "Pinterest", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "Facebook", href: "#" },
];
