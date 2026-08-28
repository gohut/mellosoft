import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import Database from "better-sqlite3";
import * as schema from "./schema";

let dbInstance = null;

export function getDb(env) {
  // 1. Cloudflare D1 Environment Binding (Production or Wrangler Edge)
  if (env && env.DB) {
    return drizzleD1(env.DB, { schema });
  }

  if (typeof process !== "undefined" && process.env && process.env.DB) {
    return drizzleD1(process.env.DB, { schema });
  }

  // 2. Local Node.js / Next.js Development (SQLite file fallback)
  if (!dbInstance) {
    try {
      const sqlitePath = process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace("file:", "")
        : "./dev.db";
      const sqlite = new Database(sqlitePath);
      dbInstance = drizzleSqlite(sqlite, { schema });
    } catch (err) {
      console.warn("Failed to initialize better-sqlite3 database:", err.message);
      // Fallback object for edge environments if better-sqlite3 native binary is unavailable
      dbInstance = null;
    }
  }

  return dbInstance;
}

export { schema };
