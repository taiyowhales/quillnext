import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma: typeof db | undefined;
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
// Prisma 7: Connection URL is configured via environment variables
// - DATABASE_URL for direct connection
// - PRISMA_ACCELERATE_URL for Accelerate connection (or use "prisma://" prefix in DATABASE_URL)
// Prisma automatically uses the appropriate connection based on the URL format
const baseClient = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
} as any); // Type assertion needed due to Prisma 7 type system

// Extend with Accelerate for caching capabilities
export const db = baseClient.$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

