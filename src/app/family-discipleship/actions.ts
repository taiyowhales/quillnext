
'use server'

import { auth } from "@/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function createPrayerRequest(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const request = formData.get("request") as string;
    if (!request) {
        throw new Error("Request content is required");
    }

    await db.prayerJournalEntry.create({
        data: {
            userId: session.user.id,
            date: new Date(),
            title: "Prayer Request",
            content: request,
        },
    });

    revalidatePath("/family-discipleship/prayer");
}

export async function togglePrayerAnswered(id: string, currentState: boolean) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Ensure user owns the entry
    const entry = await db.prayerJournalEntry.findUnique({
        where: { id },
    });

    if (!entry || entry.userId !== session.user.id) {
        throw new Error("Unauthorized or not found");
    }

    await db.prayerJournalEntry.update({
        where: { id },
        data: { answeredAt: !currentState ? new Date() : null },
    });

    revalidatePath("/family-discipleship/prayer");
}

export async function deletePrayerRequest(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Ensure user owns the entry
    const entry = await db.prayerJournalEntry.findUnique({
        where: { id },
    });

    if (!entry || entry.userId !== session.user.id) {
        throw new Error("Unauthorized or not found");
    }

    await db.prayerJournalEntry.delete({
        where: { id },
    });

    revalidatePath("/family-discipleship/prayer");
}

export async function addMemoryVerse(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const reference = formData.get("reference") as string;
    const text = formData.get("text") as string;

    if (!reference || !text) {
        throw new Error("Reference and text are required");
    }

    await db.bibleMemory.create({
        data: {
            userId: session.user.id,
            reference,
            text,
        },
    });

    revalidatePath("/family-discipleship/bible-memory");
}

export async function deleteMemoryVerse(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const verse = await db.bibleMemory.findUnique({
        where: { id },
    });

    if (!verse || verse.userId !== session.user.id) {
        throw new Error("Unauthorized or not found");
    }

    await db.bibleMemory.delete({
        where: { id },
    });

    revalidatePath("/family-discipleship/bible-memory");
}

export async function addChurchNote(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const dateStr = formData.get("date") as string;
    const preacher = formData.get("preacher") as string;
    const passage = formData.get("passage") as string;
    const notes = formData.get("notes") as string; // Applications

    // New fields
    const keyReferences = formData.get("keyReferences") as string;
    const oneThing = formData.get("oneThing") as string;
    const servingIdeas = formData.get("servingIdeas") as string;
    const generosityReflection = formData.get("generosityReflection") as string;
    const communityPlan = formData.get("communityPlan") as string;

    // JSON fields
    const mainPointsRaw = formData.get("mainPoints") as string;
    const songsRaw = formData.get("songs") as string;

    const mainPoints = mainPointsRaw ? JSON.parse(mainPointsRaw) : [];
    const songs = songsRaw ? JSON.parse(songsRaw) : [];

    if (!dateStr) {
        throw new Error("Date is required");
    }

    await db.localChurchNotes.create({
        data: {
            userId: session.user.id,
            date: new Date(dateStr),
            preacher,
            mainPassage: passage,
            applications: notes,
            keyReferences,
            oneThing,
            servingIdeas,
            generosityReflection,
            communityPlan,
            mainPoints,
            songs
        },
    });

    revalidatePath("/family-discipleship/church");
}

export async function deleteChurchNote(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const note = await db.localChurchNotes.findUnique({
        where: { id },
    });

    if (!note || note.userId !== session.user.id) {
        throw new Error("Unauthorized or not found");
    }

    await db.localChurchNotes.delete({
        where: { id },
    });

    revalidatePath("/family-discipleship/church");
}
