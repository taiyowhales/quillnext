"use server";

import { streamUI } from "ai/rsc";
import { getModelForTaskWithVideoCheck, AITaskType } from "@/lib/ai/config";
import { z } from "zod";
import { buildCompletePrompt } from "@/lib/utils/prompt-builder";

/**
 * Generative UI Server Action
 * Streams React Components instead of plain text
 * 
 * This replaces the old text-streaming approach with interactive components
 */
export async function generateLearningTool(
  params: {
    toolType: string;
    userPrompt: string;
    studentId?: string;
    objectiveId?: string;
    organizationId: string;
  },
) {
  const { toolType, userPrompt, studentId, objectiveId, organizationId } = params;

  // Build context-aware prompt
  const fullPrompt = await buildCompletePrompt({
    objectiveId,
    studentId,
    organizationId,
    userInstruction: userPrompt,
  });

  // Determine task type based on toolType
  const taskType = getTaskTypeFromToolType(toolType);
  
  // Check if user prompt contains YouTube URLs (requires Gemini 3 Pro)
  // Automatically upgrade to Gemini 3 Pro if videos are detected
  const model = getModelForTaskWithVideoCheck(taskType, userPrompt);
  
  // Stream UI with tools
  const result = await streamUI({
    model,
    prompt: fullPrompt,
    text: ({ content }) => (
      <div className="prose prose-sm max-w-none">
        <p>{content}</p>
      </div>
    ),
    tools: {
      generateQuiz: {
        description: "Generate an interactive quiz for the student",
        parameters: z.object({
          title: z.string(),
          questions: z.array(
            z.object({
              question: z.string(),
              options: z.array(z.string()),
              correctAnswer: z.string(),
              explanation: z.string().optional(),
            }),
          ),
        }),
        generate: async function* (quizData) {
          // 1. Yield a loading state specific to this tool
          yield (
            <div className="flex items-center gap-2 p-4 bg-qc-warm-stone rounded-qc-md">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-qc-border-subtle border-t-qc-primary"></div>
              <span className="font-body text-qc-text-muted">Building quiz...</span>
            </div>
          );

          // 2. (Optional) Save to DB here
          // await saveQuizToDatabase(quizData);

          // 3. Yield the final interactive component
          // Note: QuizCard would be a client component
          return (
            <div className="rounded-qc-lg bg-white p-6 shadow-[0_10px_30px_rgba(10,8,6,0.12)] border border-qc-border-subtle/50">
              <h3 className="font-display text-2xl font-bold text-qc-charcoal mb-4">
                {quizData.title}
              </h3>
              <div className="space-y-4">
                {quizData.questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-qc-parchment rounded-qc-md">
                    <p className="font-body font-semibold text-qc-text-primary mb-2">
                      {idx + 1}. {q.question}
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      {q.options.map((opt, optIdx) => (
                        <li key={optIdx} className="font-body text-qc-text-muted">
                          {opt}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && (
                      <p className="mt-2 text-sm font-body text-qc-text-secondary italic">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        },
      },
      generateWorksheet: {
        description: "Generate a practice worksheet",
        parameters: z.object({
          title: z.string(),
          instructions: z.string(),
          problems: z.array(
            z.object({
              problem: z.string(),
              type: z.enum(["math", "reading", "writing", "science", "other"]),
            }),
          ),
        }),
        generate: async function* (worksheetData) {
          yield (
            <div className="flex items-center gap-2 p-4 bg-qc-warm-stone rounded-qc-md">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-qc-border-subtle border-t-qc-primary"></div>
              <span className="font-body text-qc-text-muted">Creating worksheet...</span>
            </div>
          );

          return (
            <div className="rounded-qc-lg bg-white p-6 shadow-[0_10px_30px_rgba(10,8,6,0.12)] border border-qc-border-subtle/50">
              <h3 className="font-display text-2xl font-bold text-qc-charcoal mb-2">
                {worksheetData.title}
              </h3>
              <p className="font-body text-qc-text-muted mb-4">{worksheetData.instructions}</p>
              <div className="space-y-3">
                {worksheetData.problems.map((problem, idx) => (
                  <div key={idx} className="p-3 bg-qc-parchment rounded-qc-md">
                    <p className="font-body text-qc-text-primary">{problem.problem}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        },
      },
    },
  });

  return result;
}

/**
 * Map tool type to AI task type for model selection
 */
function getTaskTypeFromToolType(toolType: string): AITaskType {
  const toolTypeMap: Record<string, AITaskType> = {
    quiz: AITaskType.QUIZ_GENERATION,
    "interactive-quiz": AITaskType.QUIZ_GENERATION,
    worksheet: AITaskType.WORKSHEET_GENERATION,
    "lesson-plan": AITaskType.LESSON_PLAN_GENERATION,
    rubric: AITaskType.RUBRIC_GENERATION,
    "unit-plan": AITaskType.COURSE_STRUCTURE_DESIGN,
    syllabus: AITaskType.COURSE_STRUCTURE_DESIGN,
    "academic-content": AITaskType.CONTENT_GENERATION,
    summarizer: AITaskType.TEXT_SUMMARIZATION,
    "text-leveler": AITaskType.TEXT_LEVELING,
    proofreader: AITaskType.PROOFREADING,
    "writing-feedback": AITaskType.CONTENT_GENERATION,
    "real-world": AITaskType.CONTENT_GENERATION,
    "make-relevant": AITaskType.CONTENT_GENERATION,
    "writing-assignment": AITaskType.CONTENT_GENERATION,
    "writing-rubric": AITaskType.RUBRIC_GENERATION,
    transcript: AITaskType.TEXT_TRANSFORMATION,
  };

  return toolTypeMap[toolType] || AITaskType.CONTENT_GENERATION;
}

