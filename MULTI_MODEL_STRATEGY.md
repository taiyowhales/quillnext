# Multi-Model AI Strategy

## Overview

The application uses **four Gemini models** with intelligent task-based selection to optimize cost and performance. Each AI task is automatically assigned the most cost-effective model based on complexity requirements.

## Model Selection Matrix

| Task Type | Model | Complexity | Cost (per 1M tokens) | Use Cases |
|-----------|-------|-----------|---------------------|-----------|
| **Personality Profiling** | Gemini 3 Pro | Highest | $2/$12 | Most advanced analysis, nuanced understanding |
| **Learning Style Analysis** | Gemini 3 Pro | Highest | $2/$12 | Deep comprehensive profiling |
| **Course Structure Design** | Gemini 3 Pro | Highest | $2/$12 | Complex multi-step curriculum planning |
| **Video Processing** | Gemini 3 Pro | Highest | $2/$12 | ⚠️ **ONLY MODEL** that processes YouTube videos |
| **Video-Based Content** | Gemini 3 Pro | Highest | $2/$12 | Content generation from YouTube videos |
| **Quiz Generation** | Flash | Medium | $0.30/$2.50 | Interactive assessments |
| **Worksheet Generation** | Flash | Medium | $0.30/$2.50 | Practice materials |
| **Lesson Plan Generation** | Flash | Medium | $0.30/$2.50 | Structured lesson plans |
| **Generative UI** | Flash | Medium | $0.30/$2.50 | Streaming React components |
| **Text Summarization** | Flash-Lite | Low | $0.10/$0.40 | Condensing content |
| **Text Leveling** | Flash-Lite | Low | $0.10/$0.40 | Reading level adaptation |
| **Proofreading** | Flash-Lite | Low | $0.10/$0.40 | Grammar/spelling correction |

## Cost Savings

### Example: Generating 1,000 Quizzes

- **Using Pro:** ~$2,500 (output tokens)
- **Using Flash:** ~$250 (output tokens) ✅
- **Savings:** $2,250 (90% reduction)

### Example: Personality Profiling (100 students)

- **Using Gemini 3 Pro:** ~$1.20 (highest quality) ✅ **Default**
- **Using Gemini 2.5 Pro:** ~$1.10 (high quality, cost-effective)
- **Using Flash:** ~$0.28 (may miss nuances)
- **Trade-off:** Quality vs. cost (Gemini 3 Pro recommended for best accuracy)

## Implementation

### Automatic Selection

```typescript
import { getModelForTask, AITaskType } from "@/lib/ai/config";

// Automatically selects Flash for quiz generation
const model = getModelForTask(AITaskType.QUIZ_GENERATION);
```

### Task Type Enum

All task types are defined in `AITaskType` enum:
- High complexity → Pro
- Medium complexity → Flash
- Low complexity → Flash-Lite

### Adding New Tasks

1. Add to `AITaskType` enum in `src/lib/ai/config.ts`
2. Map to appropriate model in `taskModelMap`
3. Use `getModelForTask()` in your code

## Model Specifications

### Gemini 3 Pro
- **Context:** 1M input / 64k output tokens
- **Best For:** Most advanced reasoning, complex multi-step analysis, **YouTube video processing**
- **When to Use:** 
  - Highest quality personality profiling, learning analysis, complex content
  - **⚠️ REQUIRED for any Course Builder tasks with YouTube video links**
  - Video analysis and video-based content generation
- **Pricing:** $2/$12 per 1M tokens
- **Knowledge Cutoff:** January 2025
- **⚠️ Critical Capability:** Only model that can process YouTube videos

### Gemini 2.5 Pro
- **Context:** 1M input / 64k output tokens
- **Best For:** Complex reasoning, multi-step analysis (cost-effective alternative)
- **When to Use:** Complex tasks when budget is a concern
- **Pricing:** $1.25/$10 per 1M tokens

### Gemini 2.5 Flash
- **Context:** 1M input / 64k output tokens
- **Best For:** Fast, moderate complexity tasks
- **When to Use:** Most content generation (90% of tasks)

### Gemini 2.5 Flash-Lite
- **Context:** 1M input / 64k output tokens
- **Best For:** Simple, high-volume tasks
- **When to Use:** Text transformations, summaries, basic Q&A

## Quality vs. Cost Trade-offs

### Use Gemini 3 Pro When:
- ✅ Output quality is absolutely critical
- ✅ Task requires most advanced reasoning
- ✅ Complex multi-step analysis needed
- ✅ Nuanced understanding is essential
- ✅ Budget allows for premium model

### Use Gemini 2.5 Pro When:
- ✅ Output quality is important but budget-conscious
- ✅ Task requires deep reasoning
- ✅ Multi-step analysis needed
- ✅ Good balance of quality and cost

### Use Flash When:
- ✅ Speed is important
- ✅ Task is moderately complex
- ✅ Cost optimization desired
- ✅ Quality is good enough

### Use Flash-Lite When:
- ✅ Task is simple/straightforward
- ✅ High volume processing
- ✅ Cost is primary concern
- ✅ Quality requirements are low

## Monitoring & Optimization

### Track Usage
- Monitor token usage per model
- Track costs per task type
- Identify opportunities to downgrade/upgrade models

### Adjustments
- If Flash quality is insufficient → Upgrade to Pro
- If Pro is overkill → Downgrade to Flash
- Test Flash-Lite for simple tasks to save costs

## References

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Model Selection Guide](./src/lib/ai/model-selection.md)
- [Configuration File](./src/lib/ai/config.ts)

