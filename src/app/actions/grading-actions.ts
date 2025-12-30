"use server";

import { generateText } from "ai";
import { buildMasterPrompt } from "@/lib/utils/prompt-builder";
import { models } from "@/lib/ai/config";

interface GenerateFeedbackParams {
    organizationId: string;
    studentId: string;
    courseId: string;
    questionText: string;
    responseContent: string | any;
}

interface GenerateOverallFeedbackParams {
    organizationId: string;
    studentId: string;
    courseId: string;
    assessmentTitle: string;
    totalScore: number;
    maxScore: number;
}

export async function generateItemFeedback({
    organizationId,
    studentId,
    courseId,
    questionText,
    responseContent,
}: GenerateFeedbackParams) {
    try {
        const prompt = await buildMasterPrompt({
            organizationId,
            studentId,
            courseId,
            userInstruction: `Provide personalized feedback for this assessment response:

Question: ${questionText}
Student Response: ${typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent)}

Provide feedback that:
- Uses the student's preferred communication style
- Is encouraging and constructive
- Explains what was done well and what could be improved
- Suggests specific ways to improve`,
        });

        const { text } = await generateText({
            model: models.flash,
            prompt,
        });

        return { text };
    } catch (error) {
        console.error("Server Action failed: generateItemFeedback", error);
        throw new Error("Failed to generate feedback");
    }
}

export async function generateOverallFeedback({
    organizationId,
    studentId,
    courseId,
    assessmentTitle,
    totalScore,
    maxScore,
}: GenerateOverallFeedbackParams) {
    try {
        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

        const prompt = await buildMasterPrompt({
            organizationId,
            studentId,
            courseId,
            userInstruction: `Provide overall personalized feedback for this assessment:

Assessment: ${assessmentTitle}
Score: ${totalScore} / ${maxScore} (${percentage.toFixed(1)}%)

Provide overall feedback that:
- Uses the student's preferred communication style
- Celebrates strengths
- Identifies areas for improvement
- Provides encouragement and next steps
- Suggests remedial resources if needed`,
        });

        const { text } = await generateText({
            model: models.flash,
            prompt,
        });

        return { text };
    } catch (error) {
        console.error("Server Action failed: generateOverallFeedback", error);
        throw new Error("Failed to generate overall feedback");
    }
}
