import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const strandId = searchParams.get("strandId");

  if (!strandId) {
    return NextResponse.json({ error: "strandId required" }, { status: 400 });
  }

  const topics = await db.topic.findMany({
    where: {
      strandId,
    },
    select: {
      id: true,
      name: true,
      code: true,
      strandId: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return NextResponse.json({ topics });
}

