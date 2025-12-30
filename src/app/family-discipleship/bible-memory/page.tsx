import React from 'react';
import { db } from "@/server/db";
import { getLibraryVerses, getUserVerses, getStudentFolders } from './actions';
import BibleMemoryDashboard from './BibleMemoryDashboard';

export default async function BibleMemoryPage() {
    // 1. Fetch Data
    // Get the first student for demo purposes
    const student = await db.student.findFirst();
    const studentId = student?.id || "";

    if (!studentId) {
        return (
            <div className="container mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">No Student Found</h1>
                <p>Please seed the database or create a student to use this tool.</p>
            </div>
        );
    }

    const [userVerses, libraryVerses, folders] = await Promise.all([
        getUserVerses(studentId),
        getLibraryVerses(),
        getStudentFolders(studentId)
    ]);

    return (
        <div className="container mx-auto p-6">
            <BibleMemoryDashboard
                initialUserVerses={userVerses}
                libraryVerses={libraryVerses}
                studentId={studentId}
                folders={folders}
            />
        </div>
    );
}
