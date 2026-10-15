// Deletes expired carts (their lines cascade). The app also sweeps a batch whenever a new cart is
// created; this clears everything on demand. A scheduled job comes with roadmap Phase 8.
// Usage: pnpm carts:cleanup [--force]
import { lt, sql } from "drizzle-orm";
import { carts } from "../src/db/schema";
import { assertSafeTarget, db, dbHost } from "./db";

async function main() {
  assertSafeTarget(process.argv.slice(2));
  const deleted = await db.delete(carts).where(lt(carts.expiresAt, sql`now()`)).returning({ id: carts.id });
  console.log(`${dbHost}: deleted ${deleted.length} expired ${deleted.length === 1 ? "cart" : "carts"}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
