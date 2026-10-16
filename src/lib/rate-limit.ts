import "server-only";
import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { after } from "next/server";
import { serverEnv } from "@/lib/env";

// Rate limits on the existing Upstash database. Keys hold a SHA-256 of the identifier, never a raw
// IP, phone or order number. Checkout fails open (a slow or failing Redis must never lose an
// order); lookup passes `failClosed` (an outage must not allow guessing phones). Without Upstash
// (e.g. local dev) limits are skipped.

const limits = {
  /** Generous: Liberian mobile carriers put many buyers behind one IP (CGNAT). */
  "checkout:ip": Ratelimit.slidingWindow(10, "10 m"),
  "checkout:phone": Ratelimit.slidingWindow(5, "1 h"),
  "lookup:ip": Ratelimit.slidingWindow(10, "15 m"),
  /** Per order number, so phones can't be guessed for one order even from many IPs. */
  "lookup:order": Ratelimit.slidingWindow(5, "1 h"),
} as const;

export type RateLimitName = keyof typeof limits;

/** "limited": over the limit; "unavailable": Redis failed and the check fails closed. */
export type RateLimitResult = "allowed" | "limited" | "unavailable";

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

export async function rateLimit(
  name: RateLimitName,
  identifier: string,
  { failClosed = false }: { failClosed?: boolean } = {},
): Promise<RateLimitResult> {
  const limiter = getLimiter(name);
  if (!limiter) return "allowed";
  const unavailable: RateLimitResult = failClosed ? "unavailable" : "allowed";
  try {
    const key = createHash("sha256").update(identifier).digest("hex");
    const { success, reason, pending } = await limiter.limit(key);
    after(() => pending);
    if (reason === "timeout") {
      console.warn(`[rate-limit] ${name} timed out; ${failClosed ? "refusing" : "allowing"} the request.`);
      return unavailable;
    }
    return success ? "allowed" : "limited";
  } catch (error) {
    console.error(`[rate-limit] ${name} failed; ${failClosed ? "refusing" : "allowing"} the request:`, error);
    return unavailable;
  }
}

/** True when the request may proceed (fails open). */
export async function checkRateLimit(name: RateLimitName, identifier: string): Promise<boolean> {
  return (await rateLimit(name, identifier)) === "allowed";
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
