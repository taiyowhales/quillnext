# Prisma Accelerate Setup Guide

## Overview

Prisma Accelerate provides connection pooling, query caching, and global edge caching for your Prisma Client. This significantly improves performance and reduces database load.

## Installation

✅ **Already Installed:**
- `@prisma/client@latest`
- `@prisma/extension-accelerate`

## Configuration

### 1. Get Your Accelerate Connection String

1. Go to [Prisma Accelerate Dashboard](https://console.prisma.io/)
2. Create a new project or select an existing one
3. Get your Accelerate connection string (format: `prisma://accelerate.prisma-data.net/?api_key=...`)

### 2. Add to Environment Variables

Add to your `.env` file:

```env
# Direct database connection (for migrations, Prisma Studio)
DATABASE_URL="postgresql://user:password@localhost:5432/quillnext?schema=public"

# Prisma Accelerate connection (for application queries)
# Option 1: Use separate PRISMA_ACCELERATE_URL
PRISMA_ACCELERATE_URL="prisma://accelerate.prisma-data.net/?api_key=your-api-key"

# Option 2: Replace DATABASE_URL with Accelerate URL (Prisma 7 auto-detects)
# DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=your-api-key"
```

**Note:** 
- If `PRISMA_ACCELERATE_URL` is set, the app uses it for queries
- If `DATABASE_URL` starts with `prisma://`, Prisma 7 automatically uses Accelerate
- Otherwise, falls back to direct database connection

## Usage

### Basic Caching

```typescript
import { db } from "@/server/db";

// Cache query results for 60 seconds
const users = await db.user.findMany({
  where: {
    email: {
      contains: "alice@prisma.io",
    },
  },
  cacheStrategy: { ttl: 60 }, // Cache for 60 seconds
});
```

### Using Cache Presets

```typescript
import { db } from "@/server/db";
import { academicSpineCacheStrategy, userDataCacheStrategy } from "@/lib/utils/prisma-cache";

// Academic Spine data (rarely changes) - 1 hour cache
const subjects = await db.subject.findMany({
  cacheStrategy: academicSpineCacheStrategy, // 1 hour
});

// User data (changes more frequently) - 1 minute cache
const users = await db.user.findMany({
  cacheStrategy: userDataCacheStrategy, // 1 minute
});
```

### Cache Duration Presets

Available in `src/lib/utils/prisma-cache.ts`:

- `CacheTTL.SHORT` - 30 seconds (frequently changing data)
- `CacheTTL.MEDIUM` - 60 seconds (moderately stable data)
- `CacheTTL.LONG` - 300 seconds / 5 minutes (stable reference data)
- `CacheTTL.VERY_LONG` - 3600 seconds / 1 hour (rarely changing data)

### Custom Cache Duration

```typescript
await db.course.findMany({
  where: { organizationId: "org-123" },
  cacheStrategy: { ttl: 120 }, // Custom: 2 minutes
});
```

## Implementation Status

✅ **Completed:**
- Accelerate extension installed (`@prisma/extension-accelerate@3.0.1`)
- Prisma Client generated for Accelerate
- Database client configured with Accelerate extension
- Cache utility functions created
- Curriculum router updated with caching
- Prisma 7 configuration updated (prisma.config.ts for migrations)

**Files Updated:**
- `src/server/db.ts` - Accelerate extension integrated
- `src/lib/utils/prisma-cache.ts` - Cache presets and utilities
- `src/server/api/routers/curriculum.ts` - Academic Spine queries cached
- `prisma/prisma.schema` - Prisma 7 compatible (no URL in datasource)
- `prisma/prisma.config.ts` - Migration configuration
- `package.json` - Updated db:generate script

## Best Practices

### When to Use Caching

✅ **Cache These:**
- Academic Spine data (subjects, strands, topics, objectives) - Very long cache
- ResourceKind definitions - Very long cache
- User/organization metadata - Medium cache
- Course structure (when not actively editing) - Medium cache

❌ **Don't Cache These:**
- Real-time data (student progress, grades)
- Frequently updated data (activity submissions)
- User-specific queries that change often
- Mutations (writes)

### Cache Invalidation

Accelerate automatically invalidates cache when:
- Data is updated via Prisma mutations
- Cache TTL expires
- Manual cache invalidation is triggered

### Performance Benefits

- **Reduced Database Load:** Cached queries don't hit the database
- **Faster Response Times:** Edge caching provides sub-10ms responses
- **Connection Pooling:** Efficient connection management
- **Global Edge Network:** Queries cached at edge locations worldwide

## Example: Cached Academic Spine Query

```typescript
import { db } from "@/server/db";
import { academicSpineCacheStrategy } from "@/lib/utils/prisma-cache";

// This query is cached for 1 hour (Academic Spine rarely changes)
const objective = await db.objective.findUnique({
  where: { id: "obj-123" },
  include: {
    subtopic: {
      include: {
        topic: {
          include: {
            strand: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    },
  },
  cacheStrategy: academicSpineCacheStrategy, // 1 hour cache
});
```

## Troubleshooting

### Accelerate Not Working

1. **Check Environment Variable:**
   ```bash
   # Windows PowerShell
   $env:PRISMA_ACCELERATE_URL
   
   # Or check .env file
   ```

2. **Verify Connection:**
   - Ensure `PRISMA_ACCELERATE_URL` is set correctly
   - Check API key is valid in Prisma Console
   - Verify URL format: `prisma://accelerate.prisma-data.net/?api_key=...`

3. **Fallback Behavior:**
   - If `PRISMA_ACCELERATE_URL` is not set, app uses direct database connection
   - Caching will not work without Accelerate URL
   - Extension still loads but caching features are disabled

### Prisma 7 Compatibility

**Note:** Prisma 7 has some changes in how Accelerate works:
- Connection URLs moved from schema to `prisma.config.ts` (for migrations)
- Client uses `datasourceUrl` parameter in constructor
- If `DATABASE_URL` starts with `prisma://`, Accelerate is auto-detected

**Current Setup:**
- ✅ Prisma 7.1.0 installed
- ✅ Accelerate extension 3.0.1 installed
- ✅ Schema updated for Prisma 7 compatibility
- ✅ Client generated successfully

### Cache Not Updating

- Cache automatically invalidates on mutations
- Wait for TTL to expire for read queries
- Use shorter TTL for frequently changing data

## References

- [Prisma Accelerate Documentation](https://www.prisma.io/docs/accelerate)
- [Prisma Accelerate Dashboard](https://console.prisma.io/)
- [Cache Strategy Guide](https://www.prisma.io/docs/accelerate/caching)

