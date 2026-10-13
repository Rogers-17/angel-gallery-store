// @ts-check
// Upstash Redis cache handler for `"use cache: remote"` (configured in next.config.ts).
// Shares cached data across all server instances and persists it across restarts/cold starts.
// Tag invalidations are stored in one Redis hash, so `updateTag()`/`revalidateTag()` on any
// instance (or `pnpm db:seed` / `pnpm settings:*`) invalidates entries everywhere.
// Docs: node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheHandlers.md
//
// Use `"use cache: remote"` only for request-time data (inside Suspense / depending on searchParams,
// cookies or headers). Network calls made during prerendering never resolve, so every Redis call
// here has a timeout: a slow or blocked call degrades to a cache miss instead of hanging a render.

/* eslint-disable @typescript-eslint/no-require-imports */
const { Redis } = require("@upstash/redis");
const { cacheKeys } = require("./keys");

/** @typedef {import("next/cache").CacheEntry} CacheEntry */
/** @typedef {{ value: string; tags: string[]; stale: number; timestamp: number; expire: number; revalidate: number }} StoredEntry */

const MAX_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const REDIS_TIMEOUT_MS = 1500;

const redis = Redis.fromEnv();

/** Tag → last invalidation time (ms), synced from Redis once per request in refreshTags(). */
const tagTimestamps = new Map();
/** In-flight set() calls in this process, so a get() right after a set() waits for it. */
const pendingSets = new Map();

/** @param {Uint8Array} bytes */
function streamFromBytes(bytes) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

/**
 * Rejects if `promise` takes longer than REDIS_TIMEOUT_MS.
 * @template T @param {Promise<T>} promise @param {string} label @returns {Promise<T>}
 */
function withTimeout(promise, label) {
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Upstash ${label} timed out after ${REDIS_TIMEOUT_MS}ms`)), REDIS_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** @param {string[]} tags @param {number} since */
function invalidatedSince(tags, since) {
  return tags.some((tag) => (tagTimestamps.get(tag) ?? 0) > since);
}

/** @type {import("next/cache").CacheHandler} */
const handler = {
  async get(cacheKey, softTags) {
    const pending = pendingSets.get(cacheKey);
    if (pending) await pending;

    try {
      /** @type {StoredEntry | null} */
      const stored = await withTimeout(redis.get(cacheKeys.entry(cacheKey)), "get");
      if (!stored) return undefined;
      if (invalidatedSince([...stored.tags, ...softTags], stored.timestamp)) return undefined;

      return {
        value: streamFromBytes(Buffer.from(stored.value, "base64")),
        tags: stored.tags,
        stale: stored.stale,
        timestamp: stored.timestamp,
        expire: stored.expire,
        revalidate: stored.revalidate,
      };
    } catch (error) {
      console.error("[cache] get failed, treating as a miss:", error);
      return undefined;
    }
  },

  async set(cacheKey, pendingEntry) {
    /** @type {(value?: unknown) => void} */
    let done = () => {};
    pendingSets.set(cacheKey, new Promise((resolve) => (done = resolve)));

    try {
      const entry = await pendingEntry;
      // The stream can be read once; buffer it and store bytes, never the stream.
      const bytes = Buffer.from(await new Response(entry.value).arrayBuffer());
      const ttl = Number.isFinite(entry.expire)
        ? Math.max(1, Math.min(Math.ceil(entry.expire), MAX_TTL_SECONDS))
        : MAX_TTL_SECONDS;

      /** @type {StoredEntry} */
      const stored = {
        value: bytes.toString("base64"),
        tags: entry.tags,
        stale: entry.stale,
        timestamp: entry.timestamp,
        expire: entry.expire,
        revalidate: entry.revalidate,
      };
      await withTimeout(redis.set(cacheKeys.entry(cacheKey), stored, { ex: ttl }), "set");
    } catch (error) {
      // The page was already served; losing this entry only means the next request recomputes it.
      console.error("[cache] set failed:", error);
    } finally {
      done();
      pendingSets.delete(cacheKey);
    }
  },

  async refreshTags() {
    try {
      /** @type {Record<string, number | string> | null} */
      const all = await withTimeout(redis.hgetall(cacheKeys.tags), "refreshTags");
      if (all) {
        for (const [tag, timestamp] of Object.entries(all)) tagTimestamps.set(tag, Number(timestamp));
      }
    } catch (error) {
      console.error("[cache] refreshTags failed:", error);
    }
  },

  async getExpiration(tags) {
    return Math.max(0, ...tags.map((tag) => tagTimestamps.get(tag) ?? 0));
  },

  async updateTags(tags) {
    if (tags.length === 0) return;
    const now = Date.now();
    for (const tag of tags) tagTimestamps.set(tag, now);
    try {
      await withTimeout(redis.hset(cacheKeys.tags, Object.fromEntries(tags.map((tag) => [tag, now]))), "updateTags");
    } catch (error) {
      console.error("[cache] updateTags failed:", error);
    }
  },
};

module.exports = handler;
