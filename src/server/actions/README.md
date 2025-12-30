# Server Actions Standard

This document defines the standard pattern for Server Actions in QuillNext.

## Core Principles

1. **Always use `'use server'` directive** at the top of files containing Server Actions
2. **Validate all external inputs** with Zod schemas before processing
3. **Return consistent response shapes** with `{ success: boolean, data?, error?, details? }`
4. **Revalidate relevant paths** after mutations using `revalidatePath()`
5. **Never use `as any`** - maintain strict TypeScript type safety
6. **Handle errors gracefully** with typed error responses

---

## Standard Pattern

```typescript
'use server';

import { z } from 'zod';
import { db } from '@/server/db';
import { revalidatePath } from 'next/cache';

// 1. Define Zod schema for validation
const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  birthdate: z.date(),
  currentGrade: z.string(),
});

// 2. Type the input as `unknown` to force validation
export async function createStudent(data: unknown) {
  // 3. Validate input
  const parsed = createStudentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      details: parsed.error.flatten()
    };
  }

  // 4. Execute business logic
  try {
    const student = await db.student.create({
      data: {
        ...parsed.data,
        organizationId: await getOrgId(), // Add server-side context
      }
    });

    // 5. Revalidate affected paths
    revalidatePath('/students');
    revalidatePath(`/students/${student.id}`);

    // 6. Return success response
    return {
      success: true,
      data: student
    };
  } catch (error) {
    // 7. Handle errors without exposing internals
    if (process.env.NODE_ENV === 'development') {
      console.error('[createStudent]', error);
    }
    
    return {
      success: false,
      error: 'Failed to create student'
    };
  }
}
```

---

## Response Shape

All Server Actions MUST return an object with this shape:

```typescript
type ServerActionResponse<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string; details?: unknown };
```

### Examples

**Success without data**:
```typescript
return { success: true };
```

**Success with data**:
```typescript
return { success: true, data: student };
```

**Validation failure**:
```typescript
return {
  success: false,
  error: 'Invalid input',
  details: zodError.flatten()
};
```

**Operation failure**:
```typescript
return {
  success: false,
  error: 'Failed to create student'
};
```

---

## Validation Best Practices

### Schema Location

Store Zod schemas in `src/lib/schemas/[feature].ts`:

```
src/lib/schemas/
├── bible-memory.ts
├── student.ts
├── course.ts
└── ...
```

### Example Schema File

```typescript
// src/lib/schemas/student.ts
import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().max(50).optional(),
  birthdate: z.date(),
  currentGrade: z.string(),
  sex: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export const studentIdSchema = z.string().cuid("Invalid student ID");
```

### Validation in Actions

```typescript
import { createStudentSchema } from "@/lib/schemas/student";

export async function createStudent(data: unknown) {
  const parsed = createStudentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid student data',
      details: parsed.error.flatten().fieldErrors
    };
  }
  
  // parsed.data is now typed correctly
  const { firstName, lastName, birthdate } = parsed.data;
  // ...
}
```

---

## Error Handling

### Development vs Production

```typescript
try {
  // ... business logic
} catch (error) {
  // Log detailed errors only in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[actionName]', {
      message: error instanceof Error ? error.message : 'Unknown error',
      context: { studentId, courseId }
    });
  }
  
  // Return user-friendly message
  return {
    success: false,
    error: 'Failed to complete operation'
  };
}
```

### Typed Error Classes

For complex error scenarios, use custom error classes:

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

// Handler
export function handleServerActionError(error: unknown) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      ...(error instanceof ValidationError && { details: error.details }),
    };
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('[ServerAction]', error);
  }
  
  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
  };
}
```

Usage:
```typescript
try {
  const student = await db.student.findUnique({ where: { id } });
  if (!student) throw new NotFoundError('Student');
  
  // ... business logic
} catch (error) {
  return handleServerActionError(error);
}
```

---

## Revalidation Strategy

### Path Revalidation

After mutations, revalidate all paths that display the affected data:

```typescript
// After creating a student
revalidatePath('/students');              // List page
revalidatePath(`/students/${student.id}`); // Detail page
revalidatePath('/dashboard');             // If shown on dashboard

