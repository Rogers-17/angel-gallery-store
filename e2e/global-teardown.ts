import { eq } from "drizzle-orm";
import { orders } from "../src/db/schema";
import { db, dbHost } from "../scripts/db";
import { E2E_BUYER_NAME } from "./fixtures";

/** Deletes the orders the E2E suite placed (items and events cascade). */
export default async function globalTeardown() {
  const deleted = await db.delete(orders).where(eq(orders.customerName, E2E_BUYER_NAME)).returning({ number: orders.number });
  console.log(`[e2e] deleted ${deleted.length} test order(s) on ${dbHost}`);
}
