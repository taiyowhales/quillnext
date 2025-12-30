"use client";

import { useEffect, useState } from "react";
import { useStudentProfile } from "@/components/providers/StudentProfileProvider";
import { getStudentAssignments } from "@/app/actions/student";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, FileText, CheckCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getStudentAvatarUrl } from "@/lib/utils";
import { AvatarCustomizer } from "@/components/profile/AvatarCustomizer";
import { Pencil, Users } from "lucide-react";
import { DiscipleshipDashboard } from "@/components/family-discipleship/DiscipleshipDashboard";

interface StudentDashboardProps {
    student: any;
}

export function StudentDashboard({ student }: StudentDashboardProps) {
    const { setActiveStudentId } = useStudentProfile();
    const [data, setData] = useState<{ assignments: any[]; courseEnrollments: any[] }>({ assignments: [], courseEnrollments: [] });
    const [loading, setLoading] = useState(true);
    const [customizerOpen, setCustomizerOpen] = useState(false);
    const [avatarConfig, setAvatarConfig] = useState(student.avatarConfig);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const result = await getStudentAssignments(student.id);
            setData(result);
            setLoading(false);
        }
        loadData();
    }, [student.id]);

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative group/avatar">
                        <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-qc-parchment-crumpled flex items-center justify-center text-qc-primary">
                            <Avatar className="h-full w-full">
                                <AvatarImage
                                    src={getStudentAvatarUrl(student.preferredName || student.firstName, avatarConfig)}
                                    alt={student.preferredName || student.firstName}
                                    referrerPolicy="no-referrer"
                                />
                                <AvatarFallback className="text-3xl font-bold bg-qc-parchment-crumpled text-qc-primary">
                                    {student.preferredName?.[0] || student.firstName[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                            onClick={() => setCustomizerOpen(true)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                    <div>
                        <h1 className="font-display text-4xl font-bold text-qc-charcoal">
                            {student.preferredName || student.firstName}'s Dashboard
                        </h1>
                        <p className="font-body text-lg text-qc-text-muted">
                            Let's see what we're learning today!
                        </p>
                    </div>
                </div>
                <Button variant="secondary" onClick={() => setActiveStudentId(null)} className="gap-2 self-start">
                    <ArrowLeft className="w-4 h-4" /> Switch Profile
                </Button>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qc-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Courses Section */}
                    <div className="space-y-6">
                        <h2 className="font-display text-2xl font-bold text-qc-charcoal flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-qc-primary" />
                            My Courses
                        </h2>

                        {data.courseEnrollments.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-qc-text-muted">
                                    <p>You haven't been enrolled in any courses yet.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {data.courseEnrollments.map((enrollment) => (
                                    <Link key={enrollment.courseId} href={`/courses/${enrollment.courseId}/learn`} className="block group">
                                        <Card className="transition-all duration-300 group-hover:shadow-md group-hover:border-qc-primary/50">
                                            <CardContent className="p-5 flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-display text-xl font-bold text-qc-charcoal group-hover:text-qc-primary transition-colors">
                                                        {enrollment.course.title}
                                                    </h3>
                                                    <p className="text-sm text-qc-text-muted mb-2">{enrollment.course.subject?.name}</p>
                                                    <div className="flex gap-2">
                                                        <Badge variant={enrollment.status === 'COMPLETED' ? 'secondary' : 'default'}>
                                                            {enrollment.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-qc-parchment group-hover:bg-qc-primary group-hover:text-white transition-colors">
                                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Assignments Section */}
                    <div className="space-y-6">
                        <h2 className="font-display text-2xl font-bold text-qc-charcoal flex items-center gap-2">
                            <FileText className="w-6 h-6 text-qc-primary" />
                            Assignments & Resources
                        </h2>

                        {data.assignments.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-qc-text-muted">
                                    <p>No individual assignments right now.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {data.assignments.map((assignment) => (
                                    <Card key={assignment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardContent className="p-5">
                                            <div className="flex gap-4">
                                                <div className="h-12 w-12 rounded-qc-md bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-display text-lg font-bold text-qc-charcoal">
                                                        {assignment.resource.title}
                                                    </h3>
                                                    <p className="text-sm text-qc-text-muted">
                                                        {assignment.resource.resourceKind?.label || "Resource"}
                                                    </p>
                                                    {assignment.notes && (
                                                        <p className="text-sm text-qc-text-muted mt-2 italic">
                                                            "{assignment.notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-end">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={`/resources/${assignment.resourceId}`}>Open Resource</Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Family Discipleship Section */}
            {!loading && (
                <div className="mt-12 space-y-6">
                    <h2 className="font-display text-2xl font-bold text-qc-charcoal flex items-center gap-2">
                        <Users className="w-6 h-6 text-qc-primary" />
                        Family Discipleship
                    </h2>
                    <DiscipleshipDashboard studentId={student.id} />
                </div>
            )}

            <AvatarCustomizer
                open={customizerOpen}
                onOpenChange={setCustomizerOpen}
                studentId={student.id}
                initialName={student.preferredName || student.firstName}
                initialConfig={avatarConfig}
                onSave={setAvatarConfig}
            />
        </div>
    );
}
