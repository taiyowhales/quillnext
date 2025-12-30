"use client";

import { useStudentProfile } from "@/components/providers/StudentProfileProvider";
import { getStudentAvatarUrl } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Student {
    id: string;
    firstName: string;
    lastName: string | null;
    preferredName: string | null;
    avatarConfig: any;
}

interface StudentProfileSwitcherProps {
    students: Student[];
}

export function StudentProfileSwitcher({ students }: StudentProfileSwitcherProps) {
    const { setActiveStudentId } = useStudentProfile();

    return (
        <div className="flex flex-wrap justify-center gap-10 py-2">
            {students.map((student) => (
                <div
                    key={student.id}
                    className="group flex flex-col items-center gap-4 cursor-pointer"
                    onClick={() => setActiveStudentId(student.id)}
                >
                    <div className="relative h-28 w-28 rounded-full overflow-hidden ring-4 ring-white shadow-lg group-hover:ring-qc-primary/30 group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                        <Avatar className="h-full w-full">
                            <AvatarImage
                                src={getStudentAvatarUrl(student.preferredName || student.firstName, student.avatarConfig)}
                                alt={student.preferredName || student.firstName}
                                referrerPolicy="no-referrer"
                            />
                            <AvatarFallback className="text-4xl font-bold bg-qc-parchment-crumpled text-qc-primary">
                                {student.preferredName?.[0] || student.firstName[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <span className="font-display text-xl font-medium text-qc-charcoal group-hover:text-qc-primary transition-colors bg-white/50 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                        {student.preferredName || student.firstName}
                    </span>
                </div>
            ))}

            {/* Add Student Button designed as a profile */}
            <Link href="/students/new" className="group flex flex-col items-center gap-4">
                <div className="h-28 w-28 rounded-full border-2 border-dashed border-qc-text-muted/30 bg-white/30 flex items-center justify-center group-hover:border-qc-primary group-hover:bg-white transition-all duration-300 shadow-sm">
                    <span className="text-5xl text-qc-text-muted/50 font-light group-hover:text-qc-primary group-hover:scale-110 transition-transform">+</span>
                </div>
                <span className="font-display text-lg font-medium text-qc-text-muted group-hover:text-qc-primary transition-colors">
                    Add Student
                </span>
            </Link>
        </div>
    );
}
