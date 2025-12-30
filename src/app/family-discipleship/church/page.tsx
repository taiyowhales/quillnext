
import React from 'react';
import { db } from "@/server/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChurchNotesClient } from "./ChurchNotesClient";

export default async function ChurchNotesPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const notes = await db.localChurchNotes.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            date: 'desc',
        },
    });

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <ChurchNotesClient initialNotes={notes as any} />
        </div>
    );
}
