import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 Configuration:
// - If DATABASE_URL starts with "prisma://", Prisma automatically uses Accelerate
// - Otherwise, use PRISMA_ACCELERATE_URL for Accelerate connection
// - Direct database connection uses DATABASE_URL

const databaseUrl = process.env.DATABASE_URL;
const accelerateUrl = undefined; // process.env.PRISMA_ACCELERATE_URL;

const makePrismaClient = () => {
  // 1. Validate environment
  if (!databaseUrl) {
    // Build-time safety for when env vars aren't present
    return new PrismaClient({ log: ["error"] }).$extends(withAccelerate());
  }

  // 2. Determine if we should use Accelerate or Direct connection
  const shouldUseAccelerate = !!accelerateUrl || databaseUrl.startsWith("prisma://");

  if (shouldUseAccelerate) {
    return new PrismaClient({
      accelerateUrl: accelerateUrl || databaseUrl,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    }).$extends(withAccelerate());
  }

  // 3. Fallback to Direct PostgreSQL Adapter (preferred for serverless cold starts if not using Accelerate)
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends(withAccelerate());
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof makePrismaClient> | undefined;
};

// Revert to singleton to prevent connection leaks
export const db = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Forces HMR to pick up new Prisma Client
export const timestamp = new Date().toISOString();
