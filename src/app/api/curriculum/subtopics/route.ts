import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const topicId = searchParams.get("topicId");

  if (!topicId) {
    return NextResponse.json({ error: "topicId required" }, { status: 400 });
  }

  const subtopics = await db.subtopic.findMany({
    where: {
      topicId,
    },
    select: {
      id: true,
      name: true,
      code: true,
      topicId: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return NextResponse.json({ subtopics });
}

