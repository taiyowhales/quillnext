/**
 * Prisma Query Caching Utilities
 * 
 * Helper functions for common caching patterns
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

// Cache strategies removed as part of migration to Supabase
// Use standard Next.js caching with cacheQuery instead


import { unstable_cache } from "next/cache";

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

/**
 * Wrapper for Next.js unstable_cache
 * Use this for arbitrary async operations
 */
export function cacheQuery<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  keyParts: string[],
  options: { revalidate?: number; tags?: string[] } = {}
) {
  return unstable_cache(fn, keyParts, options);
}


