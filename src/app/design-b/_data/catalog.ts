// TEMPORARY demo data for the design-B review page (/design-b) and its product pages.
// Independent from design A's catalog. Replace with Drizzle queries once the product schema exists.
// Images live in public/images/design-b (see CREDITS.md there).
import type { MediaTone } from "@/components/ui/media";

export type BImage = {
  src: string;
  alt: string;
  /** Tailwind object-position class for cropping. */
  position?: string;
};

export type BColor = { name: string; swatch: string };

export type BProduct = {
  slug: string;
  name: string;
  collection: "new-arrivals" | "summer";
  department: "Shoes" | "Bags" | "Clothing";
  /** Small pill on the card, e.g. "Men's Shoes". */
  tag: string;
  price: number;
  compareAtPrice?: number;
  badge?: "New" | "Bestseller";
  /** Two-line card description. */
  summary: string;
  description: string;
  materials: string[];
  care: string;
  colors: BColor[];
  sizes: string[];
  tone: MediaTone;
  image: BImage;
};

const img = (file: string, alt: string, position?: string): BImage => ({
  src: `/images/design-b/${file}`,
  alt,
  position,
});

const shoeSizes = ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"];
const clothingSizes = ["XS", "S", "M", "L", "XL"];
const oneSize = ["One size"];

