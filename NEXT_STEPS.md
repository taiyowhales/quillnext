# Next Steps Roadmap

## 🎯 Current Status

✅ **Completed Foundation:**
- T3 Stack setup (Next.js 16, tRPC, Prisma 7, Auth.js v5)
- Multi-model AI configuration (Gemini 3 Pro, 2.5 Pro, Flash, Flash-Lite)
- YouTube video processing support
- Academic Spine infrastructure (schemas, routers, prompt builders)
- Vector search utilities (pgvector)
- Student personality profiling (structured output)
- Generative UI foundation
- Seed script implementation

---

## 🚀 Phase 1: Database Setup (IMMEDIATE - Do This First)

This is the **critical dependency** for all features. The Academic Spine must be seeded before any AI features can work properly.

### Step 1: Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/quillnext?schema=public"

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# AI Providers
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Optional: Auth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 2: Database Setup Commands

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Run migrations (creates tables + enables pgvector)
npm run db:migrate

# 3. Seed Academic Spine data
npm run db:seed

# 4. Verify in Prisma Studio
npm run db:studio
```

**Expected Results:**
- ✅ All tables created
- ✅ pgvector extension enabled
- ✅ Academic Spine populated (Subjects → Strands → Topics → Objectives)
- ✅ ResourceKind entries linked to Strands

### Step 3: Verify Setup

Test that everything works:

```bash
# Start dev server
npm run dev
```

Test in browser console or API route:
```typescript
// Test tRPC curriculum router
const tools = await trpc.curriculum.getAvailableTools.query({
  strandId: "some-strand-id"
});
```

---

## 🎨 Phase 2: Authentication & Onboarding (Week 1)

### 2.1 Auth Provider Setup

**File:** `src/auth.ts`

Add authentication providers:
- Google OAuth (recommended for MVP)
- Email/Password (optional)

**Steps:**
1. Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
2. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
3. Update `src/auth.ts` to include Google provider

### 2.2 Login/Signup Pages

**Files to Create:**
- `src/app/login/page.tsx` - Login page
- `src/app/signup/page.tsx` - Signup page (optional, can use login)
- `src/components/auth/LoginForm.tsx` - Login form component

**Features:**
- Google OAuth button
- Email/password form (if implementing)
- Redirect to onboarding after first login

### 2.3 Family Blueprint Wizard

**Files to Create:**
- `src/app/onboarding/page.tsx` - Wizard container
- `src/components/onboarding/ClassroomStep.tsx` - Step 1
- `src/components/onboarding/ScheduleStep.tsx` - Step 2
- `src/components/onboarding/EnvironmentStep.tsx` - Step 3

**Features:**
- Multi-step form with progress indicator
- Uses `nuqs` for URL state management
- Calls Server Actions from `src/server/actions/blueprint.ts`
- Progressive saving (each step saves independently)

**Reference:** `src/lib/schemas/onboarding.ts` for validation schemas

---

## 👤 Phase 3: Student Management (Week 2)

### 3.1 Student Personality Assessment

**Files to Create:**
- `src/app/students/[id]/assessment/page.tsx` - Assessment page
- `src/components/assessment/PersonalityQuestionnaire.tsx` - Questionnaire form
- `src/components/assessment/ResultsDisplay.tsx` - Show profile results

**Features:**
- Multi-question personality questionnaire
- Calls `generateStudentProfile()` from `src/server/ai/personality.ts`
- Stores results in `LearnerProfile.personalityData`
- Displays profile with `suggestedSystemPrompt`

**Reference:** `src/server/ai/personality.ts` for AI profiling

### 3.2 Student List/Dashboard

**Files to Create:**
- `src/app/students/page.tsx` - Student list
- `src/components/students/StudentCard.tsx` - Student card component

**Features:**
- List all students in organization
- Link to personality assessment
- Show learning profile summary

---

## 📚 Phase 4: Living Library (Week 3)

### 4.1 Book Scanner

**Files to Create:**
- `src/app/library/scan/page.tsx` - Book scanning page
- `src/components/library/BookScanner.tsx` - Camera/upload component

**Features:**
- Upload book cover image or use camera
- Use Gemini Vision API to extract ISBN/title
- Auto-populate book metadata

### 4.2 Semantic Search

**Files to Create:**
- `src/app/library/page.tsx` - Library main page
- `src/components/library/SearchBar.tsx` - Semantic search input
- `src/components/library/BookGrid.tsx` - Book display grid

**Features:**
- Semantic search using `searchBooks()` from `src/lib/utils/vector.ts`
- Generate embeddings when books are added
- "Similar books" recommendations

**Reference:** `src/lib/utils/vector.ts` for vector search

---

## 🛠️ Phase 5: Inkling Generators (Week 4)

### 5.1 Generator UI

**Files to Create:**
- `src/app/generators/page.tsx` - Generator hub
- `src/components/generators/GeneratorForm.tsx` - Tool selection form
- `src/components/generators/QuizCard.tsx` - Client component for quiz display
- `src/components/generators/WorksheetCard.tsx` - Client component for worksheet

**Features:**
- Tool selection based on ResourceKind (context-aware)
- Uses `generateLearningTool()` from `src/app/actions/generate-tool.tsx`
- Generative UI streaming (React components, not text)
- Save generated resources to database

**Reference:** 
- `src/app/actions/generate-tool.tsx` for Generative UI
- `src/server/api/routers/curriculum.ts` for available tools

### 5.2 Expand Tool Types

Add more generator tools:
- Lesson plans
- Rubrics
- Writing assignments
- Timeline generators
- Primary source analysis

---

## 📖 Phase 6: Course Builder (Week 5-6)

### 6.1 Course Creation

**Files to Create:**
- `src/app/courses/new/page.tsx` - New course wizard
- `src/components/courses/CourseForm.tsx` - Course metadata form

**Features:**
- Select subject/strand
- Choose grade band
- Set course dates (uses `calculateCoursePacing()`)

### 6.2 Syllabus Builder

**Files to Create:**
- `src/app/courses/[id]/builder/page.tsx` - Course builder interface
- `src/components/courses/BlockTree.tsx` - Drag-and-drop block hierarchy
- `src/components/courses/AICoPilot.tsx` - AI assistant for course design

**Features:**
- Drag-and-drop unit/module/lesson structure
- AI co-pilot using `useObject` for structured suggestions
- Auto-fill with objectives using `autoFillCourseSchedule()`
- YouTube video integration (requires Gemini 3 Pro)

**Reference:**
- `src/lib/utils/course-pacing.ts` for scheduling
- `src/lib/ai/video-processing.ts` for YouTube videos

### 6.3 Activity Management

**Files to Create:**
- `src/components/courses/ActivityEditor.tsx` - Activity creation/editing
- `src/components/courses/ResourcePicker.tsx` - Link resources to activities

**Features:**
- Create activities (reading, writing, project, etc.)
- Link to resources from Living Library
- Assign to objectives

---

## ✅ Phase 7: Inkling Grading (Week 7)

### 7.1 Rubric Builder

**Files to Create:**
- `src/components/grading/RubricBuilder.tsx` - Create/edit rubrics
- `src/components/grading/RubricDisplay.tsx` - Display rubric

**Features:**
- Structured rubric creation
- Link to objectives
- AI-generated rubrics using generators

### 7.2 Grading Interface

**Files to Create:**
- `src/app/grading/[id]/page.tsx` - Grading page
- `src/components/grading/GradingForm.tsx` - Grade submission form

**Features:**
- View student work
- Apply rubric
- Generate AI feedback
- Store grades in database

---

## 🔧 Infrastructure Tasks (Ongoing)

### Background Jobs
- Set up Inngest or similar for:
  - Book embedding generation
  - Video transcript extraction
  - AI context generation

### Testing
- Unit tests for utilities
- Integration tests for tRPC routers
- E2E tests for critical flows

### Performance
- Optimize vector queries
- Cache Academic Spine data
- Implement request rate limiting

---

## 📋 Quick Start Checklist

**Before Building Features:**
- [ ] Set up `.env` file with all required variables
- [ ] Run `npm run db:generate`
- [ ] Run `npm run db:migrate`
- [ ] Run `npm run db:seed`
- [ ] Verify data in Prisma Studio
- [ ] Test tRPC curriculum router

**First Feature to Build:**
- [ ] Authentication (login/signup)
- [ ] Family Blueprint Wizard
- [ ] Student Personality Assessment

---

## 🎯 Recommended Order

1. **Database Setup** (Today) - Critical dependency
2. **Authentication** (Week 1) - Required for all features
3. **Family Blueprint** (Week 1) - Foundation for personalization
4. **Student Assessment** (Week 2) - Enables personalized content
5. **Living Library** (Week 3) - Content source
6. **Generators** (Week 4) - Core tooling
7. **Course Builder** (Week 5-6) - Main feature
8. **Grading** (Week 7) - Completion feature

---

## 📚 Key Files Reference

**Already Implemented:**
- `src/lib/ai/config.ts` - Multi-model configuration
- `src/lib/utils/prompt-builder.ts` - Context injection
- `src/server/api/routers/curriculum.ts` - Academic Spine access
- `src/server/actions/blueprint.ts` - Family Blueprint saving
- `src/app/actions/generate-tool.tsx` - Generative UI
- `src/server/ai/personality.ts` - Student profiling
- `src/lib/utils/vector.ts` - Semantic search
- `prisma/seed.ts` - Database seeding

**Need to Create:**
- Frontend components (see phases above)
- Auth provider configuration
- Additional generator tools
- Course Builder UI components

---

Start with **Phase 1: Database Setup** - everything else depends on it! 🚀

