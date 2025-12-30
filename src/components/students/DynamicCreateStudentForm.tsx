"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const DynamicCreateStudentForm = dynamic(
    () => import("@/components/students/CreateStudentForm").then((mod) => mod.CreateStudentForm),
    {
        ssr: false,
        loading: () => (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-qc-primary" />
            </div>
        ),
    }
);
