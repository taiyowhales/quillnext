import { db } from "@/server/db";

export async function sendSafetyAlert(flagId: string) {
    try {
        const flag = await db.safetyFlag.findUnique({
            where: { id: flagId },
            include: {
                student: {
                    include: {
                        organization: {
                            include: {
                                users: true
                            }
                        }
                    }
                }
            }
        });

        if (!flag) {
            console.error(`[Notification] Flag not found: ${flagId}`);
            return;
        }

        // Find potential recipients (Admins/Parents in the organization)
        const recipients = flag.student.organization.users
            .filter(u => u.email && (u.role === 'OWNER' || u.role === 'PARENT' || u.role === 'ADMIN'))
            .map(u => u.email);

        let guidance = "";
        if (flag.resolution === "PARENT_SUMMARY_SAFETY_COACH") {
            guidance = "\nGUIDANCE FOR CAREGIVERS:\n" +
                "Please respond calmly, avoid shame or physical punishment.\n" +
                "Increase supervision and privacy boundaries for all children.\n" +
                "Consider consulting a pediatrician or child therapist.";
        } else if (flag.resolution === "PARENT_SUMMARY_URGENT") {
            guidance = "\nURGENT GUIDANCE:\n" +
                "If you believe there is immediate danger, contact local emergency services.\n" +
                "Respond calmly and seek professional help immediately.";
        }

        const subject = `[SAFETY SUMMARY] Concern detected for ${flag.student.firstName}`;
        const body = `
SAFETY SUMMARY
----------------------
Student: ${flag.student.firstName} ${flag.student.lastName || ''}
Category: ${flag.category}
Severity: ${flag.severity}

Our system detected a safety signal during a learning session. 
We are sharing this summary so you can check in with the student.

AI Context:
${flag.reasoning}

${guidance}

(Note: Specific message content is excluded to protect student privacy and prevent escalation).
        `;

        // PROVIDER INTEGRATION POINT
        // TODO: Replace with actual email provider call (e.g., Resend, SendGrid)
        console.log("===================================================");
        console.log(`[SIMULATION] Sending Email to: ${recipients.join(", ")}`);
        console.log(`Subject: ${subject}`);
        console.log(body);
        console.log("===================================================");

        // Update flag status
        await db.safetyFlag.update({
            where: { id: flagId },
            data: { alertSent: true }
        });

    } catch (error) {
        console.error("[Notification] Failed to send safety alert:", error);
    }
}
