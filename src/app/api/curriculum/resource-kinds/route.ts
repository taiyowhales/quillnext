import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET() {
    try {
        const kinds = await db.resourceKind.findMany({
            include: {
                subject: {
                    select: { name: true }
                }
            },
            orderBy: { label: "asc" }
        });

        return NextResponse.json({ kinds });
    } catch (error) {
        console.error("Failed to fetch resource kinds:", error);
        return NextResponse.json({ error: "Failed to fetch resource kinds" }, { status: 500 });
    }
}
