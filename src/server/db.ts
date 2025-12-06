import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

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
// - DATABASE_URL for direct connection (requires PostgreSQL adapter)
// - PRISMA_ACCELERATE_URL for Accelerate connection
// Prisma 7 requires either adapter or accelerateUrl in constructor
// Lazy initialization to avoid build-time errors when env vars aren't set
function createPrismaClient() {
  // Check if using Accelerate (either via PRISMA_ACCELERATE_URL or prisma:// prefix in DATABASE_URL)
  const accelerateUrl = process.env.PRISMA_ACCELERATE_URL;
  const databaseUrl = process.env.DATABASE_URL;
  
  // Use Accelerate if PRISMA_ACCELERATE_URL is set, or if DATABASE_URL starts with "prisma://"
  if (accelerateUrl || databaseUrl?.startsWith("prisma://")) {
    const urlToUse = accelerateUrl || databaseUrl;
    if (!urlToUse) {
      throw new Error("Accelerate URL is required when using Prisma Accelerate");
    }
    // Use Accelerate connection
    return new PrismaClient({
      accelerateUrl: urlToUse,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  } else {
    // For direct PostgreSQL connection, use the PostgreSQL adapter
    if (!databaseUrl) {
      // During build, DATABASE_URL might not be set - return a client that will fail at runtime
      // This allows the build to complete
      return new PrismaClient({
        log: ["error"],
      } as any);
    }
    // Handle SSL configuration for Railway pgvector template
    // Use 'prefer' mode which tries SSL but falls back to non-SSL if server doesn't support it
    let connectionString = databaseUrl;
    
    // If connection string doesn't specify sslmode, add prefer mode
    if (!connectionString.includes("sslmode=")) {
      const separator = connectionString.includes("?") ? "&" : "?";
      connectionString = `${connectionString}${separator}sslmode=prefer`;
    }
    
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }
}

const baseClient = createPrismaClient();

// Extend with Accelerate for caching capabilities
export const db = baseClient.$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

