'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MagnifyingGlass, Book, BookOpen, CaretLeft, CaretRight, Spinner } from "@phosphor-icons/react";
import { toast } from "sonner";
import { searchBible, getBiblePassage, getCommentary, getBibleAudio, type CommentaryData } from "@/server/actions/bible-study";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import BibleAudioPlayer from './BibleAudioPlayer';

export default function BibleStudyClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // State
    const [query, setQuery] = useState(searchParams.get('q') || 'John 3:16');
    const [isLoading, setIsLoading] = useState(false);
    const [passageData, setPassageData] = useState<{ html: string; reference: string; meta: any } | null>(null);
    const [commentaryData, setCommentaryData] = useState<CommentaryData | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('scripture');

    // Load data when query param changes
    useEffect(() => {
        const queryParam = searchParams.get('q');
        const targetQuery = queryParam || 'John 3:16';

        // Sync input if it differs (e.g. navigation)
        if (targetQuery !== query) {
            setQuery(targetQuery);
        }

        fetchData(targetQuery);
    }, [searchParams.get('q')]);

    const fetchData = async (searchQuery: string) => {
        if (!searchQuery) return;
        setIsLoading(true);
        setIsAudioLoading(true);
        try {
            // Fetch Passage
            const passage = await getBiblePassage({ reference: searchQuery });
            setPassageData(passage);

            // Fetch Commentary
            const commentary = await getCommentary(searchQuery);
            setCommentaryData(commentary);

            // Fetch Audio
            try {
                const audio = await getBibleAudio({ reference: searchQuery });
                setAudioUrl(audio?.audioUrl);
            } catch (err) {
                console.warn("Audio fetch failed", err);
                setAudioUrl(undefined);
            }

        } catch (error: any) {
            console.error("Search error:", error);
            toast.error(error.message || "Failed to load Bible study data");
            setPassageData(null);
            setCommentaryData(null);
            setAudioUrl(undefined);
        } finally {
            setIsLoading(false);
            setIsAudioLoading(false);
        }
    };

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Just update URL, useEffect will handle fetch
        const params = new URLSearchParams(searchParams);
        params.set('q', query);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleNavigation = (direction: 'prev' | 'next') => {
        if (!passageData?.meta) return;
        const targetRef = direction === 'prev' ? passageData.meta.prev_chapter : passageData.meta.next_chapter;
        if (targetRef) {
            // Format: [bookNum, chapterNum] - need to convert back to string or rely on API meta if it gave string?
            // ESV API meta gives tuples. We probably need the 'prev_chapter' raw reference if available or construct it.
            // Actually ESV passage_meta does not provide string ref for prev/next easily without mapping.
            // Let's rely on simple chapter navigation if possible or just warn not implemented fully yet.
            // For MVP, let's skip complex ref mapping and just toast "Navigation coming soon" if precise ref unavailable.
            // Wait, looking at ESV response, it sometimes gives string refs.
            // Update: We'll skip this for the exact moment unless we map book numbers back to names.
            toast.info("Chapter navigation coming in V2");
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-5xl space-y-6">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-qc-lg shadow-sm border border-qc-border-subtle/50">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-8 h-8 text-qc-primary" weight="fill" />
                    <h1 className="text-2xl font-display font-bold text-qc-primary">Bible Study</h1>
                </div>

                <form onSubmit={onSearchSubmit} className="flex w-full md:w-auto gap-2">
                    <div className="relative w-full md:w-80">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter passage (e.g. John 3:16)"
                            className="pr-10"
                        />
                        {isLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Spinner className="w-4 h-4 animate-spin text-qc-primary" />
                            </div>
                        )}
                    </div>
                    <Button type="submit" disabled={isLoading}>Search</Button>
                </form>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="scripture">Scripture (ESV)</TabsTrigger>
                    <TabsTrigger value="commentary">Study Notes</TabsTrigger>
                </TabsList>

                {/* Scripture Panel */}
                <TabsContent value="scripture" className="mt-4 space-y-4">
                    {/* Audio Player */}
                    {passageData && (
                        <BibleAudioPlayer
                            audioUrl={audioUrl}
                            reference={passageData.reference}
                            isLoading={isAudioLoading}
                        />
                    )}

                    <Card className="min-h-[500px] bg-white border-qc-border-subtle/50 shadow-sm">
                        <CardContent className="p-6 md:p-10">
                            {passageData ? (
                                <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-qc-primary">
                                    <h2 className="text-3xl font-display text-center mb-8 text-qc-primary border-b pb-4">
                                        {passageData.reference}
                                    </h2>
                                    <div
                                        dangerouslySetInnerHTML={{ __html: passageData.html }}
                                        className="font-body text-lg leading-relaxed text-qc-neutral-900"
                                    />
                                    <div className="text-xs text-center mt-8 text-muted-foreground">
                                        Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.
                                    </div>
                                </div>
                            ) : (
                                <div className="flex bg-qc-parchment/30 rounded-lg h-full flex-col items-center justify-center min-h-[400px] text-center p-8 space-y-4">
                                    <div className="bg-white p-4 rounded-full shadow-sm">
                                        <Book className="w-12 h-12 text-qc-primary/40" />
                                    </div>
                                    <h3 className="text-xl font-display font-medium text-qc-primary">Enter a passage to begin</h3>
                                    <p className="text-muted-foreground max-w-md">Search for any book, chapter, or verse to read the scripture text alongside Matthew Henry's complete commentary.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Commentary Panel */}
                <TabsContent value="commentary" className="mt-4">
                    <Card className="min-h-[500px] bg-[#FFFBF4] border-qc-border-subtle/50 shadow-sm">
                        <CardContent className="p-6 md:p-10">
                            {commentaryData ? (
                                <div className="prose prose-stone max-w-none">
                                    <h2 className="text-2xl font-display text-qc-primary mb-6 flex items-center gap-2">
                                        <BookOpen className="w-6 h-6" />
                                        Matthew Henry's Commentary
                                    </h2>
                                    <div className="bg-white/50 p-6 rounded-lg border border-stone-200/50">
                                        <div
                                            dangerouslySetInnerHTML={{ __html: commentaryData.html }}
                                            className="font-serif text-lg leading-relaxed text-stone-800 space-y-4"
                                        />
                                    </div>
                                </div>
                            ) : passageData ? (
                                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                                    <p className="text-muted-foreground">No specific commentary found for this reference.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                                    <p className="text-muted-foreground">Search for a passage to see study notes.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
