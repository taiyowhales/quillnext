import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StudentWithRelations } from "@/server/queries/students";

interface EnrolledCoursesProps {
    student: StudentWithRelations;
}

export function EnrolledCourses({ student }: EnrolledCoursesProps) {
    if (student.courseEnrollments.length === 0) {
        return null;
    }

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="font-display text-xl">Enrolled Courses</CardTitle>
                <CardDescription>Courses this student is currently taking</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.courseEnrollments.map((enrollment) => {
                        const progress = student.courseProgress.find(
                            (cp) => cp.courseId === enrollment.courseId,
                        );
                        return (
                            <div
                                key={enrollment.courseId}
                                className="p-4 bg-qc-warm-stone rounded-qc-md border border-qc-border-subtle hover:border-qc-primary/50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-body font-medium text-qc-charcoal mb-1">
                                            {enrollment.course.title}
                                        </p>
                                        <p className="font-body text-sm text-qc-text-muted">
                                            {enrollment.course.subject.name}
                                            {enrollment.course.strand && ` > ${enrollment.course.strand.name}`}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/courses/${enrollment.courseId}`}>View</Link>
                                    </Button>
                                </div>
                                {progress && progress.overallCompletionPercentage !== null && (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-body text-xs text-qc-text-muted">Progress</span>
                                            <span className="font-body text-xs font-medium text-qc-charcoal">
                                                {Math.round(Number(progress.overallCompletionPercentage))}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-qc-border-subtle rounded-full h-2">
                                            <div
                                                className="h-2 bg-qc-primary rounded-full transition-all"
                                                style={{
                                                    width: `${progress.overallCompletionPercentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
