
import React from 'react';
import { db } from "@/server/db";
import { DevotionalDisplay } from "./DevotionalDisplay";
import { format } from "date-fns";

export default async function DevotionalsPage() {
    const today = new Date();
    const month = today.getMonth() + 1; // getMonth is 0-indexed
    const day = today.getDate();

    const devotionals = await db.devotional.findMany({
        where: {
            month: month,
            day: day,
        },
    });

    const formattedDate = format(today, "EEEE, MMMM do, yyyy");

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <DevotionalDisplay devotionals={devotionals as any} date={formattedDate} />
        </div>
    );
}
