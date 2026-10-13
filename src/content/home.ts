// Editorial homepage content (not catalog data). Images are self-hosted demo photos
// (public/images/demo, see CREDITS.md there).
import type { MediaTone } from "@/components/ui/media";

type ContentImage = { src: string; alt: string; position?: string };

const img = (file: string, alt: string, position?: string): ContentImage => ({
  src: `/images/demo/${file}`,
  alt,
  position,
});

export const hero = {
  title: "Step Into Pieces Made For Everyday Living",
  text: "Shoes, bags and clothing from independent makers, designed to be worn hard and loved for years.",
  image: img("hero-lounge.jpg", "Man in a leather jacket and wide trousers lounging in a chair", "object-[50%_15%]"),
};

export const productSections = {
  newArrivals: {
    id: "new-arrivals",
    collection: "new-arrivals",
    title: "Newly Dropped Collections",
    subtitle: "Fresh footwear from the workshops we work with: timeless shapes, honest materials and built-in comfort.",
  },
  summer: {
    id: "summer",
    collection: "summer",
    title: "Summer Collections",
    subtitle: "Light layers and bags that carry the season, made in small runs from natural materials.",
  },
} as const;

export const promoTiles = [
  {
    title: "Shoes That Move With You, Comfortable, Durable And Always In Style.",
    cta: "Find Your Fit",
    href: "/#new-arrivals",
    tone: "clay" as MediaTone,
    image: img("tile-shoes.jpg", "Worn beige sneakers with striped socks"),
  },
  {
    title: "Fresh Drops: Iconic Silhouettes. Bags That Carry Your Day In Style.",
    cta: "Shop Bags",
    href: "/#summer",
    tone: "sand" as MediaTone,
    image: img("tile-bags.jpg", "Woman in a red dress holding a navy leather handbag"),
  },
  {
    title: "THE EDIT",
    cta: "Shop Clothing",
    href: "/#summer",
    tone: "stone" as MediaTone,
    image: img("tile-clothing.jpg", "Woman in an oversized beige blazer"),
    /** Large centred label instead of a sentence. */
    display: true,
  },
];

export const mosaic = {
  tall: { label: "Footwear", cta: "View all footwear", href: "/#new-arrivals", tone: "stone" as MediaTone, image: img("mosaic-footwear.jpg", "Man seated on a chair in a studio wearing black sneakers", "object-[50%_70%]") },
  topRight: { label: "Bags", cta: "View all bags", href: "/#summer", tone: "mist" as MediaTone, image: img("mosaic-bags.jpg", "Pink leather handbag on a desk with drawing tools") },
  bottomRight: { label: "Knitwear", cta: "View all knitwear", href: "/#summer", tone: "sand" as MediaTone, image: img("mosaic-knitwear.jpg", "Stack of chunky knit sweaters beside a ball of yarn") },
  wide: { label: "Trending Now", cta: "Explore Shop", href: "/#new-arrivals", tone: "mist" as MediaTone, image: img("mosaic-trending.jpg", "Flat lay of leather boots, belt, watch and folded clothes") },
};

export const banner = {
  title: "Build Your Style With Confident Steps In Pieces Made To Last.",
  cta: "Shop Now",
  href: "/#new-arrivals",
  tone: "stone" as MediaTone,
  image: img("banner-laces.jpg", "Close-up of hands tying the laces of white sneakers", "object-[50%_75%]"),
};
