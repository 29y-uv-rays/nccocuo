import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadDotenv } from "dotenv";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

function getEnvSearchPaths() {
  const searchPaths = [path.resolve(process.cwd(), ".env")];
  
  // Add immediate subdirectories
  try {
    for (const entry of readdirSync(process.cwd(), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      searchPaths.push(path.resolve(process.cwd(), entry.name, ".env"));
    }
  } catch (e) {
    // If unable to read cwd, continue with what we have
  }
  
  // Also check if cwd has a parent with subdirectories containing .env
  const parent = path.dirname(process.cwd());
  if (parent !== process.cwd()) {
    try {
      for (const entry of readdirSync(parent, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        searchPaths.push(path.resolve(parent, entry.name, ".env"));
      }
    } catch (e) {
      // If unable to read parent, continue
    }
  }
  
  return searchPaths;
}

function tryLoadDotenv() {
  if (process.env.DATABASE_URL) return;

  for (const envPath of getEnvSearchPaths()) {
    if (!existsSync(envPath)) continue;
    loadDotenv({ path: envPath, override: false });
    if (process.env.DATABASE_URL) return;
  }
}

tryLoadDotenv();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Add it to .env before running the app.");
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;