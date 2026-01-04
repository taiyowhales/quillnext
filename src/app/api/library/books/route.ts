export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";
import { db } from "@/server/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { organizationId, userId } = await getCurrentUserOrg();
  if (!organizationId) {
    return NextResponse.json({ error: "User has no organization" }, { status: 400 });
  }

  const books = await db.book.findMany({
    where: { organizationId },
    include: {
      subject: true,
      strand: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ books });
}

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

  // Verify subject exists
  const subject = await db.subject.findUnique({
    where: { id: data.subjectId },
  });

  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 400 });
  }

  // Verify strand if provided
  if (data.strandId) {
    const strand = await db.strand.findUnique({
      where: { id: data.strandId },
    });

    if (!strand || strand.subjectId !== data.subjectId) {
      return NextResponse.json(
        { error: "Strand not found or doesn't belong to subject" },
        { status: 400 },
      );
    }
  }

  const book = await db.book.create({
    data: {
      organizationId,
      addedByUserId: userId,
      title: data.title,
      authors: data.authors || [],
      publisher: data.publisher,
      publishedDate: data.publishedDate,
      description: data.description,
      pageCount: data.pageCount,
      coverUrl: data.coverUrl,
      isbn: data.isbn,
      externalSource: data.externalSource || "MANUAL",
      externalId: data.externalId,
      subjectId: data.subjectId,
      strandId: data.strandId || null,
      extractionStatus: "NOT_EXTRACTED",
    },
    include: {
      subject: true,
      strand: true,
    },
  });

  // Generate embedding for semantic search
  if (data.description || data.title) {
    try {
      const { generateBookEmbedding } = await import("@/lib/utils/vector");
      const embeddingText = `${data.title} ${data.description || ""} ${(data.authors || []).join(" ")}`;
      await generateBookEmbedding(book.id, embeddingText);
    } catch (error) {
      console.error("Failed to generate embedding:", error);
      // Don't fail the request if embedding fails
    }
  }

  return NextResponse.json({ book });
}
