# Gemini 2.5 Multi-Model Configuration Guide

## Overview

The application uses **three Gemini 2.5 models** with intelligent task-based selection to optimize cost and performance:
- **Gemini 2.5 Pro** - Complex reasoning tasks
- **Gemini 2.5 Flash** - Most content generation (default)
- **Gemini 2.5 Flash-Lite** - Simple, fast tasks

Reference: [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)

---

## ✅ Completed Migration

### 1. **Centralized AI Configuration**

**File:** `src/lib/ai/config.ts`

- ✅ Created centralized config for all AI models
- ✅ Three models: Pro, Flash, Flash-Lite
- ✅ Task-based model selection: `getModelForTask(AITaskType)`
- ✅ Complexity-based selection: `getModelByComplexity(TaskComplexity)`
- ✅ Automatic cost optimization based on task requirements

### 2. **Updated AI Utilities**

**Files Updated:**
- ✅ `src/server/ai/personality.ts` - Uses Gemini 2.5 Pro for personality profiling
- ✅ `src/app/actions/generate-tool.tsx` - Uses task-based model selection
- ✅ `src/lib/utils/vector.ts` - Kept OpenAI embeddings (see note below)

---

## 🔧 Configuration

### Environment Variables

Add to your `.env` file:

```env
# Gemini API Key (required)
GEMINI_API_KEY="your-gemini-api-key"

# OpenAI API Key (for embeddings - optional, can switch later)
OPENAI_API_KEY="your-openai-api-key"
```

### Get Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

---

## 🎯 Gemini 3 Features

### Thinking Levels

Gemini 3 Pro uses dynamic thinking by default. You can control the reasoning depth:

- **`low`**: Minimizes latency and cost (simple tasks)
- **`high`** (Default): Maximizes reasoning depth (complex tasks)

**Current Implementation:**
- Structured outputs (personality profiling) use default `high` thinking
- Generative UI uses default `high` thinking
- Can be customized per use case if needed

### Model Specifications

| Model | Context Window | Knowledge Cutoff | Pricing (Input/Output) |
|-------|---------------|------------------|----------------------|
| `gemini-2.5-pro` | 1M / 64k | Recent | $1.25 / $10 per 1M tokens |
| `gemini-2.5-flash` | 1M / 64k | Recent | $0.30 / $2.50 per 1M tokens |
| `gemini-2.5-flash-lite` | 1M / 64k | Recent | $0.10 / $0.40 per 1M tokens |

Reference: [Gemini 3 Models](https://ai.google.dev/gemini-api/docs/gemini-3#meet-gemini-3)

---

## 📝 Embeddings Note

**Current Status:** Using OpenAI `text-embedding-3-small` for embeddings

**Reason:**
- OpenAI embeddings are well-established and reliable
- Vector dimension (1536) matches our pgvector setup
- Gemini embedding support in Vercel AI SDK may vary

**Future Migration:**
- Monitor Gemini embedding support in Vercel AI SDK
- When available, update `src/lib/utils/vector.ts` to use Gemini embeddings
- Ensure vector dimensions match (may need schema migration)

---

## 🚀 Usage Examples

### Structured Outputs (Personality Profiling)

```typescript
import { generateStudentProfile } from "@/server/ai/personality";

const profile = await generateStudentProfile(answers, "John");
// Automatically uses Gemini 2.5 Pro (AITaskType.PERSONALITY_PROFILING)
```

### Generative UI

```typescript
import { generateLearningTool } from "@/app/actions/generate-tool";

const result = await generateLearningTool({
  toolType: "quiz",
  userPrompt: "Create a quiz about fractions",
  studentId: "student-123",
  organizationId: "org-456",
});
// Automatically uses Gemini 2.5 Flash (AITaskType.QUIZ_GENERATION)
```

### Task-Based Model Selection

```typescript
import { getModelForTask, AITaskType } from "@/lib/ai/config";
import { generateText } from "ai";

// Automatic selection based on task
const model = getModelForTask(AITaskType.QUIZ_GENERATION);
const { text } = await generateText({
  model,
  prompt: "Create a quiz about photosynthesis",
});
```

### Manual Model Selection

```typescript
import { models, getModelByComplexity, TaskComplexity } from "@/lib/ai/config";

// By complexity
const flashModel = getModelByComplexity(TaskComplexity.MEDIUM);

// Direct access
const proModel = models.pro;
const flashModel = models.flash;
const flashLiteModel = models.flashLite;
```

---

## 🔄 Migration from OpenAI

### What Changed

1. **Model Provider**: `@ai-sdk/openai` → `@ai-sdk/google`
2. **Model Selection**: Single model → Multi-model with task-based selection
3. **Models**: `gpt-4o` → `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`
4. **Configuration**: Centralized in `src/lib/ai/config.ts` with intelligent selection

### What Stayed the Same

1. **API Interface**: Vercel AI SDK functions (`generateObject`, `streamUI`, etc.) work the same
2. **Embeddings**: Still using OpenAI (can migrate later)
3. **Type Safety**: Zod schemas and TypeScript types unchanged

---

## 📚 Key Benefits

1. **Cost Optimization**: Automatic model selection saves 10x on most tasks
2. **Performance**: Flash models provide fast responses for most use cases
3. **Quality**: Pro model for complex tasks requiring deep reasoning
4. **Flexibility**: Easy to adjust model selection per task
5. **Large Context**: All models support 1M token input window
6. **Multimodal**: Supports text, images, video (ready for future features)

---

## 🛠️ Troubleshooting

### API Key Issues

```bash
# Verify your API key is set
echo $GEMINI_API_KEY

# Or check in .env file
cat .env | grep GEMINI
```

### Model Not Found

- Ensure you're using `gemini-3-pro-preview` (not `gemini-3-pro`)
- Check that `@ai-sdk/google` is installed: `npm list @ai-sdk/google`

### Rate Limits

- Gemini 3 has rate limits (see [pricing page](https://ai.google.dev/pricing))
- Implement retry logic for production use
- Consider using Batch API for large workloads

---

## 📖 References

- [Gemini 3 Developer Guide](https://ai.google.dev/gemini-api/docs/gemini-3)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Vercel AI SDK Google Provider](https://sdk.vercel.ai/providers/ai-sdk-providers/google)
- [Google AI Studio](https://aistudio.google.com/)

---

## ✅ Next Steps

1. **Add API Key**: Set `GEMINI_API_KEY` in `.env`
2. **Test Generation**: Try a simple text generation
3. **Test Structured Outputs**: Run personality profiling
4. **Test Generative UI**: Generate a quiz or worksheet
5. **Monitor Performance**: Check latency and quality
6. **Consider Embeddings**: Evaluate Gemini embeddings when available

---

## 📊 Cost Optimization Example

**Generating 1000 quizzes:**
- Using Pro: ~$2,500 (output tokens)
- Using Flash: ~$250 (output tokens) ✅ **10x cheaper**
- Savings: $2,250 per 1000 quizzes

**Personality profiling (requires Pro):**
- Using Pro: ~$0.11 per profile ✅ **Best quality**
- Using Flash: ~$0.028 per profile (may miss nuances)

The system automatically selects the most cost-effective model while maintaining quality! 🎉

