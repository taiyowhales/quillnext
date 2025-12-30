
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle, Circle } from "lucide-react"; // Or phosphor icons
import { toggleItemStatus } from "@/server/actions/scheduling";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Define simpler Types for the UI
type ScheduleItem = {
    id: string;
    status: 'PENDING' | 'COMPLETED' | 'SKIPPED' | string; // loose string to match prisma enum potentially
    courseBlock?: { title: string, course: { title: string } };
    activity?: { title: string };
};

type CustomEvent = {
    id: string;
    title: string;
    // ...
};

export function DailyScheduleList({
    date,
    items,
    events
}: {
    date: Date,
    items: ScheduleItem[],
    events: CustomEvent[]
}) {
    // Optimistic UI state could be handled here or just use router.refresh() 
    // For simplicity, let's keep local state for immediate feedback.

    // Actually, we should use a transition to revalidate.

    const [optimisticItems, setOptimisticItems] = useState(items);

    const handleToggle = async (itemId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

        // Optimistic update
        setOptimisticItems(prev => prev.map(i =>
            i.id === itemId ? { ...i, status: newStatus } : i
        ));

        try {
            await toggleItemStatus(itemId, newStatus);
            // toast.success("Updated!");
        } catch (e) {
            toast.error("Failed to update status");
            // Revert
            setOptimisticItems(prev => prev.map(i =>
                i.id === itemId ? { ...i, status: currentStatus } : i
            ));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-qc-charcoal">
                    {format(date, "EEEE, MMMM d")}
                </h2>
                <div className="text-sm text-qc-text-muted">
                    {optimisticItems.filter(i => i.status === 'COMPLETED').length} / {optimisticItems.length} Completed
                </div>
            </div>

            {/* Events */}
            {events.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-qc-text-muted uppercase tracking-wider">Events</h3>
                    {events.map(event => (
                        <div key={event.id} className="p-3 bg-amber-50 border border-amber-200 rounded-qc-md text-amber-900 font-medium">
                            {event.title}
                        </div>
                    ))}
                </div>
            )}

            {/* Checklist */}
            <div className="space-y-3">
                {optimisticItems.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        No lessons scheduled for today. Enjoy!
                    </div>
                ) : (
                    optimisticItems.map(item => {
                        const isCompleted = item.status === 'COMPLETED';
                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    "flex items-start gap-4 p-4 rounded-qc-lg border transition-all cursor-pointer group",
                                    isCompleted ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-qc-border-subtle hover:border-qc-primary/30 hover:shadow-sm"
                                )}
                                onClick={() => handleToggle(item.id, item.status)}
                            >
                                <button className={cn(
                                    "mt-0.5 w-6 h-6 flex items-center justify-center rounded-full border transition-colors",
                                    isCompleted ? "bg-green-500 border-green-500 text-white" : "border-gray-300 text-transparent group-hover:border-qc-primary"
                                )}>
                                    {isCompleted ? <CheckCircle className="w-4 h-4 fill-current" /> : <div className="w-4 h-4" />}
                                </button>
                                <div className="flex-1">
                                    <h3 className={cn(
                                        "font-display text-lg leading-tight transition-all",
                                        isCompleted ? "text-gray-500 line-through decoration-gray-300" : "text-qc-charcoal"
                                    )}>
                                        {item.courseBlock?.title || item.activity?.title || "Untitled Lesson"}
                                    </h3>
                                    <p className="text-sm text-qc-text-muted mt-1">
                                        {item.courseBlock?.course.title}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
