import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 Configuration (Hybrid Adapter + Accelerate):
// - We use the PrismaPg adapter to satisfy the "Client" engine requirement (Wasm/Edge compatible)
// - We use withAccelerate for connection pooling on Vercel
// - This setup works across Node.js and Edge runtimes without conflict

const connectionString = process.env.DATABASE_URL;

const makePrismaClient = () => {
  // 1. Create a Postgres Connection Pool
  const pool = new Pool({ connectionString });

  // 2. Create the Driver Adapter
  const adapter = new PrismaPg(pool);

  // 3. Initialize Prisma Client with the Adapter
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
