import "server-only";
import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { after } from "next/server";
import { serverEnv } from "@/lib/env";

// Rate limits on the existing Upstash database. Keys hold a SHA-256 of the identifier, never a raw
// IP or phone. They fail open: a slow or failing Redis must never lose an order. Without Upstash
// (e.g. local dev) limits are skipped.

const limits = {
  /** Generous: Liberian mobile carriers put many buyers behind one IP (CGNAT). */
  "checkout:ip": Ratelimit.slidingWindow(10, "10 m"),
  "checkout:phone": Ratelimit.slidingWindow(5, "1 h"),
} as const;

export type RateLimitName = keyof typeof limits;

const limiters = new Map<RateLimitName, Ratelimit>();
let warnedMissing = false;

function getLimiter(name: RateLimitName): Ratelimit | null {
  const upstash = serverEnv.upstash;
  if (!upstash) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.warn("[rate-limit] Upstash is not configured; rate limits are skipped.");
    }
    return null;
  }
  let limiter = limiters.get(name);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url: upstash.url, token: upstash.token }),
      limiter: limits[name],
      prefix: `ag:${serverEnv.cacheNamespace}:rl:${name}`,
      timeout: 1500,
      analytics: false,
    });
    limiters.set(name, limiter);
  }
  return limiter;
}

/** True when the request may proceed. */
export async function checkRateLimit(name: RateLimitName, identifier: string): Promise<boolean> {
  const limiter = getLimiter(name);
  if (!limiter) return true;
  try {
    const key = createHash("sha256").update(identifier).digest("hex");
    const { success, reason, pending } = await limiter.limit(key);
    after(() => pending);
    if (reason === "timeout") console.warn(`[rate-limit] ${name} timed out; allowing the request.`);
    return success;
  } catch (error) {
    console.error(`[rate-limit] ${name} failed; allowing the request:`, error);
    return true;
  }
}

/** The client IP as reported by the platform proxy (Vercel sets x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "unknown"
  );
}
