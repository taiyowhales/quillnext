"use server";

import { db } from "@/server/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function assignResourceToStudent(resourceId: string, studentId: string, type: 'RESOURCE' | 'COURSE' = 'RESOURCE') {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    if (type === 'COURSE') {
        // Check if already enrolled
        const existing = await db.courseStudent.findUnique({
            where: {
                courseId_studentId: {
                    courseId: resourceId,
                    studentId: studentId
                }
            }
        });

        if (!existing) {
            await db.courseStudent.create({
                data: {
                    courseId: resourceId,
                    studentId: studentId,
                    status: 'ACTIVE'
                }
            });
        }
    } else {
        // Resource Assignment
        await db.resourceAssignment.create({
            data: {
                resourceId,
                assignedByUserId: session.user.id,
                student: {
                    connect: { id: studentId }
                }
            } as any,
        });
    }

    revalidatePath("/");
    revalidatePath("/students");
    return { success: true };
}
