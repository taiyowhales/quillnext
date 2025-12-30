"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface ContextNavProps {
  studentId?: string;
  courseId?: string;
  objectiveId?: string;
  bookId?: string;
}

export function ContextNav({ studentId, courseId, objectiveId, bookId }: ContextNavProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [context, setContext] = useState<ContextNavProps>({});

  useEffect(() => {
    // Get context from URL params
    const student = searchParams.get("studentId") || studentId;
    const course = searchParams.get("courseId") || courseId;
    const objective = searchParams.get("objectiveId") || objectiveId;
    const book = searchParams.get("bookId") || bookId;

    setContext({
      studentId: student || undefined,
      courseId: course || undefined,
      objectiveId: objective || undefined,
      bookId: book || undefined,
    });
  }, [searchParams, studentId, courseId, objectiveId, bookId]);

  const hasContext = Object.values(context).some((v) => v !== undefined);

  if (!hasContext) {
    return null;
  }

  const buildUrl = (basePath: string) => {
    const params = new URLSearchParams();
    if (context.studentId) params.set("studentId", context.studentId);
    if (context.courseId) params.set("courseId", context.courseId);
    if (context.objectiveId) params.set("objectiveId", context.objectiveId);
    if (context.bookId) params.set("bookId", context.bookId);
    return `${basePath}?${params.toString()}`;
  };

  return (
    <Card className="mb-4 border-qc-primary/20 bg-qc-primary/5">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-body text-xs font-medium text-qc-primary">Context:</span>
            <div className="flex flex-wrap gap-2">
              {context.studentId && (
                <span className="px-2 py-1 bg-qc-primary/10 text-qc-primary rounded-full text-xs font-body">
                  Student Selected
                </span>
              )}
              {context.courseId && (
                <span className="px-2 py-1 bg-qc-parchment rounded-full text-xs font-body text-qc-charcoal">
                  Course Selected
                </span>
              )}
              {context.objectiveId && (
                <span className="px-2 py-1 bg-qc-parchment rounded-full text-xs font-body text-qc-charcoal">
                  Objective Selected
                </span>
              )}
              {context.bookId && (
                <span className="px-2 py-1 bg-qc-parchment rounded-full text-xs font-body text-qc-charcoal">
                  Book Selected
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={buildUrl("/creation-station")}>Generate with Context</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.href = pathname;
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Hook to preserve context across navigation
 */
export function useContextPreservation() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getContextParams = () => {
    const params = new URLSearchParams();
    const studentId = searchParams.get("studentId");
    const courseId = searchParams.get("courseId");
    const objectiveId = searchParams.get("objectiveId");
    const bookId = searchParams.get("bookId");

    if (studentId) params.set("studentId", studentId);
    if (courseId) params.set("courseId", courseId);
    if (objectiveId) params.set("objectiveId", objectiveId);
    if (bookId) params.set("bookId", bookId);

    return params.toString();
  };

  const buildContextualUrl = (basePath: string) => {
    const contextParams = getContextParams();
    return contextParams ? `${basePath}?${contextParams}` : basePath;
  };

  return {
    getContextParams,
    buildContextualUrl,
    hasContext: searchParams.toString().length > 0,
  };
}