export const products: BProduct[] = [
  // Newly dropped: footwear
  {
    slug: "suede-penny-loafer",
    name: "Suede Penny Loafer",
    collection: "new-arrivals",
    department: "Shoes",
    tag: "Men's Shoes",
    price: 229.96,
    summary: "Unlined suede loafer with a hand-stitched apron toe and a flexible leather sole.",
    description:
      "A soft, unstructured loafer cut from brushed calf suede. The moccasin construction and unlined upper mean it moulds to your foot from the first wear, while the slim leather sole keeps the profile clean enough for tailoring.",
    materials: ["Upper: calf suede", "Lining: unlined", "Sole: leather with rubber heel tip"],
    care: "Brush regularly with a suede brush. Treat with a protective spray before first wear.",
    colors: [{ name: "Tobacco", swatch: "#8a5a35" }, { name: "Espresso", swatch: "#3b2a20" }],
    sizes: shoeSizes,
    tone: "clay",
    image: img("suede-loafers.jpg", "Pair of brown suede penny loafers on a woven rug"),
  },
  {
    slug: "heritage-lace-up-boot",
    name: "Heritage Lace-Up Boot",
    collection: "new-arrivals",
    department: "Shoes",
    tag: "Men's Boots",
    price: 329.96,
    badge: "Bestseller",
    summary: "Oiled leather work boot with a cushioned footbed and a Goodyear-welted sole.",
    description:
      "Built on a classic work-boot last, this lace-up is made from waxy oiled leather that darkens and creases with age. A Goodyear welt means it can be resoled for years of wear.",
    materials: ["Upper: oiled full-grain leather", "Lining: leather", "Sole: Goodyear-welted rubber lug"],
    care: "Wipe clean and condition with leather balm every few months.",
    colors: [{ name: "Cognac", swatch: "#9a5b32" }, { name: "Black", swatch: "#1f1b18" }],
    sizes: shoeSizes,
    tone: "sand",
    image: img("lace-up-boots.jpg", "Brown leather lace-up boots on a wooden floor"),
  },
  {
    slug: "everyday-canvas-sneaker",
    name: "Everyday Canvas Sneaker",
    collection: "new-arrivals",
    department: "Shoes",
    tag: "Unisex Sneakers",
    price: 129.96,
    summary: "Low-top cotton canvas sneaker with a vulcanised rubber sole, made for daily wear.",
    description:
      "Our everyday sneaker in heavyweight organic cotton canvas. A cushioned insole and vulcanised rubber cupsole make it the pair you reach for on every errand.",
    materials: ["Upper: organic cotton canvas", "Lining: cotton", "Sole: vulcanised natural rubber"],
    care: "Spot clean with mild soap and water. Air dry away from direct heat.",
    colors: [{ name: "Chalk", swatch: "#f1eee8" }, { name: "Sand", swatch: "#d8c9b0" }],
    sizes: shoeSizes,
    tone: "mist",
    image: img("white-sneakers.jpg", "White canvas sneakers worn with cuffed jeans"),
  },
  {
    slug: "gilded-slingback-sandal",
    name: "Gilded Slingback Sandal",
    collection: "new-arrivals",
    department: "Shoes",
    tag: "Women's Sandals",
    price: 189.96,
    badge: "New",
    summary: "Metallic leather slingback on a sculpted kitten heel, finished with a buckle.",
    description:
      "An evening-ready slingback in softly metallic leather. The sculpted kitten heel keeps it wearable all night, and an adjustable buckle strap gives a secure fit.",
    materials: ["Upper: metallic nappa leather", "Lining: leather", "Heel: 45 mm"],
    care: "Store in the dust bag. Wipe with a soft dry cloth.",
    colors: [{ name: "Gold", swatch: "#c6a15b" }, { name: "Bronze", swatch: "#8c6239" }],
    sizes: shoeSizes,
    tone: "sand",
    image: img("gold-slingbacks.jpg", "Pair of gold leather slingback sandals"),
  },
  {
    slug: "two-strap-buckle-sandal",
    name: "Two-Strap Buckle Sandal",
    collection: "new-arrivals",
    department: "Shoes",
    tag: "Unisex Sandals",
    price: 119.96,
    compareAtPrice: 149.96,
    summary: "Contoured cork footbed with two adjustable leather straps for all-day comfort.",
    description:
      "A summer staple with an anatomical cork and latex footbed that shapes to your foot over time. Two adjustable straps in smooth leather keep it secure on long days out.",
    materials: ["Straps: smooth leather", "Footbed: cork and latex", "Sole: EVA"],
    care: "Keep away from prolonged water exposure. Reseal cork as needed.",
    colors: [{ name: "White", swatch: "#f4f2ee" }, { name: "Taupe", swatch: "#a39182" }],
    sizes: shoeSizes,
    tone: "stone",
    image: img("buckle-sandals.jpg", "White two-strap buckle sandals worn on pebbles"),
  },
  {
    slug: "pointed-leather-pump",
    name: "Pointed Leather Pump",
    collection: "new-arrivals",
    department: "Shoes",
    tag: "Women's Heels",
    price: 249.96,
    summary: "Glossy pointed-toe pump on a slim 90 mm heel with a cushioned insole.",
    description:
      "A timeless pointed pump in patent leather. The slim heel is balanced with a padded insole so it works from the office to the evening.",
    materials: ["Upper: patent leather", "Lining: leather", "Heel: 90 mm"],
    care: "Wipe patent leather with a soft damp cloth. Store with shoe trees.",
    colors: [{ name: "Ivory", swatch: "#f3eee4" }, { name: "Blush", swatch: "#e8c8bf" }],
    sizes: shoeSizes,
    tone: "mist",
    image: img("pointed-heels.jpg", "White pointed leather pumps on a cabinet beside flowers", "object-top"),
  },

  // Summer collections: bags and clothing
  {
    slug: "woven-leather-tote",
    name: "Woven Leather Tote",
    collection: "summer",
    department: "Bags",
    tag: "Bags",
    price: 289.96,
    badge: "New",
    summary: "Hand-woven leather tote with a gold chain strap and a roomy unlined interior.",
    description:
      "Wide strips of soft leather woven by hand into a slouchy tote. It fits a laptop, a jumper and everything in between, with a chain strap for carrying on the shoulder.",
    materials: ["Body: woven lambskin", "Strap: gold-tone chain with leather", "Interior: unlined"],
    care: "Store stuffed with tissue in the dust bag. Avoid overfilling to keep its shape.",
    colors: [{ name: "Cognac", swatch: "#a3542a" }, { name: "Black", swatch: "#1f1b18" }],
    sizes: oneSize,
    tone: "sand",
    image: img("woven-tote.jpg", "Cognac woven leather tote bag with a gold chain strap"),
  },
  {
    slug: "mini-leather-backpack",
    name: "Mini Leather Backpack",
    collection: "summer",
    department: "Bags",
    tag: "Bags",
    price: 219.96,
    summary: "Drawstring mini backpack in pebbled leather with a tasselled zip pocket.",
    description:
      "A compact city backpack in pebbled leather. The drawstring top and magnetic flap keep things secure, and adjustable straps let you wear it on one or both shoulders.",
    materials: ["Body: pebbled leather", "Lining: cotton twill", "Hardware: matte black"],
    care: "Wipe with a damp cloth. Condition the leather twice a year.",
    colors: [{ name: "Black", swatch: "#1f1b18" }, { name: "Taupe", swatch: "#a39182" }],
    sizes: oneSize,
    tone: "stone",
    image: img("bucket-bag.jpg", "Black mini leather backpack in a pool of sunlight"),
  },
  {
    slug: "structured-top-handle-bag",
    name: "Structured Top-Handle Bag",
    collection: "summer",
    department: "Bags",
    tag: "Bags",
    price: 259.96,
    summary: "A neat top-handle bag with a detachable strap and a polished turn-lock clasp.",
    description:
      "Our most structured silhouette: smooth leather with a single rolled handle and a turn-lock flap. Clip on the detachable strap to wear it crossbody.",
    materials: ["Body: smooth calf leather", "Lining: suede", "Hardware: gold-tone"],
    care: "Keep away from direct sunlight. Store upright in the dust bag.",
    colors: [{ name: "Black", swatch: "#1f1b18" }, { name: "Navy", swatch: "#273650" }],
    sizes: oneSize,
    tone: "mist",
    image: img("top-handle-bag.jpg", "Black structured top-handle bag held against a grey wall"),
  },
  {
    slug: "washed-denim-jacket",
    name: "Washed Denim Jacket",
    collection: "summer",
    department: "Clothing",
    tag: "Jackets",
    price: 169.96,
    summary: "Light-wash trucker jacket in rigid cotton denim that softens with every wear.",
    description:
      "A classic trucker jacket in a sun-faded light wash. Rigid cotton denim, chest flap pockets and an easy, slightly boxy fit made for layering.",
    materials: ["100% cotton denim, 12 oz", "Metal shank buttons"],
    care: "Machine wash cold inside out. Line dry.",
    colors: [{ name: "Light wash", swatch: "#9fb4c9" }, { name: "Indigo", swatch: "#2f4566" }],
    sizes: clothingSizes,
    tone: "mist",
    image: img("denim-jacket.jpg", "Light-wash denim jacket hanging on a white door"),
  },
  {
    slug: "merino-crewneck-sweater",
    name: "Merino Crewneck Sweater",
    collection: "summer",
    department: "Clothing",
    tag: "Knitwear",
    price: 139.96,
    badge: "Bestseller",
    summary: "Fine-gauge merino crewneck in seasonal neutrals, light enough for summer evenings.",
    description:
      "Knitted from extra-fine merino that regulates temperature, so it layers over a tee on cool summer evenings and under a coat when the season turns.",
    materials: ["100% extra-fine merino wool", "Ribbed cuffs and hem"],
    care: "Hand wash cold or use a wool cycle. Dry flat.",
    colors: [
      { name: "Camel", swatch: "#c39a62" },
      { name: "Taupe", swatch: "#8c7b6b" },
      { name: "Charcoal", swatch: "#3d3a37" },
    ],
    sizes: clothingSizes,
    tone: "clay",
    image: img("knit-sweaters.jpg", "Stack of folded merino sweaters in camel, taupe and charcoal"),
  },
  {
    slug: "organic-cotton-tee",
    name: "Organic Cotton Tee",
    collection: "summer",
    department: "Clothing",
    tag: "Essentials",
    price: 49.96,
    summary: "Mid-weight organic cotton tee with a clean crew neck and a relaxed fit.",
    description:
      "The tee everything else is built on: mid-weight organic cotton jersey, a neat ribbed crew neck and a relaxed body that holds its shape wash after wash.",
    materials: ["100% organic cotton jersey, 200 gsm"],
    care: "Machine wash at 30°C. Tumble dry low.",
    colors: [{ name: "White", swatch: "#f7f6f2" }, { name: "Black", swatch: "#1f1b18" }],
    sizes: clothingSizes,
    tone: "mist",
    image: img("cotton-tee.jpg", "White organic cotton tee laid flat with sneakers and a magazine"),
  },
];

