---
alwaysApply: false
---
## 🔧 Configuration

### Environment Variables

Add to your `.env` file:

```env
# Gemini API Key (required)
GEMINI_API_KEY="your-gemini-api-key"
```

### Get Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

---

## 🎯 Model Selection Matrix

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

#### Gemini 3 Pro
- **Context:** 1M input / 64k output tokens
- **Best For:** Most advanced reasoning, complex multi-step analysis, **YouTube video processing**
- **When to Use:** 
  - Highest quality personality profiling, learning analysis, complex content
  - **⚠️ REQUIRED for any Course Builder tasks with YouTube video links**
  - Video analysis and video-based content generation
- **Pricing:** $2/$12 per 1M tokens
- **Knowledge Cutoff:** January 2025
- **⚠️ Critical Capability:** Only model that can process YouTube videos

#### Gemini 2.5 Pro
- **Context:** 1M input / 64k output tokens
- **Best For:** Complex reasoning, multi-step analysis (cost-effective alternative)
- **When to Use:** Complex tasks when budget is a concern
- **Pricing:** $1.25/$10 per 1M tokens

#### Gemini 2.5 Flash
- **Context:** 1M input / 64k output tokens
- **Best For:** Fast, moderate complexity tasks
- **When to Use:** Most content generation (90% of tasks)
- **Pricing:** $0.30/$2.50 per 1M tokens

#### Gemini 2.5 Flash-Lite
- **Context:** 1M input / 64k output tokens
- **Best For:** Simple, high-volume tasks
- **When to Use:** Text transformations, summaries, basic Q&A
- **Pricing:** $0.10/$0.40 per 1M tokens

