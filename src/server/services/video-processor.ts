import "server-only";
import { db } from "@/server/db";
import {
    extractVideoContent,
    isYouTubeUrl,
    extractYouTubeVideoId
} from "@/lib/ai/video-processing";
import { generateVideoEmbedding } from "@/lib/utils/vector";

export class VideoProcessor {
    /**
     * Process a YouTube video: extract content, save to DB, generate embeddings.
     */
    static async processYouTubeVideo(youtubeUrl: string, organizationId: string, userId: string) {
        // 1. Validation
        if (!isYouTubeUrl(youtubeUrl)) {
            throw new Error("Invalid YouTube URL");
        }

        const videoId = extractYouTubeVideoId(youtubeUrl);
        if (!videoId) {
            throw new Error("Could not extract Video ID");
        }

        try {
            // 2. Check overlap logic (Idempotency)
            const existing = await db.videoResource.findFirst({
                where: {
                    youtubeVideoId: videoId,
                    organizationId
                }
            });

            if (existing && existing.extractionStatus === "EXTRACTED") {
                return { success: true, message: "Video already processed", videoId: existing.id };
            }

            // 3. Create initial record (Optimistic UI support via "EXTRACTING" status)
            const videoRecord = await db.videoResource.upsert({
                where: { youtubeVideoId: videoId },
                update: { extractionStatus: "EXTRACTING" },
                create: {
                    organizationId,
                    addedByUserId: userId,
                    youtubeUrl,
                    youtubeVideoId: videoId,
                    extractionStatus: "EXTRACTING",
                    title: "Processing...",
                }
            });

            // 4. Process with AI (Gemini)
            const content = await extractVideoContent(youtubeUrl);

            // 5. Update DB with content
            // We do this BEFORE embedding to ensure we have the text saved even if embedding fails
            await db.videoResource.update({
                where: { id: videoRecord.id },
                data: {
                    title: `Video: ${videoId}`, // Ideally the content extractor returns a title too
                    extractedSummary: content.summary,
                    extractedKeyPoints: content.keyPoints,
                    extractionStatus: "EXTRACTED",
                    extractedAt: new Date(),
                }
            });

            // 6. Generate and store embedding (Vector Search)
            // Note: generateVideoEmbedding handles the DB update for the vector column internally
            const textToEmbed = `${content.summary}\n\nKey Points:\n${content.keyPoints.join("\n")}`;
            await generateVideoEmbedding(videoRecord.id, textToEmbed);

            return { success: true, videoId: videoRecord.id };

        } catch (error) {
            console.error("VideoProcessor failed:", error);

            // Fail-safe: Mark as FAILED to prevent stuck states
            if (videoId) {
                await db.videoResource.updateMany({
                    where: { youtubeVideoId: videoId },
                    data: { extractionStatus: "FAILED" }
                });
            }

            throw error; // Re-throw to let the caller handle the UI response
        }
    }
}
