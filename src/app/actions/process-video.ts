"use server";

import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";
import { VideoProcessor } from "@/server/services/video-processor";
import { revalidatePath } from "next/cache";

export async function processVideoResource(youtubeUrl: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const { organizationId } = await getCurrentUserOrg();
    if (!organizationId) throw new Error("No organization found");

    try {
        const result = await VideoProcessor.processYouTubeVideo(
            youtubeUrl,
            organizationId,
            session.user.id!
        );

        revalidatePath("/living-library");
        return result;

    } catch (error: any) {
        console.error("Action failed:", error);
        return {
            success: false,
            error: error.message || "Processing failed"
        };
    }
}