// After updating student enrollment
revalidatePath(`/students/${studentId}`);
revalidatePath(`/courses/${courseId}`);
```

### Tag Revalidation

For more complex scenarios, use `revalidateTag`:

```typescript
import { revalidateTag } from 'next/cache';

// When caching with tags
const student = await unstable_cache(
  () => db.student.findUnique({ where: { id } }),
  ['student', id],
  { tags: [`student-${id}`] }
)();

// Revalidate by tag
revalidateTag(`student-${studentId}`);
```

---

## Authentication & Authorization

Always verify authorization in Server Actions:

```typescript
import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";

export async function updateStudent(studentId: string, data: unknown) {
  // 1. Verify user is authenticated
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: 'Unauthorized',
      code: 'UNAUTHENTICATED'
    };
  }

  // 2. Verify user has access to organization
  const { organizationId } = await getCurrentUserOrg();
  
  // 3. Verify student belongs to organization
  const student = await db.student.findUnique({
    where: { id: studentId },
    select: { organizationId: true }
  });
  
  if (!student || student.organizationId !== organizationId) {
    return {
      success: false,
      error: 'Student not found',
      code: 'NOT_FOUND'
    };
  }

  // 4. Proceed with authorized operation
  // ...
}
```

---

## Example: Complete Server Action

```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { getCurrentUserOrg } from '@/lib/auth-helpers';
import { db } from '@/server/db';
import { handleServerActionError, NotFoundError, UnauthorizedError } from '@/lib/errors';

const enrollStudentSchema = z.object({
  studentId: z.string().cuid(),
  courseId: z.string().cuid(),
});

export async function enrollStudentInCourse(data: unknown) {
  // 1. Validate input
  const parsed = enrollStudentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input',
      details: parsed.error.flatten().fieldErrors
    };
  }

  const { studentId, courseId } = parsed.data;

  try {
    // 2. Verify authentication
    const session = await auth();
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const { organizationId } = await getCurrentUserOrg();

    // 3. Verify student belongs to organization
    const student = await db.student.findUnique({
      where: { id: studentId },
      select: { organizationId: true }
    });

    if (!student || student.organizationId !== organizationId) {
      throw new NotFoundError('Student');
    }

    // 4. Verify course belongs to organization
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { organizationId: true }
    });

    if (!course || course.organizationId !== organizationId) {
      throw new NotFoundError('Course');
    }

    // 5. Execute business logic
    const enrollment = await db.courseStudent.create({
      data: {
        studentId,
        courseId,
        status: 'ACTIVE',
      }
    });

    // 6. Revalidate affected paths
    revalidatePath(`/students/${studentId}`);
    revalidatePath(`/courses/${courseId}`);
    revalidatePath('/dashboard');

    // 7. Return success
    return {
      success: true,
      data: enrollment
    };

  } catch (error) {
    return handleServerActionError(error);
  }
}
```

---

## Anti-Patterns to Avoid

### ❌ Don't: Skip validation
```typescript
export async function createStudent(data: any) {
  await db.student.create({ data }); // Dangerous!
}
```

### ✅ Do: Always validate
```typescript
export async function createStudent(data: unknown) {
  const parsed = createStudentSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid input' };
  await db.student.create({ data: parsed.data });
}
```

### ❌ Don't: Use `as any` to bypass types
```typescript
await db.student.create({ data: studentData as any });
```

### ✅ Do: Fix the types properly
```typescript
const validated = createStudentSchema.parse(studentData);
await db.student.create({ data: validated });
```

### ❌ Don't: Forget to revalidate
```typescript
export async function updateStudent(id: string, data: unknown) {
  await db.student.update({ where: { id }, data });
  return { success: true };
}
```

### ✅ Do: Revalidate affected paths
```typescript
export async function updateStudent(id: string, data: unknown) {
  await db.student.update({ where: { id }, data });
  revalidatePath(`/students/${id}`);
  revalidatePath('/students');
  return { success: true };
}
```

---

## References

- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Zod Documentation](https://zod.dev/)
- [Implementation Plan](file:///C:/Users/adam/.gemini/antigravity/brain/a77d3670-85e2-492e-bab5-1dc60ea0e9c6/implementation_plan.md)
