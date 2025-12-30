import React from 'react';
import { DiscipleshipDashboard } from "@/components/family-discipleship/DiscipleshipDashboard";

export default async function StudentDiscipleshipPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="container mx-auto p-6">
            <DiscipleshipDashboard studentId={id} />
        </div>
    );
}
