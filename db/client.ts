import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let cached: ReturnType<typeof drizzle<typeof schema>> | undefined;

/** Lazily creates a pooled connection so builds don't require DATABASE_URL. */
export function getDb() {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // Serverless-friendly: small pool; prepare:false keeps compatibility with poolers (e.g. Neon/PgBouncer).
  const client = postgres(url, { max: 5, prepare: false, ssl: "require" });
  cached = drizzle(client, { schema });
  return cached;
}
