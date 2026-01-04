
import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const start = performance.now();

        // Simple query to validate connection
        // queryRaw is used to bypass some Prisma query processing overhead for a raw "ping"
        await db.$queryRaw`SELECT 1`;

        const duration = performance.now() - start;

        // Warn if latency is high, but still return healthy (200)
        const status = duration > 1000 ? "degraded" : "healthy";

        return NextResponse.json(
            {
                status,
                latency_ms: Math.round(duration),
                provider: "accelerate", // Context for debugging
                timestamp: new Date().toISOString()
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[Health Check Failed]", error);

        return NextResponse.json(
            {
                status: "unhealthy",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString()
            },
            { status: 503 }
        );
    }
}
