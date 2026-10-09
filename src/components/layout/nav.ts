export type NavLink = { label: string; href: string };

export const primaryNav: NavLink[] = [
  { label: "New In", href: "#new-in" },
  { label: "Clothing", href: "#" },
  { label: "Objects", href: "#" },
  { label: "Journal", href: "#journal" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "New In", href: "#new-in" },
      { label: "Clothing", href: "#" },
      { label: "Objects", href: "#" },
      { label: "Gift Cards", href: "#" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping", href: "#" },
      { label: "Returns", href: "#" },
      { label: "Care Guide", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Gallery",
    links: [
      { label: "About", href: "#" },
      { label: "Journal", href: "#journal" },
      { label: "Stockists", href: "#" },
    ],
  },
  {
    title: "Follow",
    links: [
      { label: "Instagram", href: "#" },
      { label: "Pinterest", href: "#" },
    ],
  },
];

