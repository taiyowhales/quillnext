import "server-only";
import { db } from "@/server/db";
import { academicSpineCacheStrategy } from "@/lib/utils/prisma-cache";

export async function getLibraryVideos(organizationId: string) {
    const videos = await db.videoResource.findMany({
        where: { organizationId },
        select: {
            id: true,
            youtubeUrl: true,
            youtubeVideoId: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            durationSeconds: true,
            channelName: true,
            extractionStatus: true,
            extractedSummary: true,
            subject: {
                select: {
                    name: true,
                },
            },
            strand: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 100, // Explicit bound - pagination can be added later if needed
    });

    return videos;
}

export async function getLibrarySubjects() {
    const subjects = await db.subject.findMany({
        select: {
            id: true,
            name: true,
            code: true,
        },
        orderBy: { name: "asc" },
        cacheStrategy: academicSpineCacheStrategy,
    });
    return subjects;
}
