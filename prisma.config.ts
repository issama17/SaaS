// Prisma reads this file for CLI commands (generate, migrate, db push…).
// Environment variables are not loaded automatically, hence `dotenv/config`.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Supabase serves the app through a connection pooler (PgBouncer), which
    // cannot run migrations. Prefer the direct connection when it is defined,
    // and fall back to DATABASE_URL for setups with a single URL.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
