"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function getStudentCatechismProgress(studentId: string, catechismId: string) {
    const progress = await db.studentCatechismProgress.findUnique({
        where: {
            studentId_catechismId: {
                studentId,
                catechismId,
            },
        },
    });

    return progress;
}

export async function updateStudentCatechismProgress(studentId: string, catechismId: string, questionIndex: number) {
    const progress = await db.studentCatechismProgress.upsert({
        where: {
            studentId_catechismId: {
                studentId,
                catechismId,
            },
        },
        update: {
            currentQuestionIndex: questionIndex,
            lastStudiedAt: new Date(),
        },
        create: {
            studentId,
            catechismId,
            currentQuestionIndex: questionIndex,
        },
    });

    revalidatePath(`/students/${studentId}/family-discipleship/catechism`);
    return progress;
}

export async function markQuestionAsMastered(studentId: string, catechismId: string, questionIdentifier: string) {
    const progress = await db.studentCatechismProgress.findUnique({
        where: { studentId_catechismId: { studentId, catechismId } }
    });

    let mastered = (progress?.masteredQuestions as string[]) || [];

    if (!mastered.includes(questionIdentifier)) {
        mastered.push(questionIdentifier);

        await db.studentCatechismProgress.upsert({
            where: { studentId_catechismId: { studentId, catechismId } },
            update: { masteredQuestions: mastered },
            create: {
                studentId,
                catechismId,
                masteredQuestions: mastered
            }
        });

        revalidatePath(`/students/${studentId}/family-discipleship/catechism`);
    }

    return mastered;
}

export async function toggleQuestionMastery(studentId: string, catechismId: string, questionIdentifier: string) {
    const progress = await db.studentCatechismProgress.findUnique({
        where: { studentId_catechismId: { studentId, catechismId } }
    });

    let mastered = (progress?.masteredQuestions as string[]) || [];

    if (mastered.includes(questionIdentifier)) {
        mastered = mastered.filter(q => q !== questionIdentifier);
    } else {
        mastered.push(questionIdentifier);
    }

    await db.studentCatechismProgress.upsert({
        where: { studentId_catechismId: { studentId, catechismId } },
        update: { masteredQuestions: mastered },
        create: {
            studentId,
            catechismId,
            masteredQuestions: mastered
        }
    });

    revalidatePath(`/students/${studentId}/family-discipleship/catechism`);
    return mastered;
}
