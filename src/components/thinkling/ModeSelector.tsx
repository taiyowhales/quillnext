"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GraduationCap, MagnifyingGlass, Scales, Compass } from "@phosphor-icons/react";
import { ThinklingMode } from "@/lib/thinkling";

interface ModeSelectorProps {
    selectedMode: string;
    onSelectMode: (mode: ThinklingMode) => void;
}

const MODES = [
    {
        id: "TUTOR",
        label: "Subject Tutor",
        description: "Help with specific subjects and concepts.",
        icon: GraduationCap,
        color: "text-blue-500",
        bg: "bg-blue-50"
    },
    {
        id: "RESEARCH",
        label: "Research Assistant",
        description: "Find resources and form hypotheses.",
        icon: MagnifyingGlass,
        color: "text-purple-500",
        bg: "bg-purple-50"
    },
    {
        id: "CAREER",
        label: "College & Career",
        description: "Explore future paths and requirements.",
        icon: Compass,
        color: "text-green-500",
        bg: "bg-green-50"
    }
];

export function ModeSelector({ selectedMode, onSelectMode }: ModeSelectorProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODES.map((mode) => (
                <Card
                    key={mode.id}
                    className={cn(
                        "cursor-pointer transition-all hover:shadow-md border-2 p-4 flex flex-col items-center text-center gap-3",
                        selectedMode === mode.id
                            ? "border-qc-primary ring-1 ring-qc-primary bg-qc-parchment"
                            : "border-transparent hover:border-qc-border-subtle"
                    )}
                    onClick={() => onSelectMode(mode.id as ThinklingMode)}
                >
                    <div className={cn("p-3 rounded-full", mode.bg, mode.color)}>
                        <mode.icon size={32} weight="fill" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-qc-charcoal">{mode.label}</h3>
                        <p className="text-xs text-qc-text-muted mt-1">{mode.description}</p>
                    </div>
                </Card>
            ))}
        </div>
    );
}
