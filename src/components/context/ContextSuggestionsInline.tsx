"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ContextSuggestion } from "@/lib/context/context-suggestions";

interface ContextSuggestionsInlineProps {
  suggestions: ContextSuggestion[];
  maxSuggestions?: number;
}

export function ContextSuggestionsInline({
  suggestions,
  maxSuggestions = 3,
}: ContextSuggestionsInlineProps) {
  const highPrioritySuggestions = suggestions
    .filter((s) => s.priority === "high")
    .slice(0, maxSuggestions);

  if (highPrioritySuggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-qc-primary/30 bg-qc-primary/5">
      <CardContent className="pt-6">
        <p className="font-body text-sm font-medium text-qc-primary mb-3">
          💡 Improve Your Context
        </p>
        <div className="space-y-3">
          {highPrioritySuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 bg-white rounded-qc-md border border-qc-border-subtle"
            >
              <p className="font-body text-sm font-medium text-qc-charcoal mb-1">
                {suggestion.title}
              </p>
              <p className="font-body text-xs text-qc-text-muted mb-2">
                {suggestion.description}
              </p>
              <p className="font-body text-xs text-qc-primary mb-2">
                Impact: {suggestion.impact}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={suggestion.actionUrl}>{suggestion.actionLabel}</Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

