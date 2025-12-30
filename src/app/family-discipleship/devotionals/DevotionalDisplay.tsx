
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Moon, ArrowLeft, BookOpen } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type DevotionalEntry = {
    id: String;
    time: String;
    keyverse: String;
    body: String;
};

interface DevotionalDisplayProps {
    devotionals: DevotionalEntry[];
    date: string;
}

export function DevotionalDisplay({ devotionals, date }: DevotionalDisplayProps) {
    const morning = devotionals.find(d => d.time === 'am');
    const evening = devotionals.find(d => d.time === 'pm');

    // Determine default tab based on current time (rough heuristic)
    const currentHour = new Date().getHours();
    const defaultTab = currentHour >= 17 ? "evening" : "morning";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/family-discipleship">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-qc-primary">Daily Devotional</h1>
                    <p className="text-muted-foreground">{date}</p>
                </div>
            </div>

            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="morning" className="flex items-center gap-2">
                        <Sun className="h-4 w-4" /> Morning
                    </TabsTrigger>
                    <TabsTrigger value="evening" className="flex items-center gap-2">
                        <Moon className="h-4 w-4" /> Evening
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="morning">
                    {morning ? (
                        <DevotionalCard entry={morning} timeLabel="Morning" icon={<Sun className="h-5 w-5 text-orange-500" />} />
                    ) : (
                        <EmptyState message="No morning devotional available for today." />
                    )}
                </TabsContent>

                <TabsContent value="evening">
                    {evening ? (
                        <DevotionalCard entry={evening} timeLabel="Evening" icon={<Moon className="h-5 w-5 text-indigo-500" />} />
                    ) : (
                        <EmptyState message="No evening devotional available for today." />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function DevotionalCard({ entry, timeLabel, icon }: { entry: any, timeLabel: string, icon: React.ReactNode }) {
    return (
        <Card className="mt-4 border-qc-border-subtle shadow-sm">
            <CardHeader className="bg-qc-parchment/50 border-b border-qc-border-subtle/30 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {icon}
                        <CardTitle className="text-xl font-serif">{timeLabel} Reading</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-white">Spurgeon's M&E</Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="p-4 bg-qc-paper rounded-lg border border-qc-border-subtle/50">
                    <h3 className="font-semibold text-qc-primary mb-2 text-lg">Key Verse</h3>
                    <p className="italic text-lg text-qc-text-heading font-serif">"{entry.keyverse}"</p>
                </div>

                <div className="prose prose-stone max-w-none text-qc-text leading-relaxed whitespace-pre-line">
                    {entry.body}
                </div>
            </CardContent>
        </Card>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <Card className="mt-4 bg-qc-parchment/20 border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                <p>{message}</p>
            </CardContent>
        </Card>
    )
}
// import { BookOpen } from 'lucide-react'; // Removed duplicate import
