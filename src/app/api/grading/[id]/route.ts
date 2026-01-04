export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";
import { db } from "@/server/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, organizationId } = await getCurrentUserOrg();
  const data = await request.json();

  const attempt = await db.assessmentAttempt.findUnique({
    where: { id },
    include: {
      assessment: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!attempt || attempt.assessment.course.organizationId !== organizationId) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  // Update attempt
  await db.assessmentAttempt.update({
    where: { id },
    data: {
      scorePoints: data.scorePoints,
      maxPoints: data.maxPoints,
      feedback: data.feedback,
      gradingMethod: data.gradingMethod || "AI_ASSISTED",
      graderUserId: userId,
      status: "GRADED",
      completedAt: new Date(),
    },
  });

  // Update item responses
  if (data.itemScores) {
    for (const [itemId, score] of Object.entries(data.itemScores)) {
      const response = await db.assessmentItemResponse.findFirst({
        where: {
          attemptId: id,
          itemId,
        },
      });

      if (response) {
        await db.assessmentItemResponse.update({
          where: { id: response.id },
          data: {
            pointsEarned: Number(score),
            feedback: data.itemFeedback?.[itemId] || null,
            gradedAt: new Date(),
          },
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}

