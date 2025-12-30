
export interface ContextSuggestion {
    type: "missing" | "enhancement" | "opportunity";
    category: "family" | "student" | "academic" | "library" | "schedule";
    title: string;
    description: string;
    impact: string;
    actionUrl: string;
    actionLabel: string;
    priority: "high" | "medium" | "low";
}

/**
 * Get impact description for adding context
 */
export function getContextImpactDescription(
    category: ContextSuggestion["category"],
): string {
    const impacts = {
        family: "All AI-generated content will align with your educational philosophy and faith background",
        student: "Content will be personalized to this student's learning style, interests, and communication preferences",
        academic: "Content will be precisely aligned with learning objectives and academic standards",
        library: "AI can reference your actual books and resources when generating content",
        schedule: "Course pacing and scheduling will automatically respect your calendar and breaks",
    };

    return impacts[category];
}
