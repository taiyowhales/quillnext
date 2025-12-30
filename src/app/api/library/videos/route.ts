import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { extractYouTubeVideoId, isYouTubeUrl } from "@/lib/ai/video-processing";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { organizationId } = await getCurrentUserOrg();
  if (!organizationId) {
    return NextResponse.json({ error: "User has no organization" }, { status: 400 });
  }

  const videos = await db.videoResource.findMany({
    where: { organizationId },
    include: {
      subject: true,
      strand: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ videos });
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

  if (!data.youtubeUrl) {
    return NextResponse.json({ error: "YouTube URL required" }, { status: 400 });
  }

  if (!isYouTubeUrl(data.youtubeUrl)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  const videoId = extractYouTubeVideoId(data.youtubeUrl);
  if (!videoId) {
    return NextResponse.json({ error: "Could not extract video ID" }, { status: 400 });
  }

  // Check if video already exists
  const existing = await db.videoResource.findUnique({
    where: { youtubeVideoId: videoId },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Video already exists in library" },
      { status: 400 },
    );
  }

  // Verify subject if provided
  if (data.subjectId) {
    const subject = await db.subject.findUnique({
      where: { id: data.subjectId },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 400 });
    }
  }

  // Verify strand if provided
  if (data.strandId) {
    const strand = await db.strand.findUnique({
      where: { id: data.strandId },
    });

    if (!strand || (data.subjectId && strand.subjectId !== data.subjectId)) {
      return NextResponse.json(
        { error: "Strand not found or doesn't belong to subject" },
        { status: 400 },
      );
    }
  }

  // Create video resource
  const video = await db.videoResource.create({
    data: {
      organizationId,
      addedByUserId: userId,
      youtubeUrl: data.youtubeUrl,
      youtubeVideoId: videoId,
      subjectId: data.subjectId || null,
      strandId: data.strandId || null,
      extractionStatus: "NOT_EXTRACTED",
    },
    include: {
      subject: true,
      strand: true,
    },
  });

  return NextResponse.json({ video });
}

