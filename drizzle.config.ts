import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL || process.env.DRIZZLE_DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL or DRIZZLE_DATABASE_URL must be set");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
  strict: true,
});
