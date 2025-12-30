import { experimental_generateImage as generateImage } from "ai";
import { models } from "@/lib/ai/config";

/**
 * Service to generate images using "Nano Banana" (Google Imagen 3)
 */
export async function generateNanoBananaImage(prompt: string, aspectRatio: "1:1" | "16:9" | "4:3" = "1:1") {
    try {
        const { image } = await generateImage({
            model: models.imagen as any,
            prompt: prompt,
            aspectRatio: aspectRatio,
        });

        // Convert the base64 output to a specialized markdown image syntax or data URL
        // Note: In a real app we'd upload this to blob storage (R2/S3). 
        // For this implementation, we'll return the base64 data URL directly if supported,
        // or just the base64 string.

        return image.base64;
    } catch (error) {
        console.error("Nano Banana Generation Failed:", error);
        return null;
    }
}
