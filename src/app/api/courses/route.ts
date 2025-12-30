import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";
import { db } from "@/server/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { organizationId, userId } = await getCurrentUserOrg();
  if (!organizationId) {
    return NextResponse.json({ error: "User has no organization" }, { status: 400 });
  }

  const data = await request.json();

  if (!data.subjectId) {
    return NextResponse.json({ error: "Subject ID required" }, { status: 400 });
  }

  // Handle Subject
  let subjectId = data.subjectId;
  let subject;

  if (subjectId.startsWith("new:")) {
    // Create new Subject
    const name = subjectId.replace("new:", "");
    // Simple code generation
    const code = name.slice(0, 3).toUpperCase() + "-" + Date.now().toString().slice(-4);

    subject = await db.subject.create({
      data: {
        name,
        code,
        sortOrder: 999,
      }
    });
    subjectId = subject.id;
  } else {
    // Verify existing subject
    subject = await db.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 400 });
    }
  }

  // Handle Strand
  let strandId = data.strandId;
  if (strandId && strandId.startsWith("new:")) {
    const name = strandId.replace("new:", "");
    const code = subject.code + "." + name.slice(0, 3).toUpperCase() + "-" + Date.now().toString().slice(-4);

    const strand = await db.strand.create({
      data: {
        name,
        code,
        subjectId,
        sortOrder: 999
      }
    });
    strandId = strand.id;
  } else if (strandId) {
    const strand = await db.strand.findUnique({
      where: { id: strandId },
    });
    if (!strand || strand.subjectId !== subjectId) {
      // If subject was just created, existing strand def won't belong to it (unless valid case? unlikely)
      return NextResponse.json(
        { error: "Strand not found or doesn't belong to subject" },
        { status: 400 },
      );
    }
  }

  // Verify grade band if provided
  if (data.gradeBandId) {
    const gradeBand = await db.gradeBand.findUnique({
      where: { id: data.gradeBandId },
    });

    if (!gradeBand) {
      return NextResponse.json({ error: "Grade band not found" }, { status: 400 });
    }
  }

  const course = await db.course.create({
    data: {
      organizationId,
      createdByUserId: userId,
      subjectId: subjectId,
      strandId: strandId ? strandId : undefined,
      gradeBandId: data.gradeBandId ? data.gradeBandId : undefined,
      title: data.title,
      description: data.description,
    },
    include: {
      subject: true,
      strand: true,
      gradeBand: true,
    },
  });

  return NextResponse.json({ course });
}

