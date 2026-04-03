import { defineConfig } from "drizzle-kit";
import path from "path";

const connectionString = process.env.supa || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Database connection string must be set. Provide the 'supa' secret or DATABASE_URL.");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
    ssl: true,
  },
});
