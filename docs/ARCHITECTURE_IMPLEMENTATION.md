# T3 Stack Architecture Implementation

## Overview

This document outlines the foundational infrastructure that has been implemented to support the reimagined T3 Stack architecture for your six core features.

## ✅ Completed Foundation

### 1. Zod Schemas (`src/lib/schemas/onboarding.ts`)

**Purpose:** Type-safe validation for Family Blueprint wizard steps

**Schemas:**
- `instructorSchema` - Instructor information
- `classroomSchema` - Step 1: Classroom creation
- `scheduleSchema` - Step 2: Schedule configuration
- `environmentSchema` - Step 3: Environment preferences
- `familyBlueprintSchema` - Combined schema for full blueprint

**Usage:** Server Actions use these for validation before saving to database.

---

### 2. Type Definitions (`src/lib/types/tools.ts`)

**Purpose:** Type-safe definitions for generator tools and ResourceKind

**Types:**
- `GeneratorConfig` - Matches YAML structure for ResourceKind
- `AvailableTools` - Response type for context-aware tool queries
- `GeneratorInput` - Dynamic input schema for generators
- `OmniGeneratorTool` - Tool definition for unified generator endpoint

**Usage:** Frontend components and tRPC routers use these for type safety.

---

### 3. tRPC Curriculum Router (`src/server/api/routers/curriculum.ts`)

**Purpose:** Provides access to Academic Spine data and smart tooling

**Procedures:**
- `getAvailableTools` - Returns context-aware tools for a strand/subject
- `getObjectives` - Fetches objectives for Course Builder auto-fill
- `getSpineHierarchy` - Returns full Academic Spine structure
- `getObjective` - Gets single objective with full context for prompt building

**Usage:** Frontend queries this router to:
- Show recommended tools based on current course/strand
- Auto-fill course schedules with sequenced objectives
- Build prompts with Academic Spine context

---

### 4. Prompt Building Utilities (`src/lib/utils/prompt-builder.ts`)

**Purpose:** Builds AI prompts with full context (Academic Spine + Student + Family)

**Functions:**
- `buildSpineAwarePrompt()` - Injects Academic Spine hierarchy and complexity
- `buildPersonalizedPrompt()` - Adds student personality and learning style
- `buildFamilyContextPrompt()` - Adds educational philosophy and faith background
- `buildCompletePrompt()` - Combines all context sources

**Usage:** All AI generation endpoints use these to create context-rich prompts.

**Example:**
```typescript
const prompt = await buildCompletePrompt({
  objectiveId: "obj-123",
  studentId: "student-456",
  organizationId: "org-789",
  userInstruction: "Create a quiz about fractions"
});
// Result includes: Academic context, student personality, family philosophy
```

---

### 5. Course Pacing Utilities (`src/lib/utils/course-pacing.ts`)

**Purpose:** Calculates course dates based on family blueprint schedule

**Functions:**
- `calculateCoursePacing()` - Main function that fetches classroom and calculates
- `calculatePacingFromSchedule()` - Pure function for preview/validation
- `autoFillCourseSchedule()` - Distributes objectives across weeks using sortOrder

**Usage:** 
- Course Builder UI shows preview of schedule
- Server Actions use this to save course dates
- Auto-fill feature distributes objectives properly

---

### 6. Server Actions (`src/server/actions/blueprint.ts`)

**Purpose:** Progressive saving for Family Blueprint wizard

**Actions:**
- `saveClassroomStep()` - Saves Step 1 (classroom + instructors + PIN)
- `saveScheduleStep()` - Saves Step 2 (schedule + holidays)
- `saveEnvironmentStep()` - Saves Step 3 (environment preferences)
- `getBlueprintProgress()` - Restores wizard state

**Features:**
- Each step saves independently (prevents data loss)
- Uses Prisma transactions for consistency
- Hashes instructor PINs with bcrypt
- Updates user name from first instructor

**Usage:** Frontend wizard calls these actions after each step completion.

---

## 🔄 Integration Points

### Academic Spine → Prompt Building

When generating content:
1. User selects an Objective
2. `buildSpineAwarePrompt()` fetches full hierarchy
3. Prompt includes: Subject > Strand > Topic > Subtopic > Objective
4. Also includes: Grade level, complexity (Bloom's), sortOrder

### Smart Tooling → Frontend

When user is in a course:
1. Frontend calls `trpc.curriculum.getAvailableTools({ strandId })`
2. Backend returns specialized tools for that strand
3. UI shows "Recommended Actions" instead of generic tools
4. User sees: "Create Timeline" (not "Create Content")

### Family Blueprint → AI Context

When generating personalized content:
1. `buildFamilyContextPrompt()` fetches classroom
2. Adds educational philosophy (Classical, Charlotte Mason, etc.)
3. Adds faith background (Protestant, Catholic, Secular, etc.)
4. AI respects these preferences in all generated content

---

## 📋 Next Steps

### Immediate (Core Features)

1. **Student Personality Assessment**
   - Create AI profiling endpoint using Vercel AI SDK `generateObject`
   - Store `suggestedSystemPrompt` in LearnerProfile
   - Build frontend assessment component

2. **Living Library**
   - Implement book scanner with Vision API
   - Set up pgvector for semantic search
   - Create content extraction pipeline

3. **Inkling Generators**
   - Build unified generator endpoint with tool selection
   - Implement `streamUI` for Generative UI
   - Create generator form components

4. **Course Builder**
   - Build drag-and-drop syllabus interface
   - Implement AI co-pilot with `useObject`
   - Connect to pacing utilities

5. **Inkling Grading**
   - Create structured rubric validation
   - Implement grading strategies
   - Build feedback generation

### Infrastructure

1. **Prisma Seed Script**
   - Implement seeding from `academic_standards_master.json`
   - Parse `GENERATOR_CONTENT_TYPES.YAML` into ResourceKind
   - Load sequenced standards with gradeLevel/complexity

2. **Auth.js v5 Setup**
   - Configure auth routes
   - Set up session management
   - Protect tRPC procedures

3. **Vector Embeddings**
   - Set up pgvector extension
   - Generate embeddings for Family Blueprint
   - Create semantic search utilities

---

## 🎯 Architecture Principles

1. **No Blank Canvases** - Always provide scaffolding (objectives, tools, pacing)
2. **Type Safety First** - Zod schemas validate at boundaries
3. **Server Components Default** - Use client components only when needed
4. **Progressive Enhancement** - Save data incrementally, not all at once
5. **Context Injection** - Always include Academic Spine + Student + Family context

---

## 📚 Key Files Reference

- **Schemas:** `src/lib/schemas/onboarding.ts`
- **Types:** `src/lib/types/tools.ts`
- **tRPC Router:** `src/server/api/routers/curriculum.ts`
- **Prompt Builder:** `src/lib/utils/prompt-builder.ts`
- **Pacing:** `src/lib/utils/course-pacing.ts`
- **Server Actions:** `src/server/actions/blueprint.ts`
- **Academic Spine Guide:** `.cursor/CURRICULUM_INTEGRATION_GUIDE.mdc`

---

## 🚀 Getting Started

1. **Set up database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed  # (once seed script is implemented)
   ```

2. **Start development:**
   ```bash
   npm run dev
   ```

3. **Test tRPC router:**
   ```typescript
   const tools = await trpc.curriculum.getAvailableTools.query({
     strandId: "strand-123"
   });
   ```

---

This foundation provides the infrastructure needed to build the six core features with type safety, context awareness, and progressive enhancement.

