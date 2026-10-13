import "server-only";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/db";
import { storeSettings } from "@/db/schema";
import { cacheTags } from "./tags";
import type { StoreSettingsData } from "./types";

/** The single store settings row. Throws if the database hasn't been seeded. */
export async function getStoreSettings(): Promise<StoreSettingsData> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.settings);

  const row = await getDb().query.storeSettings.findFirst({ where: eq(storeSettings.id, 1) });
  if (!row) {
    throw new Error("Store settings are missing. Run `pnpm db:seed`.");
  }

  return {
    whatsappNumber: row.whatsappNumber,
    lrdPerUsd: row.lrdPerUsd,
    lrdRateUpdatedAt: row.lrdRateUpdatedAt.toISOString(),
    paymentInstructions: row.paymentInstructions,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
  };
}
