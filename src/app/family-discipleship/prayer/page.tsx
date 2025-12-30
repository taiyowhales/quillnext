import React from 'react';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PrayerJournalClient from "./PrayerJournalClient";
import { getPrayerEntries, getPrayerCategories } from "@/server/actions/prayer-journal";

export default async function PrayerJournalPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    // Fetch data in parallel
    const [entries, categories] = await Promise.all([
        getPrayerEntries(),
        getPrayerCategories()
    ]);

    return (
        <div className="container py-6 h-full">
            <PrayerJournalClient
                initialEntries={entries}
                initialCategories={categories}
            />
        </div>
    );
}
