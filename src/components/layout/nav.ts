export type NavLink = { label: string; href: string };

export const primaryNav: NavLink[] = [
  { label: "Women", href: "/#new-arrivals" },
  { label: "Men", href: "/#new-arrivals" },
  { label: "Shoes", href: "/#new-arrivals" },
  { label: "Bags", href: "/#summer" },
  { label: "Collections", href: "/#recommended" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Categories",
    links: [
      { label: "Women", href: "/#new-arrivals" },
      { label: "Men", href: "/#new-arrivals" },
      { label: "Shoes", href: "/#new-arrivals" },
      { label: "Bags", href: "/#summer" },
      { label: "Clothing", href: "/#summer" },
      { label: "Collections", href: "/#recommended" },
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
