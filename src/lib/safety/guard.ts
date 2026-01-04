import { generateObject } from "ai";
import { models } from "@/lib/ai/config";
import { z } from "zod";
import { SafetyAssessment } from "./types";

const safetySchema = z.object({
    isSafe: z.boolean(),
    severity: z.enum(["CONCERN", "DANGER", "SAFE", "TIER_1", "TIER_2", "TIER_3"]),
    category: z.enum(["BULLYING", "SELF_HARM", "GROOMING", "VIOLENCE", "SEXUAL_CONTENT", "INCEST", "BYPASS_ATTEMPT", "OTHER", "NONE"]),
    implicatedCaregiver: z.boolean().describe("Whether a parent, guardian, or teacher is the source of the threat."),
    reasoning: z.string(),
    evidenceLevel: z.enum(["THOUGHT", "INTENT", "PLAN", "ACTION", "VICTIM_DISCLOSURE"]),
    target: z.enum(["SELF", "OTHER_CHILD", "ADULT", "UNKNOWN"]),
    relationshipToTarget: z.enum(["SIBLING", "STEP_SIBLING", "PEER", "ADULT_AUTHORITY", "ONLINE_STRANGER", "OTHER"]),
    coercion: z.enum(["NONE", "POSSIBLE", "LIKELY", "CONFESSED"]),
    ageGap: z.enum(["UNKNOWN", "SIMILAR", "OLDER_OTHER", "OLDER_SELF"]),
    disclosureRisk: z.enum(["LOW", "MEDIUM", "HIGH"]).describe("HIGH if notifying parents increases risk (fear of retaliation/shame)."),
    recommendedResolution: z.enum([
        "NO_ACTION",
        "PARENT_SUMMARY_SAFETY_COACH",
        "PARENT_SUMMARY_URGENT",
        "SUPPORTIVE_ONLY",
        "STUDENT_OPTIONAL_OUTREACH",
        "INTERNAL_LOG_ONLY"
    ]).optional()
});

type SafetyCategory = z.infer<typeof safetySchema>['category'];
type SafetySeverity = z.infer<typeof safetySchema>['severity'];

interface SafetyPattern {
    regex: RegExp[];
    category: SafetyCategory;
    severity: SafetySeverity;
    tier: number;
    label: string;
    // Optional overrides for fast-path
    evidenceLevel?: "THOUGHT" | "INTENT" | "PLAN" | "ACTION" | "VICTIM_DISCLOSURE";
}

// Redundancy: Sophisticated Regex Engine
class SafetyRegexEngine {

    private static whitelist = [
        /\b(health class|biology|education|safety lesson|history|literature|novel|book|article)\b/i,
        /\b(we studied|class|assignment|homework|project)\b/i,
        /\b(reproduction|anatomy|cell|body parts)\b/i
    ];

