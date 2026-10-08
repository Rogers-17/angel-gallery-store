import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

type Database = NeonHttpDatabase<typeof schema>;

let db: Database | undefined;

// Created lazily so builds don't require DATABASE_URL.
export function getDb(): Database {
  db ??= drizzle({ client: neon(serverEnv.databaseUrl), schema });
  return db;
}
