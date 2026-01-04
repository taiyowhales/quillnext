export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";
import { db } from "@/server/db";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { organizationId } = await getCurrentUserOrg();
    const courseId = params.id;

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        subject: true,
        strand: true,
        gradeBand: true,
      },
    });

    if (!course || course.organizationId !== organizationId) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Failed to get course:", error);
    return NextResponse.json(
      { error: "Failed to get course" },
      { status: 500 },
    );
  }
}

