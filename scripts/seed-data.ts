// Seed data for the demo catalog (imported by scripts/seed.ts).
// Prices are USD cents. Images are self-hosted demo photos (public/images/demo, see CREDITS.md).

export type SeedProduct = {
  slug: string;
  name: string;
  category: "shoes" | "bags" | "clothing";
  collection: "new-arrivals" | "summer";
  tag: string;
  summary: string;
  description: string;
  materials: string[];
  care: string;
  badge: "new" | "bestseller" | null;
  priceCents: number;
  compareAtCents: number | null;
  colors: { name: string; hex: string }[];
  sizes: string[];
  image: { url: string; alt: string; objectPosition: string | null };
};

export const seedCategories = [
  { slug: "shoes", name: "Shoes", description: "Loafers, boots, sneakers, sandals and heels.", position: 0 },
  { slug: "bags", name: "Bags", description: "Totes, backpacks and top-handle bags.", position: 1 },
  { slug: "clothing", name: "Clothing", description: "Jackets, knitwear and everyday essentials.", position: 2 },
] as const;

export const seedCollections = [
  { slug: "new-arrivals", name: "Newly Dropped Collections", description: "Fresh footwear from the workshops we work with.", position: 0 },
  { slug: "summer", name: "Summer Collections", description: "Light layers and bags that carry the season.", position: 1 },
] as const;

export const seedSettings = {
  whatsappNumber: "+231779268242",
  /** Liberian dollars per 1 US dollar (client-confirmed 2026-10-12). */
  lrdPerUsd: 170,
  paymentInstructions: {
    cash_on_delivery: {
      label: "Cash on delivery",
      instructions: "Pay the rider in cash (USD or LRD) when your order arrives. The delivery fee is agreed on WhatsApp.",
    },
    mtn_momo: {
      label: "MTN Mobile Money",
      instructions: "Dial *156# on your Lonestar MTN line and follow the prompts to send the agreed total to the number we share on WhatsApp. Then send us the transaction ID in the chat.",
    },
    orange_money: {
      label: "Orange Money",
      instructions: "Dial *144# on your Orange line and follow the prompts to send the agreed total to the number we share on WhatsApp. Then send us the transaction ID in the chat.",
    },
  },
  contactEmail: null,
  contactPhone: "+231779268242",
};

