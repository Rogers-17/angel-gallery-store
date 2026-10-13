import path from "node:path";
import type { NextConfig } from "next";

// `"use cache: remote"` (the database read layer in src/db/queries) is stored in Upstash Redis
// when it's configured, and falls back to Next's in-memory cache otherwise (e.g. local dev).
const upstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheHandlers: upstashConfigured
    ? { remote: path.join(process.cwd(), "cache-handlers", "upstash-remote.js") }
    : undefined,
  async redirects() {
    // The storefront design was reviewed at /design-b before being promoted to the homepage.
    // Temporary (307) while the store is still in review.
    return [
      { source: "/design-b", destination: "/", permanent: false },
      { source: "/design-b/products/:slug", destination: "/products/:slug", permanent: false },
    ];
  },
};

export default nextConfig;