export const newArrivals = products.filter((p) => p.collection === "new-arrivals");
export const summerCollection = products.filter((p) => p.collection === "summer");

export function getProduct(slug: string): BProduct | undefined {
  return products.find((p) => p.slug === slug);
}

/** Up to `limit` other products, same department first. */
export function getRelatedProducts(product: BProduct, limit = 3): BProduct[] {
  const others = products.filter((p) => p.slug !== product.slug);
  const sameDepartment = others.filter((p) => p.department === product.department);
  const rest = others.filter((p) => p.department !== product.department);
  return [...sameDepartment, ...rest].slice(0, limit);
}

export function productHref(slug: string): string {
  return `/design-b/products/${slug}`;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export const hero = {
  title: "Step Into Pieces Made For Everyday Living",
  text: "Shoes, bags and clothing from independent makers, designed to be worn hard and loved for years.",
  image: img("hero-lounge.jpg", "Man in a leather jacket and wide trousers lounging in a chair", "object-[50%_15%]"),
};

export const promoTiles = [
  {
    title: "Shoes That Move With You, Comfortable, Durable And Always In Style.",
    cta: "Find Your Fit",
    href: "/design-b#new-arrivals",
    tone: "clay" as MediaTone,
    image: img("tile-shoes.jpg", "Worn beige sneakers with striped socks"),
  },
  {
    title: "Fresh Drops: Iconic Silhouettes. Bags That Carry Your Day In Style.",
    cta: "Shop Bags",
    href: "/design-b#summer",
    tone: "sand" as MediaTone,
    image: img("tile-bags.jpg", "Woman in a red dress holding a navy leather handbag"),
  },
  {
    title: "THE EDIT",
    cta: "Shop Clothing",
    href: "/design-b#summer",
    tone: "stone" as MediaTone,
    image: img("tile-clothing.jpg", "Woman in an oversized beige blazer"),
    /** Large centred label instead of a sentence (third reference tile). */
    display: true,
  },
];

export const mosaic = {
  tall: { label: "Footwear", cta: "View all footwear", href: "/design-b#new-arrivals", tone: "stone" as MediaTone, image: img("mosaic-footwear.jpg", "Man seated on a chair in a studio wearing black sneakers", "object-[50%_70%]") },
  topRight: { label: "Bags", cta: "View all bags", href: "/design-b#summer", tone: "mist" as MediaTone, image: img("mosaic-bags.jpg", "Pink leather handbag on a desk with drawing tools") },
  bottomRight: { label: "Knitwear", cta: "View all knitwear", href: "/design-b#summer", tone: "sand" as MediaTone, image: img("mosaic-knitwear.jpg", "Stack of chunky knit sweaters beside a ball of yarn") },
  wide: { label: "Trending Now", cta: "Explore Shop", href: "/design-b#new-arrivals", tone: "mist" as MediaTone, image: img("mosaic-trending.jpg", "Flat lay of leather boots, belt, watch and folded clothes") },
};

export const banner = {
  title: "Build Your Style With Confident Steps In Pieces Made To Last.",
  cta: "Shop Now",
  href: "/design-b#new-arrivals",
  tone: "stone" as MediaTone,
  image: img("banner-laces.jpg", "Close-up of hands tying the laces of white sneakers", "object-[50%_75%]"),
};
