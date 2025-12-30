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
- **✅ Database seeding complete** - 606 ResourceKind entries successfully seeded
- **✅ YAML parsing fixed** - Fixed colon-in-key parsing issues in GENERATOR_CONTENT_TYPES.YAML
- **✅ Authentication setup complete** - Google OAuth configured, login/signup pages created

🔄 **In Progress:**
- Onboarding wizard UI (backend ready, needs frontend)
- Frontend pages and components (backend infrastructure ready)

❌ **Not Started:**
- Student management UI
- Library interface
- Generator tools UI
- Course builder interface

---

## 🚀 Phase 1: Database Setup (IMMEDIATE - Do This First)

This is the **critical dependency** for all features. The Academic Spine must be seeded before any AI features can work properly.

### Step 1: Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/quillnext?schema=public"
DIRECT_DATABASE_URL="postgresql://user:password@localhost:5432/quillnext?schema=public"

# Auth.js
# For local development:
NEXTAUTH_URL="http://localhost:3000"
# For production (set in your hosting platform):
# NEXTAUTH_URL="https://quillandcompass.app"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Providers
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Optional: Prisma Accelerate (for production)
# PRISMA_ACCELERATE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**For Production:**
- Set `NEXTAUTH_URL="https://quillandcompass.app"` in your hosting platform
- Update Google OAuth redirect URI to: `https://quillandcompass.app/api/auth/callback/google`
- See `docs/DEPLOYMENT.md` for complete deployment guide

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
- ✅ **606 ResourceKind entries** successfully seeded and linked to Strands
- ✅ All YAML parsing issues resolved (keys with colons now use single quotes)

**Verification:**
After seeding, you should see:
- Multiple Subjects (Fine Arts, Bible & Theology, etc.)
- Thousands of Objectives with sequencing data
- 606 ResourceKind entries (generators) linked to their respective Strands
- All three problematic keys fixed: "New Testament Studies: Life and Doctrine in Christ", "Computer Science: Programming & Algorithms", "Information Technology: Creative & Professional Application"

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

### 2.1 Auth Provider Setup ✅ **COMPLETE**

**File:** `src/auth.ts`

✅ **Completed:**
- Google OAuth provider configured
- Prisma adapter integrated
- JWT session strategy configured
- Auth handlers exported for API routes

