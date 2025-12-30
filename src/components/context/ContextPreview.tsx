"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ContextPreviewProps {
  contextString: string;
  maxHeight?: number;
  showExpand?: boolean;
}

export function ContextPreview({
  contextString,
  maxHeight = 300,
  showExpand = true,
}: ContextPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display text-lg">Inkling Context Preview</CardTitle>
            <CardDescription>
              This is the context that will be used for Inkling generation
            </CardDescription>
          </div>
          {showExpand && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`bg-qc-warm-stone rounded-qc-md p-4 overflow-y-auto ${!isExpanded && showExpand ? "max-h-[300px]" : ""
            }`}
          style={!isExpanded && showExpand ? { maxHeight: `${maxHeight}px` } : {}}
        >
          <pre className="font-mono text-xs text-qc-charcoal whitespace-pre-wrap">
            {contextString || "No context available. Complete onboarding to enable Inkling personalization."}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

