// Updates a store setting until the admin settings page exists (roadmap Phase 6).
// Usage:
//   pnpm settings:rate 172.5            (Liberian dollars per 1 USD)
//   pnpm settings:whatsapp +231779268242
import { eq } from "drizzle-orm";
import { storeSettings } from "../src/db/schema";
import { normalizeLiberianPhone } from "../src/lib/phone";
import { assertSafeTarget, db, dbHost } from "./db";
import { invalidateCacheTags } from "./cache";

async function main() {
  const [setting, value, ...rest] = process.argv.slice(2);
  assertSafeTarget(rest);

  if (setting === "rate") {
    const rate = Number(value);
    if (!Number.isFinite(rate) || rate <= 0 || rate > 100_000) {
      throw new Error(`Invalid rate "${value}". Example: pnpm settings:rate 172.5`);
    }
    const updated = await db
      .update(storeSettings)
      .set({ lrdPerUsd: rate, lrdRateUpdatedAt: new Date() })
      .where(eq(storeSettings.id, 1))
      .returning({ id: storeSettings.id });
    if (updated.length === 0) throw new Error("No settings row. Run `pnpm db:seed` first.");
    console.log(`${dbHost}: LRD rate set to ${rate} per USD.`);
    await invalidateCacheTags(["settings"]);
    return;
  }

  if (setting === "whatsapp") {
    const phone = normalizeLiberianPhone(value ?? "");
    if (!phone) throw new Error(`Invalid Liberian number "${value}". Example: +231779268242`);
    const updated = await db
      .update(storeSettings)
      .set({ whatsappNumber: phone })
      .where(eq(storeSettings.id, 1))
      .returning({ id: storeSettings.id });
    if (updated.length === 0) throw new Error("No settings row. Run `pnpm db:seed` first.");
    console.log(`${dbHost}: WhatsApp number set to ${phone}.`);
    await invalidateCacheTags(["settings"]);
    return;
  }

  throw new Error('Unknown setting. Use "rate" or "whatsapp".');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
