import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const makePrismaClient = () => {
  return new PrismaClient({
    // We REMOVED 'datasourceUrl'. 
    // The standard Node.js client reads process.env.DATABASE_URL automatically.
    // Passing it manually here is what caused the Vercel build error.
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends(withAccelerate());
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof makePrismaClient> | undefined;
};

// Singleton pattern to prevent connection leaks during HMR
export const db = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}