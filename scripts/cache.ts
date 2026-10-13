// Invalidates `use cache: remote` (Upstash) entries from CLI scripts by writing tag timestamps,
// exactly as Next's updateTag() does through cache-handlers/upstash-remote.js.
// Prerendered pages (`use cache`, in-memory) are not affected: restart `pnpm dev` or redeploy.
// The admin dashboard (roadmap Phase 6) refreshes them in-app with updateTag().
import { Redis } from "@upstash/redis";
import { cacheKeys } from "../cache-handlers/keys";

export async function invalidateCacheTags(tags: string[]) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log("Restart `pnpm dev` (or redeploy) to see the changes.");
    return;
  }
  const now = Date.now();
  try {
    await Redis.fromEnv().hset(cacheKeys.tags, Object.fromEntries(tags.map((tag) => [tag, now])));
    console.log(
      `Remote cache invalidated: ${tags.join(", ")}. Restart "pnpm dev" (or redeploy) to refresh prerendered pages.`,
    );
  } catch (error) {
    // The database write already succeeded; only the cache refresh failed.
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `⚠ Database updated, but the cache could not be invalidated (${message}).\n` +
        "  Check UPSTASH_REDIS_REST_TOKEN is the read-write token (not the read-only one), then re-run.",
    );
    process.exitCode = 1;
  }
}
