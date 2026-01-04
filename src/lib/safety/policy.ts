import { SafetyAssessment, SafetyResolution } from "./types";

/**
 * Deterministic Policy Decision Matrix
 * Maps an Assessment to a Resolution.
 * 
 * CORE PRINCIPLE:
 * "Minimum Social Responsibility" - We only notify when it plausibly reduces harm.
 * If a caregiver is implicated or disclosure risk is high, we NEVER notify.
 */
export function decideSafetyResolution(assessment: SafetyAssessment): SafetyResolution {
    // 1. HARD STOPS (Highest Precedence)
    // If caregiver is implicated OR child fears retaliation, do not notify.
    if (assessment.implicatedCaregiver || assessment.disclosureRisk === "HIGH") {
        if (assessment.severity === "DANGER" || assessment.severity === "TIER_1") {
            return "SUPPORTIVE_ONLY"; // Bot offers help lines but keeps secret
        }
        if (assessment.severity === "CONCERN" || assessment.severity === "TIER_2" || assessment.severity === "TIER_3") {
            return "STUDENT_OPTIONAL_OUTREACH"; // Bot suggests talking to someone safe
        }
        return "INTERNAL_LOG_ONLY";
    }

    // 2. MUST-NOTIFY DANGER CASES (Urgent)
    // Clear danger to self or others
    if (assessment.severity === "DANGER") {
        return "PARENT_SUMMARY_URGENT";
    }

    // Plan/Action regarding Self-Harm or Violence
    if (["PLAN", "ACTION", "VICTIM_DISCLOSURE"].includes(assessment.evidenceLevel) &&
        ["SELF", "OTHER_CHILD"].includes(assessment.target) &&
        ["TIER_1", "TIER_2"].includes(assessment.severity) &&
        ["SELF_HARM", "VIOLENCE"].includes(assessment.category)) {
        return "PARENT_SUMMARY_URGENT";
    }

    // 3. SIBLING / INCEST BOUNDARIES
    const isSiblingContext = ["SIBLING", "STEP_SIBLING"].includes(assessment.relationshipToTarget);
    if (isSiblingContext) {
        // Action/Coercion -> Notify Parents (Coach tone)
        if (["ACTION", "PLAN"].includes(assessment.evidenceLevel) ||
            ["LIKELY", "CONFESSED"].includes(assessment.coercion)) {
            return "PARENT_SUMMARY_SAFETY_COACH";
        }
        // Thought-only -> Do not notify immediately (wait for pattern)
        if (assessment.evidenceLevel === "THOUGHT") {
            return "STUDENT_OPTIONAL_OUTREACH";
        }
    }

    // 4. DEFAULT MAPPINGS
    switch (assessment.severity) {
        case "SAFE":
            return "NO_ACTION";
        case "TIER_3":
            return "INTERNAL_LOG_ONLY";
        case "CONCERN":
        case "TIER_2":
            return "STUDENT_OPTIONAL_OUTREACH"; // Default for lower severity concerns
        case "TIER_1":
            // Tier 1 default is notification, but use Safety Coach tone
            return "PARENT_SUMMARY_SAFETY_COACH";
        default:
            return "INTERNAL_LOG_ONLY";
    }
}