    // Caregiver implication + Fear detection
    private static caregiverRegex = /\b(my|step)?(mom|dad|father|mother|parent|teacher|uncle|aunt|grandpa|grandma).{0,40}(hurt|hit|beat|touch|kill|force|make me|threat|scare)\b/i;
    private static fearRegex = /\b(don'?t tell).{0,30}\b(mom|dad|parents|will hurt|kick me out|beat me|kill me)\b/i;

    private static patterns: SafetyPattern[] = [
        // 1. SELF_HARM
        {
            label: "Self-Harm Intent (Tier 1)",
            regex: [/\b(kill myself|end my life|want to die|suicide)\b/i],
            category: "SELF_HARM", severity: "TIER_1", tier: 1, evidenceLevel: "INTENT"
        },
        {
            label: "Self-Harm Behavior (Tier 2)",
            regex: [/\b(hurt myself|cut myself|cut my wrists|self harm|self-harm)\b/i],
            category: "SELF_HARM", severity: "TIER_2", tier: 2, evidenceLevel: "ACTION"
        },
        // 2. BULLYING & ABUSE
        {
            label: "Physical Abuse",
            regex: [/\b(hit me|punched me|beating me up|kicked me)\b/i],
            category: "BULLYING", severity: "TIER_1", tier: 1, evidenceLevel: "VICTIM_DISCLOSURE"
        },
        // 3. INCEST / SIBLING (Distinguish Thought vs Action)
        {
            label: "Incest/Sibling Thought",
            regex: [/\b(mom|dad|stepmom|stepdad|stepsister|stepbrother|brother|sister).{0,40}\b(crush|attracted|like|love|thinking about)\b/i],
            category: "INCEST", severity: "TIER_1", tier: 1, evidenceLevel: "THOUGHT"
        },
        {
            label: "Incest/Sibling Action",
            regex: [/\b(mom|dad|stepmom|stepdad|stepsister|stepbrother|brother|sister).{0,40}\b(spied|peeked|watched|touched|asked to touch|tried to)\b/i],
            category: "INCEST", severity: "TIER_1", tier: 1, evidenceLevel: "ACTION"
        },
        // 4. VIOLENCE
        {
            label: "Threat",
            regex: [/\b(shoot|stab|kill).{0,40}\b(them|him|her|people|school)\b/i],
            category: "VIOLENCE", severity: "TIER_1", tier: 1, evidenceLevel: "INTENT"
        }
    ];

    static isWhitelisted(text: string): boolean {
        return this.whitelist.some(re => re.test(text));
    }

    static scan(text: string): SafetyAssessment | null {
        // Negation Check
        if (/\b(not|never|don'?t want to).{0,10}\b(kill|hurt|suicide)\b/i.test(text)) {
            return null;
        }

        if (this.isWhitelisted(text)) {
            return null;
        }

        // Caregiver Implication Check
        const caregiverImplicated = this.caregiverRegex.test(text);

        // Disclosure Risk Check (Fear of reaction)
        const fearDetected = this.fearRegex.test(text);
        const disclosureRisk = (caregiverImplicated || fearDetected) ? "HIGH" : "LOW";

        for (const pattern of this.patterns) {
            for (const re of pattern.regex) {
                if (re.test(text)) {
                    // If we match a pattern, return immediately
                    return {
                        isSafe: false,
                        severity: pattern.severity,
                        category: pattern.category,
                        implicatedCaregiver: caregiverImplicated,
                        reasoning: `[Regex Guard] Matched ${pattern.label}. Caregiver implicated: ${caregiverImplicated}, Fear: ${fearDetected}`,
                        evidenceLevel: pattern.evidenceLevel || "INTENT",
                        target: "SELF", // Default assumption for regex fast-path, refined by pattern if needed
                        relationshipToTarget: "OTHER",
                        coercion: "NONE",
                        ageGap: "UNKNOWN",
                        disclosureRisk: disclosureRisk
                    };
                }
            }
        }
        return null;
    }
}

export async function assessMessageSafety(message: string): Promise<SafetyAssessment> {
    // 1. Fast Path
    const keywordResult = SafetyRegexEngine.scan(message);
    if (keywordResult) {
        return keywordResult;
    }

    // 2. Deep Path
    try {
        const { object } = await generateObject({
            model: models.flashLite,
            schema: safetySchema,
            prompt: `
             You are a sensitive child safety monitoring system.
             Analyze risk in the message based STRICTLY on the text.
             
             GOALS:
             1. Detect harm (Self-harm, bullying, violence, grooming, sexual content).
             2. Assess EVIDENCE LEVEL: Is it just a THOUGHT, an INTENT, a PLAN, or an ACTION?
             3. Assess DISCLOSURE RISK: Does the child express fear of parents knowing? (e.g. "don't tell my mom", "they will kill me").
             4. Assess TARGET: SELF, OTHER_CHILD, ADULT?
             
             CONTEXT:
             - "I have a crush on my stepsister" -> INCEST, THOUGHT, SIBLING/STEP_SIBLING.
             - "I touched my stepsister" -> INCEST, ACTION, SIBLING/STEP_SIBLING.
             - "My dad hits me" -> BULLYING/VIOLENCE, VICTIM_DISCLOSURE, IMPLICATED_CAREGIVER = TRUE.
             
             Student Message: "${message}"
             `,
        });
        return object;
    } catch (error) {
        console.error("Safety Guard Error:", error);
        return {
            isSafe: true,
            severity: "SAFE",
            category: "NONE",
            implicatedCaregiver: false,
            reasoning: "Error during scan",
            evidenceLevel: "THOUGHT",
            target: "UNKNOWN",
            relationshipToTarget: "OTHER",
            coercion: "NONE",
            ageGap: "UNKNOWN",
            disclosureRisk: "LOW"
        };
    }
}
