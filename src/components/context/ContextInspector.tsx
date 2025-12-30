"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContextInspector() {
  const [contextParams, setContextParams] = useState({
    organizationId: "",
    studentId: "",
    objectiveId: "",
  });
  const [context, setContext] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInspect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/context/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contextParams),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch context");
      }

      const data = await response.json();
      setContext(data);
    } catch (error) {
      console.error("Context inspection failed:", error);
      alert("Failed to inspect context");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Context Inspector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="organizationId">Organization ID</Label>
            <Input
              id="organizationId"
              value={contextParams.organizationId}
              onChange={(e) =>
                setContextParams({ ...contextParams, organizationId: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="studentId">Student ID (optional)</Label>
            <Input
              id="studentId"
              value={contextParams.studentId}
              onChange={(e) =>
                setContextParams({ ...contextParams, studentId: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="objectiveId">Objective ID (optional)</Label>
            <Input
              id="objectiveId"
              value={contextParams.objectiveId}
              onChange={(e) =>
                setContextParams({ ...contextParams, objectiveId: e.target.value })
              }
            />
          </div>
          <Button onClick={handleInspect} disabled={isLoading || !contextParams.organizationId}>
            {isLoading ? "Inspecting..." : "Inspect Context"}
          </Button>
        </CardContent>
      </Card>

      {context && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Context Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="font-mono text-xs bg-qc-warm-stone p-4 rounded-qc-md overflow-x-auto">
              {JSON.stringify(context, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

