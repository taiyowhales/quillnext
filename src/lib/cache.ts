import { unstable_cache } from "next/cache";

/**
 * Cache configuration constants
 */
export const CACHE_TAGS = {
    student: (id: string) => `student-${id}`,
    studentProfile: (id: string) => `student-profile-${id}`,
    objectives: (courseIds: string[]) => `objectives-${courseIds.join(",")}`,
    masterContext: (studentId: string) => `master-context-${studentId}`,
    books: (subjectIds: string[], strandIds: string[]) =>
        `books-${subjectIds.join(",")}-${strandIds.join(",")}`,
} as const;

export const CACHE_REVALIDATE = {
    student: 60 * 5, // 5 minutes - student data changes infrequently
    objectives: 60 * 10, // 10 minutes - objectives are relatively static
    masterContext: 60 * 5, // 5 minutes - context can change with student updates
    books: 60 * 15, // 15 minutes - book catalog is very stable
} as const;

/**
 * Wraps a function with Next.js caching
 * 
 * @param fn - The function to cache
 * @param keyParts - Parts that make up the cache key
 * @param tags - Cache tags for invalidation
 * @param revalidate - Revalidation time in seconds (optional)
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyParts: string[],
    tags: string[],
    revalidate?: number
): T {
    return unstable_cache(
        fn,
        keyParts,
        {
            tags,
            revalidate,
        }
    ) as T;
}
