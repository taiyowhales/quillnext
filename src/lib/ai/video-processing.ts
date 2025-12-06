import { generateObject, generateText } from "ai";
import { models } from "./config";
import { z } from "zod";

/**
 * Video Processing Utilities
 * 
 * ⚠️ IMPORTANT: Only Gemini 3 Pro can process YouTube videos.
 * All video processing functions MUST use models.pro3
 */

/**
 * Extract and analyze YouTube video content
 * Uses Gemini 3 Pro (only model that supports YouTube video processing)
 */
export async function processYouTubeVideo(youtubeUrl: string) {
  const { text } = await generateText({
    model: models.pro3, // REQUIRED: Only Gemini 3 Pro supports YouTube
    prompt: `Analyze this YouTube video and extract key information:
    
URL: ${youtubeUrl}

Provide:
1. A detailed summary of the video content
2. Key learning points
3. Educational value assessment
4. Suggested use cases in curriculum`,
  });

  return text;
}

/**
 * Generate structured content from YouTube video
 * Creates quizzes, worksheets, or lesson plans based on video content
 */
const VideoContentSchema = z.object({
  summary: z.string().describe("Comprehensive summary of video content"),
  keyPoints: z.array(z.string()).describe("Main learning points from the video"),
  suggestedActivities: z.array(z.string()).describe("Activities that could be based on this video"),
  difficultyLevel: z.enum(["elementary", "middle", "high", "college"]).describe("Appropriate difficulty level"),
  subjectAreas: z.array(z.string()).describe("Subject areas this video covers"),
});

export type VideoContent = z.infer<typeof VideoContentSchema>;

export async function extractVideoContent(youtubeUrl: string): Promise<VideoContent> {
  const { object } = await generateObject({
    model: models.pro3, // REQUIRED: Only Gemini 3 Pro supports YouTube
    schema: VideoContentSchema,
    prompt: `Analyze this YouTube video and extract structured educational content:

URL: ${youtubeUrl}

Extract comprehensive information that can be used for curriculum planning and content generation.`,
  });

  return object;
}

/**
 * Generate quiz questions based on YouTube video content
 * Automatically uses Gemini 3 Pro for video processing
 */
export async function generateVideoQuiz(youtubeUrl: string, numQuestions = 5) {
  const { text } = await generateText({
    model: models.pro3, // REQUIRED: Only Gemini 3 Pro supports YouTube
    prompt: `Create ${numQuestions} quiz questions based on this YouTube video:

URL: ${youtubeUrl}

Generate questions that test understanding of the key concepts presented in the video.`,
  });

  return text;
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  return match ? match[1] : null;
}

