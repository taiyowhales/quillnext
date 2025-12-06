# AI Model Selection Guide

## Overview

The application uses **four Gemini models** with intelligent task-based selection to optimize cost and performance:
- **Gemini 3 Pro** - Most advanced reasoning (highest complexity)
- **Gemini 2.5 Pro** - Complex reasoning (high complexity)
- **Gemini 2.5 Flash** - Fast, moderate complexity (medium complexity)
- **Gemini 2.5 Flash-Lite** - Fastest, simple tasks (low complexity)

## Models

### Gemini 3 Pro
- **Use Case:** Most advanced reasoning, complex multi-step analysis, **YouTube video processing**
- **Pricing:** $2/$12 per 1M tokens (input/output)
- **Best For:**
  - Personality profiling (highest quality)
  - Learning style analysis (deep understanding)
  - Complex content generation
  - Multi-step reasoning
  - Course structure design
  - **YouTube video analysis** ⚠️ **ONLY MODEL that supports YouTube videos**
  - Video-based content generation
- **Context:** 1M / 64k tokens
- **Knowledge Cutoff:** January 2025
- **⚠️ Critical:** Must use Gemini 3 Pro for any Course Builder tasks involving YouTube links

### Gemini 2.5 Pro
- **Use Case:** Complex reasoning, multi-step analysis, deep understanding
- **Pricing:** $1.25/$10 per 1M tokens (input/output)
- **Best For:**
  - Alternative to Gemini 3 Pro for cost-sensitive complex tasks
  - Complex content generation (when 3 Pro is overkill)
  - Multi-step reasoning (when budget is a concern)
- **Context:** 1M / 64k tokens

### Gemini 2.5 Flash
- **Use Case:** Fast responses with moderate complexity
- **Pricing:** $0.30/$2.50 per 1M tokens (input/output)
- **Best For:**
  - Generative UI (streaming components)
  - Quiz generation
  - Worksheet generation
  - Lesson plan generation
  - Most content generation tasks

### Gemini 2.5 Flash-Lite
- **Use Case:** Simple tasks requiring speed and low cost
- **Pricing:** $0.10/$0.40 per 1M tokens (input/output)
- **Best For:**
  - Text summarization
  - Text leveling
  - Proofreading
  - Simple Q&A
  - Basic text transformations

## Task Type Mapping

### Highest Complexity (Gemini 3 Pro)
- `PERSONALITY_PROFILING` - Deep analysis of student responses
- `LEARNING_STYLE_ANALYSIS` - Comprehensive learning profile
- `COMPLEX_CONTENT_GENERATION` - Multi-faceted content creation
- `MULTI_STEP_REASONING` - Tasks requiring chain-of-thought
- `COURSE_STRUCTURE_DESIGN` - Complex curriculum planning
- `VIDEO_PROCESSING` - YouTube video analysis ⚠️ **REQUIRES Gemini 3 Pro**
- `VIDEO_BASED_CONTENT` - Content generation from videos ⚠️ **REQUIRES Gemini 3 Pro**

### Medium Complexity (Flash)
- `GENERATIVE_UI` - Streaming React components
- `QUIZ_GENERATION` - Interactive quiz creation
- `WORKSHEET_GENERATION` - Practice worksheet creation
- `LESSON_PLAN_GENERATION` - Structured lesson plans
- `RUBRIC_GENERATION` - Grading rubrics
- `CONTENT_GENERATION` - General educational content
- `PROMPT_BUILDING` - Context-aware prompt construction

### Low Complexity (Flash-Lite)
- `TEXT_SUMMARIZATION` - Condensing text
- `TEXT_LEVELING` - Adapting text to reading level
- `PROOFREADING` - Grammar and spelling correction
- `SIMPLE_QA` - Basic question answering
- `TEXT_TRANSFORMATION` - Format conversions

## Usage

### Automatic Selection (Recommended)

```typescript
import { getModelForTask, AITaskType } from "@/lib/ai/config";

const model = getModelForTask(AITaskType.QUIZ_GENERATION);
// Returns: models.flash
```

### Manual Selection by Complexity

```typescript
import { getModelByComplexity, TaskComplexity } from "@/lib/ai/config";

const model = getModelByComplexity(TaskComplexity.MEDIUM);
// Returns: models.flash
```

### Direct Model Access

```typescript
import { models } from "@/lib/ai/config";

// Use specific model
const pro3Model = models.pro3; // Gemini 3 Pro
const proModel = models.pro; // Gemini 2.5 Pro
const flashModel = models.flash; // Gemini 2.5 Flash
const flashLiteModel = models.flashLite; // Gemini 2.5 Flash-Lite
```

## Cost Optimization

### Example Cost Comparison

**Generating 1000 quizzes (medium complexity):**
- Pro: ~$2.50 (output tokens)
- Flash: ~$0.25 (output tokens) ✅ **10x cheaper**
- Flash-Lite: ~$0.04 (output tokens) - May lack quality

**Personality profiling (high complexity):**
- Pro: ~$0.01 (input) + ~$0.10 (output) ✅ **Best quality**
- Flash: ~$0.003 (input) + ~$0.025 (output) - May miss nuances
- Flash-Lite: ~$0.001 (input) + ~$0.004 (output) - Insufficient

### Best Practices

1. **Use Pro for:** Tasks requiring deep understanding or multi-step reasoning
2. **Use Flash for:** Most content generation (90% of tasks)
3. **Use Flash-Lite for:** Simple transformations and summaries
4. **Monitor costs:** Track token usage per model
5. **Test quality:** Verify Flash/Flash-Lite output quality for your use case

## Adding New Tasks

When adding a new AI task:

1. Add task type to `AITaskType` enum
2. Map to appropriate model in `taskModelMap`
3. Use `getModelForTask()` in your implementation

Example:
```typescript
// In config.ts
export enum AITaskType {
  // ... existing types
  NEW_TASK_TYPE = "new_task_type",
}

const taskModelMap = {
  // ... existing mappings
  [AITaskType.NEW_TASK_TYPE]: models.flash, // or pro/flashLite
};

// In your code
const model = getModelForTask(AITaskType.NEW_TASK_TYPE);
```

## References

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Gemini 2.5 Models](https://ai.google.dev/gemini-api/docs/models/gemini)
- [Pricing Information](https://ai.google.dev/pricing)

