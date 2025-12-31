import { PrismaClient } from "@prisma/client";

// Prisma 7 Configuration:
// - If DATABASE_URL starts with "prisma://", Prisma automatically uses Accelerate
// - Otherwise, use PRISMA_ACCELERATE_URL for Accelerate connection
// - Direct database connection uses DATABASE_URL

const databaseUrl = process.env.DATABASE_URL;

const makePrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
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
