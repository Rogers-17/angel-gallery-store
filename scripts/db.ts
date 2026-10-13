// Drizzle client for CLI scripts (seed, settings). Runs outside Next.js, so it loads env itself
// and must not import src/db/index.ts (that module is `server-only`).
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set. Add it to .env (see .env.example).");
}

export const db = drizzle({ client: neon(url), schema, casing: "snake_case" });

/** Host of the target database, for logging. Never prints credentials. */
export const dbHost = new URL(url).host;

export function assertSafeTarget(args: string[]) {
  if (process.env.NODE_ENV === "production" && !args.includes("--force")) {
    throw new Error("Refusing to run with NODE_ENV=production. Pass --force if you really mean it.");
  }
}
