"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { YoutubeLogo, Spinner } from "@phosphor-icons/react";
import { processVideoResource } from "@/app/actions/process-video";

import { toast } from "sonner";

export function AddVideoDialog() {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcess = async () => {
        if (!url) return;

        setIsProcessing(true);
        try {
            toast.success("Processing video... this may take a minute.");
            const result = await processVideoResource(url);

            if (result.success) {
                toast.success("Video processed and added to library!");
                setOpen(false);
                setUrl("");
            } else {
                // TS knows this is the failure case, but we need to assert or check explicitly if discriminating
                // union is strictly enforced. However, since we checked success=true, the else *should* be success=false.
                // The issue might be that TS infers 'error' is optionally present or missing on some types.
                // We'll cast to any or refine. 
                // Better approach: explicit check.
                if ('error' in result) {
                    toast.error(result.error || "Failed to process video");
                } else {
                    toast.error("Failed to process video");
                }
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <YoutubeLogo size={20} className="text-red-600" />
                    Add Video
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add YouTube Video</DialogTitle>
                    <DialogDescription>
                        Enter a YouTube URL. We'll use Gemini 3 Pro to watch it, extract a summary, key points, and generate embeddings for the Living Library.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="url">YouTube URL</Label>
                        <Input
                            id="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isProcessing}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleProcess} disabled={!url || isProcessing}>
                        {isProcessing ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Add & Process"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
