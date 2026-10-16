import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const serverEnv = {
  get databaseUrl() {
    return requireEnv("DATABASE_URL");
  },
  /** HMAC key for the `ag_cart` cookie. At least 32 characters of random data. */
  get cartCookieSecret() {
    const value = requireEnv("CART_COOKIE_SECRET");
    if (value.length < 32) {
      throw new Error("CART_COOKIE_SECRET must be at least 32 characters (use 32 random bytes, base64url).");
    }
    return value;
  },
  /** HMAC key deriving guest order access tokens. At least 32 characters of random data. */
  get orderTokenSecret() {
    const value = requireEnv("ORDER_TOKEN_SECRET");
    if (value.length < 32) {
      throw new Error("ORDER_TOKEN_SECRET must be at least 32 characters (use 32 random bytes, base64url).");
    }
    return value;
  },
  /** Upstash REST credentials, or null when not configured (rate limits are then skipped). */
  get upstash() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    return url && token ? { url, token } : null;
  },
  /** Redis key namespace per environment (matches cache-handlers/keys.js). */
  get cacheNamespace() {
    return process.env.CACHE_NAMESPACE || "local";
  },
};
