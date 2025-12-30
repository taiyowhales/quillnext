import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AIContextPreviewProps {
    contextPreview: string;
}

export function AIContextPreview({ contextPreview }: AIContextPreviewProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-display text-xl">Inkling Personalization Context</CardTitle>
                <CardDescription>
                    This is the context that will be used when generating content for this student
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-qc-warm-stone rounded-qc-md p-4 mb-4">
                    <pre className="font-mono text-xs text-qc-charcoal whitespace-pre-wrap overflow-x-auto">
                        {contextPreview || "No context available. Complete assessments to enable personalization."}
                    </pre>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <a
                            href={`data:text/plain;charset=utf-8,${encodeURIComponent(contextPreview)}`}
                            download="student-context.txt"
                        >
                            Download Context
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
