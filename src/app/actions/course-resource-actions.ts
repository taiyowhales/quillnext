"use server";

import { db as prisma } from "@/server/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";

const attachBookSchema = z.object({
    blockId: z.string().uuid(),
    bookId: z.string().uuid(),
    courseId: z.string().uuid(),
});

const attachVideoSchema = z.object({
    blockId: z.string().uuid(),
    videoId: z.string().uuid(),
    courseId: z.string().uuid(),
});

const attachArticleSchema = z.object({
    blockId: z.string().uuid(),
    articleId: z.string().uuid(),
    courseId: z.string().uuid(),
});

const attachDocumentSchema = z.object({
    blockId: z.string().uuid(),
    documentId: z.string().uuid(),
    courseId: z.string().uuid(),
});

const detachResourceSchema = z.object({
    blockId: z.string().uuid(),
    resourceType: z.enum(["BOOK", "VIDEO", "ARTICLE", "DOCUMENT", "RESOURCE"]),
    courseId: z.string().uuid(),
});

export async function attachBookToBlock(rawData: unknown) {
    const data = attachBookSchema.parse(rawData);

    // Removed defensive try/catch - constraint violations should surface explicitly
    await prisma.courseBlock.update({
        where: { id: data.blockId },
        data: { bookId: data.bookId },
    });
    revalidatePath(`/courses/${data.courseId}/builder`);
    return { success: true };
}

export async function attachVideoToBlock(rawData: unknown) {
    const data = attachVideoSchema.parse(rawData);

    // Removed defensive try/catch
    await prisma.courseBlock.update({
        where: { id: data.blockId },
        data: { videoId: data.videoId },
    });
    revalidatePath(`/courses/${data.courseId}/builder`);
    return { success: true };
}

export async function attachArticleToBlock(rawData: unknown) {
    const data = attachArticleSchema.parse(rawData);

    await prisma.courseBlock.update({
        where: { id: data.blockId },
        data: { articleId: data.articleId },
    });
    revalidatePath(`/courses/${data.courseId}/builder`);
    return { success: true };
}

export async function attachDocumentToBlock(rawData: unknown) {
    const data = attachDocumentSchema.parse(rawData);

    await prisma.courseBlock.update({
        where: { id: data.blockId },
        data: { documentId: data.documentId },
    });
    revalidatePath(`/courses/${data.courseId}/builder`);
    return { success: true };
}

export async function detachResourceFromBlock(rawData: unknown) {
    const data = detachResourceSchema.parse(rawData);

    await prisma.courseBlock.update({
        where: { id: data.blockId },
        data: {
            bookId: data.resourceType === "BOOK" ? null : undefined,
            videoId: data.resourceType === "VIDEO" ? null : undefined,
            articleId: data.resourceType === "ARTICLE" ? null : undefined,
            documentId: data.resourceType === "DOCUMENT" ? null : undefined,
            resourceId: data.resourceType === "RESOURCE" ? null : undefined,
        },
    });
    revalidatePath(`/courses/${data.courseId}/builder`);
    return { success: true };
}

const attachResourceSchema = z.object({
    blockId: z.string().uuid(),
    resourceId: z.string().uuid(),
    courseId: z.string().uuid(),
});

export async function attachResourceToBlock(rawData: unknown) {
    const data = attachResourceSchema.parse(rawData);

    await prisma.courseBlock.update({
        where: { id: data.blockId },
        data: { resourceId: data.resourceId },
    });
    revalidatePath(`/courses/${data.courseId}/builder`);
    return { success: true };
}
