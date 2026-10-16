import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Search results, per-visitor pages (bag, checkout, private order links) and internal APIs
      // aren't useful in search engines.
      disallow: ["/api/", "/search", "/cart", "/checkout", "/orders/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
