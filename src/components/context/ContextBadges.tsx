"use client";

import { Badge } from "@/components/ui/badge";

interface ContextBadgesProps {
  student?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    preferredName?: string | null;
  } | null;
  objective?: {
    id: string;
    text: string;
    subtopic: {
      topic: {
        strand: {
          subject: { name: string };
          name: string;
        };
      };
    };
  } | null;
  book?: {
    id: string;
    title: string;
  } | null;
  video?: {
    id: string;
    title: string;
  } | null;
  course?: {
    id: string;
    title: string;
    subject: { name: string };
    strand?: { name: string } | null;
  } | null;
  className?: string;
}

export function ContextBadges({
  student,
  objective,
  book,
  video,
  course,
  className = "",
}: ContextBadgesProps) {
  const badges: Array<{ label: string; type: "student" | "academic" | "library" | "course" }> = [];

  if (student) {
    badges.push({
      label: `Personalized for ${student.preferredName || student.firstName}`,
      type: "student",
    });
  }

  if (objective) {
    badges.push({
      label: `Aligned to ${objective.subtopic.topic.strand.subject.name} > ${objective.subtopic.topic.strand.name}`,
      type: "academic",
    });
  }

  if (book) {
    badges.push({
      label: `Using ${book.title}`,
      type: "library",
    });
  }

  if (video) {
    badges.push({
      label: `Using ${video.title || "Video"}`,
      type: "library",
    });
  }

  if (course) {
    badges.push({
      label: `Course: ${course.title}`,
      type: "course",
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge, index) => {
        const variant =
          badge.type === "student"
            ? "default"
            : badge.type === "academic"
              ? "secondary"
              : badge.type === "library"
                ? "outline"
                : "outline";
        return (
          <Badge key={index} variant={variant} className="font-body text-xs">
            {badge.label}
          </Badge>
        );
      })}
    </div>
  );
}

