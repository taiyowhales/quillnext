import React from 'react';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BibleStudyClient from "./BibleStudyClient";

export default async function BibleStudyPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/api/auth/signin?callbackUrl=/family-discipleship/bible-study");
    }

    return (
        <div className="min-h-screen bg-qc-parchment/30 pb-20">
            <BibleStudyClient />
        </div>
    );
}
