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
};
