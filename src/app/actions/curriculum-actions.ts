"use server";

import { db } from "@/server/db";
import { z } from "zod";

// Define validation schemas inline since these are simple
const getCourseBooksSchema = z.object({
    courseId: z.string().uuid("Invalid course ID"),
});

const getBookChaptersSchema = z.object({
    bookId: z.string().uuid("Invalid book ID"),
});

const getSubtopicObjectivesSchema = z.object({
    subtopicId: z.string().uuid("Invalid subtopic ID"),
});

export async function getCourseBooks(rawData: unknown) {
    const data = getCourseBooksSchema.parse(rawData);

    const course = await db.course.findUnique({
        where: { id: data.courseId },
        select: { subjectId: true, strandId: true },
    });

    if (!course) return { books: [] };

    const books = await db.book.findMany({
        where: {
            OR: [
                { subjectId: course.subjectId },
                { strandId: course.strandId || undefined },
            ],
        },
        select: { id: true, title: true, tableOfContents: true },
        orderBy: { title: "asc" },
        take: 50, // Explicit bound - reasonable limit for course books
    });

    return { books };
}

export async function getBookChapters(rawData: unknown) {
    const data = getBookChaptersSchema.parse(rawData);

    const book = await db.book.findUnique({
        where: { id: data.bookId },
        select: { tableOfContents: true },
    });

    if (!book || !book.tableOfContents) return { chapters: [] };

    // Parse TOC. Assumes standard structure. Adjust based on actual JSON shape.
    const toc = book.tableOfContents as any[];

    const chapters = Array.isArray(toc) ? toc.map((item: any) => ({
        id: item.id || item.label,
        label: item.label || item.title || "Untitled Chapter",
    })) : [];

    return { chapters };
}

export async function getSubtopicObjectives(rawData: unknown) {
    const data = getSubtopicObjectivesSchema.parse(rawData);

    const objectives = await db.objective.findMany({
        where: { subtopicId: data.subtopicId },
        select: { id: true, text: true, code: true },
        orderBy: { sortOrder: 'asc' },
        take: 200, // Explicit bound - subtopics can have many objectives
    });

    return { objectives };
}