**Steps Completed:**
1. ✅ Google OAuth provider added to `src/auth.ts`
2. ✅ Environment variables documented (add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`)
3. ✅ Auth configuration in `src/auth.config.ts` with route protection
4. ✅ Proxy middleware (`src/proxy.ts`) for route protection

**Next Steps:**
- Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
- Add to `.env`:
  ```env
  GOOGLE_CLIENT_ID="your-client-id"
  GOOGLE_CLIENT_SECRET="your-client-secret"
  ```
- Set redirect URI in Google Console: `http://localhost:3000/api/auth/callback/google` (dev) or `https://quillandcompass.app/api/auth/callback/google` (prod)

### 2.2 Login/Signup Pages ✅ **COMPLETE**

**Files Created:**
- ✅ `src/app/login/page.tsx` - Login page with Google OAuth
- ✅ `src/app/signup/page.tsx` - Signup page with Google OAuth
- ✅ `src/components/icons/google-logo.tsx` - Client component wrapper for icon
- ✅ `src/components/icons/sign-in.tsx` - Client component wrapper for icon
- ✅ `src/components/icons/user-plus.tsx` - Client component wrapper for icon

**Features Implemented:**
- ✅ Google OAuth sign-in button
- ✅ Server action for authentication (`handleSignIn` / `handleSignUp`)
- ✅ Redirect to `/onboarding` after sign-in
- ✅ Links between login and signup pages
- ✅ Design system compliant (using Button, Card components)
- ✅ Client boundary properly set for icons (fixes React 19 build issues)

**Technical Notes:**
- Icons wrapped in client components to avoid `createContext` build errors
- Uses `Button` component with `asChild` prop for links
- Follows CURSOR_RULES design system standards

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

## 📝 Technical Notes & Known Issues

### YAML Structure & Seeding
The `GENERATOR_CONTENT_TYPES.YAML` file uses a hierarchical structure:
```yaml
Bible & Theology:
  New Testament Studies: Life and Doctrine in Christ:
    - Epistle Outline Templates
    - Gospel Harmony Worksheets
    ...
```

**Seeding Implementation:**
- The main `prisma/seed.ts` includes a basic ResourceKind seeding section, but it expects a different format
- There's a dedicated `prisma/seed-generator-content-types.ts` script that properly handles the hierarchical structure:
  - Maps subject names to Subject records
  - Maps strand names to Strand records (by matching names)
  - Infers content types from generator names (e.g., "Worksheet" → WORKSHEET)
  - Generates slug codes from generator names
- The current seeding successfully created 606 ResourceKind entries
- **Note:** If the main seed script's ResourceKind section doesn't match the YAML structure, consider using the dedicated script or updating the main script to use the same parsing logic

### Database Seeding Status
- ✅ Master standards: Successfully seeded via `prisma/seed.ts`
- ✅ Sequenced standards: Successfully updated 26,016 objectives via `prisma/seed.ts`
- ✅ ResourceKind seeding: Successfully seeded 606 entries
  - Uses hierarchical YAML parsing (Subject → Strand → Generators)
  - Maps names to database records via fuzzy matching
  - Infers content types from generator names
  - Generates slug codes automatically
  - **Note:** There are two seed scripts:
    - `prisma/seed.ts` - Main seed script (includes basic ResourceKind seeding)
    - `prisma/seed-generator-content-types.ts` - Dedicated script with proper hierarchical parsing
  - Current 606 entries verified and working correctly

### Prisma Accelerate
- Optional but recommended for production
- Connection string should be in `PRISMA_ACCELERATE_URL`
- App automatically uses Accelerate if URL is provided
- See `docs/PRISMA_ACCELERATE_SETUP.md` for details

---

## 📋 Quick Start Checklist

**Before Building Features:**
- [x] Set up `.env` file with all required variables
- [x] Run `npm run db:generate`
- [x] Run `npm run db:migrate`
- [x] Run `npm run db:seed` ✅ **COMPLETE** (606 ResourceKind entries verified)
- [x] Verify data in Prisma Studio
- [ ] Test tRPC curriculum router (backend ready, needs frontend test)

**First Feature to Build:**
- [x] **Authentication (login/signup)** - ✅ **COMPLETE**
  - ✅ Auth.js structure configured in `src/auth.ts`
  - ✅ Google OAuth provider added
  - ✅ Login/signup pages created
  - ⚠️ **Action Required:** Add Google OAuth credentials to `.env` file
- [ ] **Family Blueprint Wizard** - ⚠️ NEXT PRIORITY
- [ ] Student Personality Assessment

---

## 🎯 Recommended Order

1. **✅ Database Setup** - **COMPLETE** ✅
   - All tables created
   - Academic Spine seeded (26,016 objectives)
   - 606 ResourceKind entries seeded and verified
   - YAML parsing issues resolved

2. **✅ Authentication** (Week 1) - **COMPLETE** ✅
   - ✅ Google OAuth provider configured
   - ✅ Login/signup pages created
   - ✅ Route protection via proxy middleware
   - ⚠️ **Action Required:** Add Google OAuth credentials to `.env` to enable sign-in

3. **🔴 Family Blueprint** (Week 1) - **NEXT PRIORITY** ⚠️
   - Foundation for personalization
   - Backend actions ready in `src/server/actions/blueprint.ts`
   - Needs frontend wizard components

4. **Student Assessment** (Week 2) - Enables personalized content
   - AI profiling ready in `src/server/ai/personality.ts`
   - Needs assessment UI

5. **Living Library** (Week 3) - Content source
   - Vector search utilities ready
   - Needs book scanning and library UI

6. **Generators** (Week 4) - Core tooling
   - Generative UI foundation ready
   - ResourceKind data seeded
   - Needs generator selection UI

7. **Course Builder** (Week 5-6) - Main feature
   - Course pacing utilities ready
   - Needs drag-and-drop builder UI

8. **Grading** (Week 7) - Completion feature
   - Schema ready
   - Needs grading interface

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

## 🎉 Recent Updates

**Latest Completion (Current Session):**
- ✅ **Phase 2.1 & 2.2: Authentication Complete**
  - Google OAuth provider configured in `src/auth.ts`
  - Login page created (`src/app/login/page.tsx`)
  - Signup page created (`src/app/signup/page.tsx`)
  - Icon components wrapped in client boundaries (fixes React 19 build issues)
  - Route protection via `src/proxy.ts` (Next.js 16 proxy convention)
  - Design system compliant (Button, Card components)
  - Build successfully completes
- ✅ Fixed YAML parsing errors in `GENERATOR_CONTENT_TYPES.YAML`
  - Changed double quotes to single quotes for keys containing colons
  - Fixed: "New Testament Studies: Life and Doctrine in Christ"
  - Fixed: "Computer Science: Programming & Algorithms"
  - Fixed: "Information Technology: Creative & Professional Application"
- ✅ Verified database seeding success
  - 606 ResourceKind entries confirmed in database
  - All three problematic strands now have their generators properly seeded
  - All generator types (Templates, Worksheets, Guides, Prompts, etc.) properly categorized

**Next Immediate Step:**
🔴 **Phase 2.3: Family Blueprint Wizard** - Create onboarding wizard UI. Backend actions are ready in `src/server/actions/blueprint.ts`. This enables personalization features.

---

Start with **Phase 2: Authentication** - Database setup is complete! 🚀

