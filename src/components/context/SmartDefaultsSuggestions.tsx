"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SmartDefaultsSuggestionsProps {
  suggestedStudentId?: string;
  suggestedStudentName?: string;
  suggestedObjectives?: Array<{
    id: string;
    text: string;
    code: string;
    subtopic: {
      topic: {
        strand: {
          subject: { name: string };
          name: string;
        };
      };
    };
  }>;
  currentStudentId?: string;
  currentObjectiveId?: string;
  generatorId: string;
  courseId?: string;
}

export function SmartDefaultsSuggestions({
  suggestedStudentId,
  suggestedStudentName,
  suggestedObjectives,
  currentStudentId,
  currentObjectiveId,
  generatorId,
  courseId,
}: SmartDefaultsSuggestionsProps) {
  const suggestions: Array<{ type: "student" | "objective"; label: string; url: string }> = [];

  // Suggest student if available and not already selected
  if (suggestedStudentId && !currentStudentId) {
    suggestions.push({
      type: "student",
      label: `Personalize for ${suggestedStudentName || "student"}`,
      url: `/creation-station/${generatorId}?${courseId ? `courseId=${courseId}&` : ""}studentId=${suggestedStudentId}`,
    });
  }

  // Suggest objectives if available and not already selected
  if (suggestedObjectives && suggestedObjectives.length > 0 && !currentObjectiveId) {
    suggestions.push({
      type: "objective",
      label: `Link to ${suggestedObjectives.length} learning objective${suggestedObjectives.length !== 1 ? "s" : ""}`,
      url: `/creation-station/${generatorId}?${courseId ? `courseId=${courseId}&` : ""}${currentStudentId ? `studentId=${currentStudentId}&` : ""}objectiveId=${suggestedObjectives[0].id}`,
    });
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-qc-secondary/30 bg-qc-secondary/5">
      <CardHeader>
        <CardTitle className="font-display text-sm">💡 Quick Suggestions</CardTitle>
        <CardDescription className="text-xs">
          We found context that can improve your generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs"
            asChild
          >
            <Link href={suggestion.url}>{suggestion.label}</Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

