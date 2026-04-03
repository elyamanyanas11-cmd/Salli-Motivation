import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString = process.env.supa || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string must be set. Please provide the 'supa' secret or DATABASE_URL.",
  );
}

export const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
export const db = drizzle(pool, { schema });

export * from "./schema";
