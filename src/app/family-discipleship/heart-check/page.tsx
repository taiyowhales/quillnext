import React from 'react';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HeartCheckClient from "./HeartCheckClient";

export default async function HeartCheckPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/api/auth/signin?callbackUrl=/family-discipleship/heart-check");
    }

    return (
        <div className="min-h-screen bg-qc-parchment/30">
            <HeartCheckClient />
        </div>
    );
}