export const seedProducts: SeedProduct[] = [
  {
    "slug": "suede-penny-loafer",
    "name": "Suede Penny Loafer",
    "category": "shoes",
    "collection": "new-arrivals",
    "tag": "Men's Shoes",
    "summary": "Unlined suede loafer with a hand-stitched apron toe and a flexible leather sole.",
    "description": "A soft, unstructured loafer cut from brushed calf suede. The moccasin construction and unlined upper mean it moulds to your foot from the first wear, while the slim leather sole keeps the profile clean enough for tailoring.",
    "materials": [
      "Upper: calf suede",
      "Lining: unlined",
      "Sole: leather with rubber heel tip"
    ],
    "care": "Brush regularly with a suede brush. Treat with a protective spray before first wear.",
    "badge": null,
    "priceCents": 22996,
    "compareAtCents": null,
    "colors": [
      {
        "name": "Tobacco",
        "hex": "#8a5a35"
      },
      {
        "name": "Espresso",
        "hex": "#3b2a20"
      }
    ],
    "sizes": [
      "EU 36",
      "EU 37",
      "EU 38",
      "EU 39",
      "EU 40",
      "EU 41",
      "EU 42",
      "EU 43",
      "EU 44",
      "EU 45"
    ],
    "image": {
      "url": "/images/demo/suede-loafers.jpg",
      "alt": "Pair of brown suede penny loafers on a woven rug",
      "objectPosition": null
    }
  },
  {
    "slug": "heritage-lace-up-boot",
    "name": "Heritage Lace-Up Boot",
    "category": "shoes",
    "collection": "new-arrivals",
    "tag": "Men's Boots",
    "summary": "Oiled leather work boot with a cushioned footbed and a Goodyear-welted sole.",
    "description": "Built on a classic work-boot last, this lace-up is made from waxy oiled leather that darkens and creases with age. A Goodyear welt means it can be resoled for years of wear.",
    "materials": [
      "Upper: oiled full-grain leather",
      "Lining: leather",
      "Sole: Goodyear-welted rubber lug"
    ],
    "care": "Wipe clean and condition with leather balm every few months.",
    "badge": "bestseller",
    "priceCents": 32996,
    "compareAtCents": null,
    "colors": [
      {
        "name": "Cognac",
        "hex": "#9a5b32"
      },
      {
        "name": "Black",
        "hex": "#1f1b18"
      }
    ],
    "sizes": [
      "EU 36",
      "EU 37",
      "EU 38",
      "EU 39",
      "EU 40",
      "EU 41",
      "EU 42",
      "EU 43",
      "EU 44",
      "EU 45"
    ],
    "image": {
      "url": "/images/demo/lace-up-boots.jpg",
      "alt": "Brown leather lace-up boots on a wooden floor",
      "objectPosition": null
    }
  },
  {
    "slug": "everyday-canvas-sneaker",
    "name": "Everyday Canvas Sneaker",
    "category": "shoes",
    "collection": "new-arrivals",
    "tag": "Unisex Sneakers",
    "summary": "Low-top cotton canvas sneaker with a vulcanised rubber sole, made for daily wear.",
    "description": "Our everyday sneaker in heavyweight organic cotton canvas. A cushioned insole and vulcanised rubber cupsole make it the pair you reach for on every errand.",
    "materials": [
      "Upper: organic cotton canvas",
      "Lining: cotton",
      "Sole: vulcanised natural rubber"
    ],
    "care": "Spot clean with mild soap and water. Air dry away from direct heat.",
    "badge": null,
    "priceCents": 12996,
    "compareAtCents": null,
    "colors": [
      {
        "name": "Chalk",
        "hex": "#f1eee8"
      },
      {
        "name": "Sand",
        "hex": "#d8c9b0"
      }
    ],
    "sizes": [
      "EU 36",
      "EU 37",
      "EU 38",
      "EU 39",
      "EU 40",
      "EU 41",
      "EU 42",
      "EU 43",
      "EU 44",
      "EU 45"
    ],
    "image": {
      "url": "/images/demo/white-sneakers.jpg",
      "alt": "White canvas sneakers worn with cuffed jeans",
      "objectPosition": null
    }
  },
  {
    "slug": "gilded-slingback-sandal",
    "name": "Gilded Slingback Sandal",
    "category": "shoes",
    "collection": "new-arrivals",
    "tag": "Women's Sandals",
    "summary": "Metallic leather slingback on a sculpted kitten heel, finished with a buckle.",
    "description": "An evening-ready slingback in softly metallic leather. The sculpted kitten heel keeps it wearable all night, and an adjustable buckle strap gives a secure fit.",
    "materials": [
      "Upper: metallic nappa leather",
      "Lining: leather",
      "Heel: 45 mm"
    ],
    "care": "Store in the dust bag. Wipe with a soft dry cloth.",
    "badge": "new",
    "priceCents": 18996,
    "compareAtCents": null,
    "colors": [
      {
        "name": "Gold",
        "hex": "#c6a15b"
      },
      {
        "name": "Bronze",
        "hex": "#8c6239"
      }
    ],
    "sizes": [
      "EU 36",
      "EU 37",
      "EU 38",
      "EU 39",
      "EU 40",
      "EU 41",
      "EU 42",
      "EU 43",
      "EU 44",
      "EU 45"
    ],
    "image": {
      "url": "/images/demo/gold-slingbacks.jpg",
      "alt": "Pair of gold leather slingback sandals",
      "objectPosition": null
    }
  },
  {
    "slug": "two-strap-buckle-sandal",
    "name": "Two-Strap Buckle Sandal",
    "category": "shoes",
    "collection": "new-arrivals",
    "tag": "Unisex Sandals",
    "summary": "Contoured cork footbed with two adjustable leather straps for all-day comfort.",
    "description": "A summer staple with an anatomical cork and latex footbed that shapes to your foot over time. Two adjustable straps in smooth leather keep it secure on long days out.",
    "materials": [
      "Straps: smooth leather",
      "Footbed: cork and latex",
      "Sole: EVA"
    ],
    "care": "Keep away from prolonged water exposure. Reseal cork as needed.",
    "badge": null,
    "priceCents": 11996,
    "compareAtCents": 14996,
    "colors": [
      {
        "name": "White",
        "hex": "#f4f2ee"
      },
      {
        "name": "Taupe",
        "hex": "#a39182"
      }
    ],
    "sizes": [
      "EU 36",
      "EU 37",
      "EU 38",
      "EU 39",
      "EU 40",
      "EU 41",
      "EU 42",
      "EU 43",
      "EU 44",
      "EU 45"
    ],
    "image": {
      "url": "/images/demo/buckle-sandals.jpg",
      "alt": "White two-strap buckle sandals worn on pebbles",
      "objectPosition": null
    }
  },
  {
    "slug": "pointed-leather-pump",
    "name": "Pointed Leather Pump",
    "category": "shoes",
    "collection": "new-arrivals",
    "tag": "Women's Heels",
    "summary": "Glossy pointed-toe pump on a slim 90 mm heel with a cushioned insole.",
    "description": "A timeless pointed pump in patent leather. The slim heel is balanced with a padded insole so it works from the office to the evening.",
    "materials": [
      "Upper: patent leather",
      "Lining: leather",
      "Heel: 90 mm"
    ],
    "care": "Wipe patent leather with a soft damp cloth. Store with shoe trees.",
    "badge": null,
    "priceCents": 24996,
    "compareAtCents": null,
    "colors": [
      {
        "name": "Ivory",
        "hex": "#f3eee4"
      },
      {
        "name": "Blush",
        "hex": "#e8c8bf"
      }
    ],
    "sizes": [
      "EU 36",
      "EU 37",
      "EU 38",
      "EU 39",
      "EU 40",
      "EU 41",
      "EU 42",
      "EU 43",
      "EU 44",
      "EU 45"
    ],
    "image": {
      "url": "/images/demo/pointed-heels.jpg",
      "alt": "White pointed leather pumps on a cabinet beside flowers",
      "objectPosition": "object-top"
    }
  },
  {
    "slug": "woven-leather-tote",
    "name": "Woven Leather Tote",
    "category": "bags",
    "collection": "summer",
    "tag": "Bags",
    "summary": "Hand-woven leather tote with a gold chain strap and a roomy unlined interior.",
    "description": "Wide strips of soft leather woven by hand into a slouchy tote. It fits a laptop, a jumper and everything in between, with a chain strap for carrying on the shoulder.",
    "materials": [
      "Body: woven lambskin",
      "Strap: gold-tone chain with leather",
      "Interior: unlined"
    ],
    "care": "Store stuffed with tissue in the dust bag. Avoid overfilling to keep its shape.",
    "badge": "new",
    "priceCents": 28996,
    "compareAtCents": null,
    "colors": [
      {
        "name": "Cognac",
        "hex": "#a3542a"
      },
      {
        "name": "Black",
        "hex": "#1f1b18"
      }
    ],
    "sizes": [
      "One size"
    ],
    "image": {
      "url": "/images/demo/woven-tote.jpg",
      "alt": "Cognac woven leather tote bag with a gold chain strap",
      "objectPosition": null
    }
  },
  {
    "slug": "mini-leather-backpack",
    "name": "Mini Leather Backpack",
    "category": "bags",
    "collection": "summer",
    "tag": "Bags",
    "summary": "Drawstring mini backpack in pebbled leather with a tasselled zip pocket.",
    "description": "A compact city backpack in pebbled leather. The drawstring top and magnetic flap keep things secure, and adjustable straps let you wear it on one or both shoulders.",
    "materials": [
      "Body: pebbled leather",
      "Lining: cotton twill",
      "Hardware: matte black"
    ],
    "care": "Wipe with a damp cloth. Condition the leather twice a year.",
    "badge": null,
    "priceCents": 21996,
    "compareAtCents": null,
    "colors": [
      {
        "name": "Black",
        "hex": "#1f1b18"
      },
      {
        "name": "Taupe",
        "hex": "#a39182"
      }
    ],
    "sizes": [
      "One size"
    ],
    "image": {
      "url": "/images/demo/bucket-bag.jpg",
      "alt": "Black mini leather backpack in a pool of sunlight",
      "objectPosition": null
    }
  },
  {
    "slug": "structured-top-handle-bag",
    "name": "Structured Top-Handle Bag",
    "category": "bags",
    "collection": "summer",
    "tag": "Bags",
    "summary": "A neat top-handle bag with a detachable strap and a polished turn-lock clasp.",
    "description": "Our most structured silhouette: smooth leather with a single rolled handle and a turn-lock flap. Clip on the detachable strap to wear it crossbody.",
    "materials": [
      "Body: smooth calf leather",
      "Lining: suede",
      "Hardware: gold-tone"
    ],
    "care": "Keep away from direct sunlight. Store upright in the dust bag.",
    "badge": null,
    "priceCents": 25996,
    "compareAtCents": null,
    "colors": [
      {
        "name": "Black",
        "hex": "#1f1b18"
      },
      {
        "name": "Navy",
        "hex": "#273650"
      }
    ],
    "sizes": [
      "One size"
    ],
    "image": {
      "url": "/images/demo/top-handle-bag.jpg",
      "alt": "Black structured top-handle bag held against a grey wall",
      "objectPosition": null
    }
  },
  {
    "slug": "washed-denim-jacket",
    "name": "Washed Denim Jacket",
    "category": "clothing",
    "collection": "summer",
    "tag": "Jackets",
    "summary": "Light-wash trucker jacket in rigid cotton denim that softens with every wear.",
    "description": "A classic trucker jacket in a sun-faded light wash. Rigid cotton denim, chest flap pockets and an easy, slightly boxy fit made for layering.",
    "materials": [
      "100% cotton denim, 12 oz",
      "Metal shank buttons"
    ],
    "care": "Machine wash cold inside out. Line dry.",
    "badge": null,
    "priceCents": 16996,
    "compareAtCents": null,
    "colors": [
      {
        "name": "Light wash",
        "hex": "#9fb4c9"
      },
      {
        "name": "Indigo",
        "hex": "#2f4566"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "image": {
      "url": "/images/demo/denim-jacket.jpg",
      "alt": "Light-wash denim jacket hanging on a white door",
      "objectPosition": null
    }
  },
  {
    "slug": "merino-crewneck-sweater",
    "name": "Merino Crewneck Sweater",
    "category": "clothing",
    "collection": "summer",
    "tag": "Knitwear",
    "summary": "Fine-gauge merino crewneck in seasonal neutrals, light enough for summer evenings.",
    "description": "Knitted from extra-fine merino that regulates temperature, so it layers over a tee on cool summer evenings and under a coat when the season turns.",
    "materials": [
      "100% extra-fine merino wool",
      "Ribbed cuffs and hem"
    ],
    "care": "Hand wash cold or use a wool cycle. Dry flat.",
    "badge": "bestseller",
    "priceCents": 13996,
    "compareAtCents": null,
    "colors": [
      {
        "name": "Camel",
        "hex": "#c39a62"
      },
      {
        "name": "Taupe",
        "hex": "#8c7b6b"
      },
      {
        "name": "Charcoal",
        "hex": "#3d3a37"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "image": {
      "url": "/images/demo/knit-sweaters.jpg",
      "alt": "Stack of folded merino sweaters in camel, taupe and charcoal",
      "objectPosition": null
    }
  },
  {
    "slug": "organic-cotton-tee",
    "name": "Organic Cotton Tee",
    "category": "clothing",
    "collection": "summer",
    "tag": "Essentials",
    "summary": "Mid-weight organic cotton tee with a clean crew neck and a relaxed fit.",
    "description": "The tee everything else is built on: mid-weight organic cotton jersey, a neat ribbed crew neck and a relaxed body that holds its shape wash after wash.",
    "materials": [
      "100% organic cotton jersey, 200 gsm"
    ],
    "care": "Machine wash at 30°C. Tumble dry low.",
    "badge": null,
    "priceCents": 4996,
    "compareAtCents": null,
    "colors": [
      {
        "name": "White",
        "hex": "#f7f6f2"
      },
      {
        "name": "Black",
        "hex": "#1f1b18"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "image": {
      "url": "/images/demo/cotton-tee.jpg",
      "alt": "White organic cotton tee laid flat with sneakers and a magazine",
      "objectPosition": null
    }
  }
];
