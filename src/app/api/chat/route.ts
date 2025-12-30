import { streamText } from "ai";
import { getContextForThinkling, ThinklingMode } from "@/lib/thinkling";
import { auth } from "@/auth";
import { models } from "@/lib/ai/config";

export const maxDuration = 30;

export async function POST(req: Request) {
    console.log("Thinkling API: Request Received");
    const session = await auth();
    console.log("Thinkling API: Session User:", session?.user?.email || "None");

    if (!session?.user) {
        console.log("Thinkling API: Unauthorized (No Session)");
        return new Response("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    console.log("Thinkling API Request MATCHED:", json);
    let { messages, studentId, mode } = json;

    console.log("Using Model:", models.flash ? "Defined" : "UNDEFINED");

    // Fallback to Query Params if not in body
    if (!studentId || !mode) {
        const url = new URL(req.url);
        if (!studentId) studentId = url.searchParams.get("studentId");
        if (!mode) mode = url.searchParams.get("mode");
    }

    if (!studentId || !mode) {
        console.error("Missing params:", { studentId, mode, json });
        return new Response(JSON.stringify({
            error: "Missing studentId or mode",
            received: json,
            params: { studentId, mode }
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { systemPrompt } = await getContextForThinkling(studentId, mode as ThinklingMode);

        // Convert messages manually to ensure cleaner payload for Google provider
        // Handle cases where 'content' is missing but 'parts' exist (from UIMessage state)
        const coreMessages = messages.map((m: any) => {
            let content = m.content;
            if (!content && m.parts && Array.isArray(m.parts)) {
                content = m.parts.map((p: any) => p.text || '').join('');
            }
            return {
                role: m.role,
                content: content || '' // Ensure it's never undefined
            };
        });

        console.log("StreamText: Starting stream configuration...");
        const result = streamText({
            model: models.flash, // Use Gemini Flash for speed and efficiency
            system: systemPrompt,
            messages: coreMessages,
        });

        // Use the method available in this SDK version (found via logs: toUIMessageStreamResponse)
        // toTextStreamResponse sends raw text, but useChat expects structured UI messages by default.
        // @ts-ignore
        return result.toDataStreamResponse ? result.toDataStreamResponse() : result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("Thinkling Error:", error);
        return new Response(JSON.stringify({
            error: "Internal Server Error",
            details: error.message || String(error),
            stack: error.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
