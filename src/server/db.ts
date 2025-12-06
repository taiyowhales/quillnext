import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client with Accelerate extension
 * 
 * Prisma 7 Configuration:
 * - If DATABASE_URL starts with "prisma://", Prisma automatically uses Accelerate
 * - Otherwise, use PRISMA_ACCELERATE_URL for Accelerate connection
 * - Direct database connection uses DATABASE_URL
 * 
 * Accelerate provides:
 * - Connection pooling
 * - Query caching (via cacheStrategy)
 * - Global edge caching
 * - Reduced latency
 * 
 * Usage with caching:
 * ```typescript
 * await db.user.findMany({
 *   where: { email: { contains: "alice@prisma.io" } },
 *   cacheStrategy: { ttl: 60 }, // Cache for 60 seconds
 * });
 * ```
 */
const baseClient = new PrismaClient({
  // Prisma 7: Use Accelerate URL if provided, otherwise use direct connection
  // If DATABASE_URL starts with "prisma://", it's already an Accelerate URL
  datasourceUrl: process.env.PRISMA_ACCELERATE_URL || process.env.DATABASE_URL,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Extend with Accelerate for caching capabilities
export const db = baseClient.$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

