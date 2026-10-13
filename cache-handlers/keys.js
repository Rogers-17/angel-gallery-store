// @ts-check
// Redis key layout shared by the cache handler and the CLI scripts (scripts/cache.ts).
//
// - CACHE_NAMESPACE separates environments that point at different databases
//   (e.g. "local", "preview", "production"). Defaults to "local".
// - Entries are also keyed by build mode and deployment so `next dev`, `next start` and
//   different deployments never read each other's serialized output.
// - Tag invalidations are per namespace (they describe data changes, not builds).

const namespace = process.env.CACHE_NAMESPACE || "local";
const build = `${process.env.NODE_ENV || "development"}:${process.env.VERCEL_DEPLOYMENT_ID || "self"}`;

const cacheKeys = {
  /** @param {string} cacheKey */
  entry: (cacheKey) => `ag:${namespace}:entry:${build}:${cacheKey}`,
  tags: `ag:${namespace}:tags`,
};

module.exports = { cacheKeys };
