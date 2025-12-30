
"use client";

import { format, addDays, isSameDay } from "date-fns";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { moveScheduleItem } from "@/server/actions/scheduling";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

function DraggableItem({ item }: { item: any }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        position: 'relative' as const,
        opacity: isDragging ? 0.8 : 1,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`bg-white border rounded p-2 shadow-sm text-sm group cursor-move hover:border-qc-primary/50 transition-all ${isDragging ? "shadow-xl ring-2 ring-qc-primary" : ""}`}
        >
            <div className="font-medium text-qc-charcoal truncate">
                {item.courseBlock?.title || item.activity?.title || "Untitled Activity"}
            </div>
            <div className="text-xs text-qc-text-muted truncate">
                {item.courseBlock?.course.title}
            </div>
        </div>
    );
}

function DroppableCell({ studentId, date, children }: { studentId: string, date: Date, children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${studentId}:${date.toISOString()}`,
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 p-2 border-r last:border-r-0 transition-colors min-h-[100px] ${isOver ? "bg-blue-50/50 ring-inset ring-2 ring-blue-200" : "hover:bg-slate-50"}`}
        >
            {children}
        </div>
    );
}

export function PlannerGrid({
    startDate,
    students,
    items,
    events
}: {
    startDate: Date,
    students: any[],
    items: any[],
    events: any[]
}) {
    const router = useRouter();
    const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Parse droppable ID: "studentId:dateISO"
            const [studentId, dateStr] = (over.id as string).split(":");
            const newDate = new Date(dateStr);

            // Optimistic / Server Update
            try {
                // Here we could implement optimistic UI, but for now we'll just wait for the server
                // Ideally, we'd update local state immediately.
                const result = await moveScheduleItem(active.id as string, newDate);
                if (result.success) {
                    toast.success("Item moved");
                    router.refresh();
                } else {
                    toast.error("Failed to move item");
                }
            } catch (e) {
                toast.error("Error moving item");
            }
        }
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header Row: Days */}
                <div className="flex border-b">
                    <div className="w-48 bg-gray-50 border-r p-4 shrink-0 font-medium text-gray-500">
                        Student
                    </div>
                    {days.map(day => (
                        <div key={day.toISOString()} className="flex-1 p-2 text-center border-r last:border-r-0 bg-gray-50">
                            <div className="font-display font-medium text-gray-900">{format(day, "EEEE")}</div>
                            <div className="text-sm text-gray-500">{format(day, "MMM d")}</div>
                        </div>
                    ))}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {students.map(student => (
                        <div key={student.id} className="flex border-b min-h-[150px]">
                            {/* Student Column */}
                            <div className="w-48 p-4 border-r bg-white shrink-0 sticky left-0 z-10 flex flex-col justify-center">
                                <div className="font-display font-bold text-lg text-qc-charcoal">
                                    {student.preferredName || student.firstName}
                                </div>
                            </div>

                            {/* Days Columns */}
                            {days.map(day => {
                                // Filter items for this cell
                                const dayItems = items.filter(i =>
                                    i.studentId === student.id &&
                                    isSameDay(new Date(i.date), day)
                                );

                                // Filter events (if associated with student or all)
                                const dayEvents = events.filter(e =>
                                    (e.studentId === student.id || !e.studentId) &&
                                    isSameDay(new Date(e.date), day)
                                );

                                return (
                                    <DroppableCell key={day.toISOString()} studentId={student.id} date={day}>
                                        <div className="space-y-2">
                                            {dayEvents.map(event => (
                                                <div key={event.id} className="bg-amber-100 text-amber-800 p-1.5 rounded text-xs font-medium border border-amber-200">
                                                    {event.title}
                                                </div>
                                            ))}

                                            {dayItems.map(item => (
                                                <DraggableItem key={item.id} item={item} />
                                            ))}
                                        </div>
                                    </DroppableCell>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </DndContext>
    );
}
