/**
 * Prisma Query Caching Utilities
 * 
 * Helper functions for common caching patterns with Prisma Accelerate
 */

/**
 * Cache duration presets (in seconds)
 */
export const CacheTTL = {
  SHORT: 30, // 30 seconds - for frequently changing data
  MEDIUM: 60, // 1 minute - for moderately stable data
  LONG: 300, // 5 minutes - for stable reference data
  VERY_LONG: 3600, // 1 hour - for rarely changing data
} as const;

/**
 * Cache strategy for Academic Spine data
 * This data rarely changes, so we can cache it for a long time
 */
export const academicSpineCacheStrategy = {
  ttl: CacheTTL.VERY_LONG, // 1 hour
} as const;

/**
 * Cache strategy for user/organization data
 * Changes more frequently, use medium cache
 */
export const userDataCacheStrategy = {
  ttl: CacheTTL.MEDIUM, // 1 minute
} as const;

/**
 * Cache strategy for course/curriculum data
 * Changes occasionally, use medium cache
 */
export const courseDataCacheStrategy = {
  ttl: CacheTTL.MEDIUM, // 1 minute
} as const;

/**
 * Cache strategy for student profiles
 * Changes infrequently, use long cache
 */
export const studentProfileCacheStrategy = {
  ttl: CacheTTL.LONG, // 5 minutes
} as const;

/**
 * Example usage:
 * 
 * ```typescript
 * import { db } from "@/server/db";
 * import { academicSpineCacheStrategy } from "@/lib/utils/prisma-cache";
 * 
 * const subjects = await db.subject.findMany({
 *   cacheStrategy: academicSpineCacheStrategy,
 * });
 * ```
 */

