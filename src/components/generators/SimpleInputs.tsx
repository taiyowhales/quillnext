"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UrlInputProps {
    value: string;
    onChange: (val: string) => void;
}

export function UrlInput({ value, onChange }: UrlInputProps) {
    return (
        <div className="space-y-2">
            <Label>Web Article URL</Label>
            <Input
                placeholder="https://example.com/article"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Original content will be fetched and synthesized.</p>
        </div>
    );
}

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
    return (
        <div className="space-y-2">
            <Label>Upload Document (PDF, TXT, MD)</Label>
            <Input
                type="file"
                accept=".txt,.md,.pdf"
                onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    onFileSelect(file);
                }}
            />
            <p className="text-xs text-muted-foreground">Text will be extracted for generation.</p>
        </div>
    );
}
