"use server";

import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { getMasterContext } from "@/lib/context/master-context";
import { serializeMasterContext } from "@/lib/context/context-serializer";
import { models } from "@/lib/ai/config";
import { generateObject } from "ai";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

// Define strict type for the course structure we need
type CourseWithContext = Prisma.CourseGetPayload<{
    include: {
        blocks: {
            orderBy: { position: "desc" };
            take: 1;
        };
        subject: true;
        strand: true;
        gradeBand: true;
    };
}>;

export async function suggestCourseBlocks(courseId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const { organizationId } = await getCurrentUserOrg();
    if (!organizationId) throw new Error("No organization found");

    // 1. Verify course ownership & get current structure
    const course = await db.course.findUnique({
        where: { id: courseId },
        include: {
            blocks: {
                orderBy: { position: "desc" }, // Get last position
                take: 1,
            },
            subject: true,
            strand: true,
            gradeBand: true,
        },
    }) as unknown as CourseWithContext | null;

    if (!course || course.organizationId !== organizationId) {
        throw new Error("Course not found or unauthorized");
    }

    // 2. Prepare Context
    const masterContext = await getMasterContext({
        organizationId,
        courseId,
    });

    const serializedContext = serializeMasterContext(masterContext, {
        maxTokens: 4000,
        modelType: "flash",
    });

    // 3. Generate Suggestions
    const systemPrompt = `You are an expert curriculum designer.
Your task is to suggest a logical sequence of Units and Modules for this course.
Use the provided Master Context to align with the student's interests and the family's philosophy.
Ensure the structure follows the Academic Spine requirements.

Context:
${serializedContext}

Course Title: ${course.title}
Subject: ${course.subject.name}
${course.strand ? `Strand: ${course.strand.name}` : ""}
${course.gradeBand ? `Grade: ${course.gradeBand.name}` : ""}

Generate 3-5 high-quality blocks (Units or Modules).`;

    const { object } = await generateObject({
        model: models.flash,
        system: systemPrompt,
        prompt: "Generate a course structure outline.",
        schema: z.object({
            blocks: z.array(
                z.object({
                    title: z.string(),
                    kind: z.enum(["UNIT", "MODULE"]),
                    description: z.string().optional(),
                })
            ),
        }),
    });

    // 4. Save to DB
    const startPosition = (course.blocks[0]?.position ?? -1) + 1;
    const newBlocks = [];

    for (let i = 0; i < object.blocks.length; i++) {
        const suggestion = object.blocks[i];
        const block = await db.courseBlock.create({
            data: {
                courseId,
                title: suggestion.title,
                kind: suggestion.kind,
                description: suggestion.description,
                position: startPosition + i,
            },
            include: {
                activities: true, // Return empty array to match UI type
            },
        });
        newBlocks.push(block);
    }

    revalidatePath(`/courses/${courseId}/builder`);
    return { success: true, blocks: newBlocks };
}
