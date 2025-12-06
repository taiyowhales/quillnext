import { generateObject } from "ai";
import { getModelForTask, AITaskType } from "@/lib/ai/config";
import { z } from "zod";

/**
 * Personality Profile Schema
 * Defines the exact shape of AI-generated personality profile
 */
const PersonalityProfileSchema = z.object({
  primaryDrivers: z
    .array(z.string())
    .length(3)
    .describe("Top 3 motivators for this student (e.g., 'Autonomy', 'Physical Touch', 'Verbal Praise')"),
  communicationStyle: z
    .enum(["Direct", "Gentle", "Socratic", "Enthusiastic", "Supportive"])
    .describe("How to communicate with this student effectively"),
  suggestedSystemPrompt: z
    .string()
    .describe(
      "A 2-3 sentence instruction for an AI tutor on how to speak to this student. Include their name and specific communication preferences.",
    ),
  strengths: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe("Key learning strengths and preferences"),
  learningPreferences: z
    .object({
      pace: z.enum(["fast", "moderate", "slow"]),
      structure: z.enum(["high", "moderate", "low"]),
      collaboration: z.enum(["independent", "paired", "group"]),
    })
    .describe("Learning environment preferences"),
  encouragementStyle: z
    .enum(["growth_praise", "specific_feedback", "enthusiastic_cheer", "normalize_mistakes"])
    .describe("Best way to encourage this student"),
});

export type PersonalityProfile = z.infer<typeof PersonalityProfileSchema>;

/**
 * Generate student personality profile from questionnaire answers
 * Uses AI semantic analysis instead of hardcoded scoring
 */
export async function generateStudentProfile(
  answers: Record<string, string>,
  studentName: string,
): Promise<PersonalityProfile> {
  // Format answers for prompt
  const answersText = Object.entries(answers)
    .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
    .join("\n\n");

  const { object } = await generateObject({
    model: getModelForTask(AITaskType.PERSONALITY_PROFILING),
    schema: PersonalityProfileSchema,
    prompt: `Analyze these questionnaire answers for ${studentName} and build a comprehensive learning profile.

Questionnaire Answers:
${answersText}

Create a detailed profile that will help personalize all educational content, AI interactions, and learning materials for this student. Be specific and actionable.`,
  });

  return object;
}

/**
 * Generate learning style profile
 * Separate from personality but related
 */
const LearningStyleSchema = z.object({
  primaryStyle: z.enum(["visual", "auditory", "kinesthetic", "reading", "multimodal"]),
  secondaryStyle: z.enum(["visual", "auditory", "kinesthetic", "reading", "multimodal"]).optional(),
  preferredActivities: z.array(z.string()).describe("Types of activities this student enjoys"),
  attentionSpan: z.enum(["short", "medium", "long"]).describe("Typical attention span"),
  studyRecommendations: z.array(z.string()).describe("Specific study strategies for this student"),
});

export type LearningStyleProfile = z.infer<typeof LearningStyleSchema>;

export async function generateLearningStyleProfile(
  answers: Record<string, string>,
  studentName: string,
): Promise<LearningStyleProfile> {
  const answersText = Object.entries(answers)
    .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
    .join("\n\n");

  const { object } = await generateObject({
    model: getModelForTask(AITaskType.LEARNING_STYLE_ANALYSIS),
    schema: LearningStyleSchema,
    prompt: `Analyze these learning style questionnaire answers for ${studentName}:

${answersText}

Determine their learning style preferences and provide actionable recommendations.`,
  });

  return object;
}

