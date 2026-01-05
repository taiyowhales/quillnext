"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQueryState } from "nuqs";

interface StudentProfileContextType {
    activeStudentId: string | null;
    setActiveStudentId: (id: string | null) => void;
    isStudentContext: boolean;
}

const StudentProfileContext = createContext<StudentProfileContextType | undefined>(undefined);

export function StudentProfileProvider({ children }: { children: ReactNode }) {
    const [activeStudentId, setActiveStudentId] = useQueryState("studentId", { shallow: false });

    return (
        <StudentProfileContext.Provider value={{
            activeStudentId,
            setActiveStudentId,
            isStudentContext: !!activeStudentId
        }}>
            {children}
        </StudentProfileContext.Provider>
    );
}

export function useStudentProfile() {
    const context = useContext(StudentProfileContext);
    if (context === undefined) {
        throw new Error("useStudentProfile must be used within a StudentProfileProvider");
    }
    return context;
}
