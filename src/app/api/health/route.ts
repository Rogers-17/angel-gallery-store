import { connection } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";

export async function GET() {
  // Always check at request time, never during prerendering.
  await connection();

  try {
    await getDb().execute(sql`select 1`);
    return Response.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json(
      { status: "error", database: "unreachable" },
      { status: 503 },
    );
  }
}