Reference: [Gemini 3 Models](https://ai.google.dev/gemini-api/docs/gemini-3#meet-gemini-3)

---

## 📝 Embeddings

### Gemini Embeddings Model

**Model:** `gemini-embedding-001`

**Specifications:**
- **Input token limit:** 2,048 tokens
- **Output dimensions:** Flexible (128 - 3072)
  - **Recommended:** 768, 1536, 3072
  - **Default:** 3072 (normalized)
- **Supported data types:** Text input → Text embeddings
- **Use cases:** RAG, semantic search, classification, clustering, anomaly detection

**Reference:** [Gemini Embeddings Documentation](https://ai.google.dev/gemini-api/docs/embeddings)

### Configuration

**Output Dimensionality Options:**
- **768** - Good balance (MTEB: 67.99)
- **1536** - Recommended for most use cases (MTEB: 68.17)
- **3072** - Maximum quality, normalized by default (MTEB: 68.16)

**Normalization:**
- Dimensions 3072 are normalized by default
- For dimensions < 3072, normalize embeddings:
  ```typescript
  import { norm } from 'ml-matrix';
  const normalized = embedding / norm(embedding);
  ```

### Gemini Embeddings Usage

**Basic Example:**
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
const response = await ai.models.embedContent({
  model: 'gemini-embedding-001',
  contents: 'What is the meaning of life?',
  config: {
    outputDimensionality: 1536, // Recommended dimension
    taskType: 'SEMANTIC_SIMILARITY', // Optimize for similarity search
  },
});
const embedding = response.embeddings[0].values;
```

**Batch Embeddings:**
```typescript
const response = await ai.models.embedContent({
  model: 'gemini-embedding-001',
  contents: [
    'What is the meaning of life?',
    'What is the purpose of existence?',
    'How do I bake a cake?'
  ],
  config: {
    outputDimensionality: 1536,
    taskType: 'RETRIEVAL_DOCUMENT', // For RAG/document search
  },
});
```

**Task Types** (optimize embeddings for specific use cases):
- `SEMANTIC_SIMILARITY` - Similarity comparison
- `RETRIEVAL_DOCUMENT` - Document search/RAG
- `RETRIEVAL_QUERY` - Query embeddings for search
- `CLASSIFICATION` - Text classification
- `CLUSTERING` - Clustering tasks

**Batch API** (for higher throughput):
- 50% cheaper than interactive embeddings
- Use when latency is not a concern
- Reference: [Batch API Documentation](https://ai.google.dev/gemini-api/docs/batch)

### Cost Optimization

**Gemini Embeddings:**
- Interactive: Standard pricing
- Batch API: 50% discount for high-throughput workloads

**Benefits:**
- Unified API provider (all AI services from Google)
- Flexible dimensionality (optimize for your use case)
- Task-specific optimization (better accuracy)
- Batch API for cost savings on large workloads

---

## 🚀 Usage Examples

### Structured Outputs (Personality Profiling)

```typescript
import { generateStudentProfile } from "@/server/ai/personality";

const profile = await generateStudentProfile(answers, "John");
// Automatically uses Gemini 3 Pro (AITaskType.PERSONALITY_PROFILING)
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

### Adding New Tasks

1. Add to `AITaskType` enum in `src/lib/ai/config.ts`
2. Map to appropriate model in `taskModelMap`
3. Use `getModelForTask()` in your code

**Important:** If your task involves YouTube video processing, it **must** use Gemini 3 Pro (only model that supports this capability).

---

## 📚 Key Benefits

1. **Cost Optimization**: Automatic model selection saves 10x on most tasks
2. **Performance**: Flash models provide fast responses for most use cases
3. **Quality**: Pro models for complex tasks requiring deep reasoning
4. **Flexibility**: Easy to adjust model selection per task
5. **Large Context**: All models support 1M token input window
6. **Multimodal**: Supports text, images, video (ready for future features)
7. **Video Processing**: Gemini 3 Pro is the only model that processes YouTube videos

## 💰 Quality vs. Cost Trade-offs

### Use Gemini 3 Pro When:
- ✅ Output quality is absolutely critical
- ✅ Task requires most advanced reasoning
- ✅ Complex multi-step analysis needed
- ✅ Nuanced understanding is essential
- ✅ Budget allows for premium model
- ✅ **YouTube video processing is required** (only model that supports this)

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
- [Gemini Embeddings Documentation](https://ai.google.dev/gemini-api/docs/embeddings)
- [Vercel AI SDK Google Provider](https://sdk.vercel.ai/providers/ai-sdk-providers/google)
- [Google AI Studio](https://aistudio.google.com/)
- [Model Selection Guide](./src/lib/ai/model-selection.md)
- [Configuration File](./src/lib/ai/config.ts)

---

## ✅ Getting Started

1. **Add API Key**: Set `GEMINI_API_KEY` in `.env`
2. **Test Generation**: Try a simple text generation
3. **Test Structured Outputs**: Run personality profiling
4. **Test Generative UI**: Generate a quiz or worksheet
5. **Monitor Performance**: Check latency and quality
6. **Configure Embeddings** (if needed):
   - Update `src/lib/utils/vector.ts` to use `gemini-embedding-001`
   - Choose appropriate dimensionality (768, 1536, or 3072)
   - Select task type based on use case (RAG, similarity, etc.)
   - Normalize embeddings if using dimensions < 3072

---

## 📊 Cost Optimization Examples

### Example: Generating 1,000 Quizzes

- **Using Gemini 3 Pro:** ~$2,500 (output tokens)
- **Using Gemini 2.5 Pro:** ~$2,000 (output tokens)
- **Using Flash:** ~$250 (output tokens) ✅ **10x cheaper**
- **Savings:** $2,250 per 1,000 quizzes (90% reduction)

### Example: Personality Profiling (100 students)

- **Using Gemini 3 Pro:** ~$1.20 (highest quality) ✅ **Default**
- **Using Gemini 2.5 Pro:** ~$1.10 (high quality, cost-effective)
- **Using Flash:** ~$0.28 (may miss nuances)
- **Trade-off:** Quality vs. cost (Gemini 3 Pro recommended for best accuracy)

The system automatically selects the most cost-effective model while maintaining quality! 🎉

## 📈 Monitoring & Optimization

### Track Usage
- Monitor token usage per model
- Track costs per task type
- Identify opportunities to downgrade/upgrade models

### Adjustments
- If Flash quality is insufficient → Upgrade to Pro
- If Pro is overkill → Downgrade to Flash
- Test Flash-Lite for simple tasks to save costs
- Monitor video processing tasks (must use Gemini 3 Pro)

