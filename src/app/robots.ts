import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Search results and internal APIs aren't useful in search engines.
      disallow: ["/api/", "/search"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
