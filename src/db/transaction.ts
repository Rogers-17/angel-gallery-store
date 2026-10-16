import "server-only";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

// Interactive transactions need the WebSocket driver (neon-http only runs batches). In serverless,
// a Pool can't outlive the request, so each call opens one and closes it when done.
// Node 22+ provides the global WebSocket the driver needs.

function connect(pool: Pool) {
  return drizzle({ client: pool, schema, casing: "snake_case" });
}

export type Transaction = Parameters<Parameters<ReturnType<typeof connect>["transaction"]>[0]>[0];

/** Runs `fn` in one database transaction (committed if it resolves, rolled back if it throws). */
export async function withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: serverEnv.databaseUrl });
  try {
    return await connect(pool).transaction(fn);
  } finally {
    await pool.end().catch((error: unknown) => console.error("[db] closing the transaction pool failed:", error));
  }
}
