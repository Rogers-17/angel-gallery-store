import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
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
