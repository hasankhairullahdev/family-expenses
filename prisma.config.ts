import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load .env.local for local dev (Prisma CLI doesn't pick it up automatically)
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "",
  },
});
