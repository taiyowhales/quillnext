"use client";

import React, { useState } from 'react';
import { GraduationCap } from '@phosphor-icons/react/dist/ssr';
import { cn } from "@/lib/utils";
import InteractiveCatechism from './InteractiveCatechism';

// Import catechism data
import wscData from '@/data/catechisms/wsc';
import westminsterLargerData from '@/data/catechisms/wlc';
import baptistCatechism1695Data from '@/data/catechisms/baptist';
import heidelbergCatechismData from '@/data/catechisms/heidelberg';
import puritanCatechismData from '@/data/catechisms/puritan';
import catechismForYoungChildrenData from '@/data/catechisms/young_children';
import matthewHenryScriptureCatechismData from '@/data/catechisms/matthew_henry';

interface CatechismConfig {
    data: any;
    title: string;
    description: string;
    questionCount: number;
    difficulty: string;
}

interface CatechismManagerProps {
    studentId?: string;
}

export function CatechismManager({ studentId }: CatechismManagerProps) {
    const [assignedCatechism, setAssignedCatechism] = useState<CatechismConfig | null>(null);

    const catechismConfig: Record<string, CatechismConfig> = {
        'wsc': {
            data: wscData,
            title: 'Westminster Shorter Catechism',
            description: 'Classic Reformed catechism with 107 questions',
            questionCount: wscData.length,
            difficulty: 'Intermediate'
        },
        'wlc': {
            data: westminsterLargerData,
            title: 'Westminster Larger Catechism',
            description: 'Comprehensive Reformed catechism',
            questionCount: westminsterLargerData.length,
            difficulty: 'Advanced'
        },
        'baptist-1695': {
            data: baptistCatechism1695Data,
            title: 'Baptist Catechism (1695)',
            description: 'Baptist adaptation of Westminster Shorter Catechism',
            questionCount: baptistCatechism1695Data.length,
            difficulty: 'Intermediate'
        },
        'heidelberg': {
            data: heidelbergCatechismData,
            title: 'Heidelberg Catechism',
            description: 'Warm, pastoral guide to Reformed doctrine',
            questionCount: heidelbergCatechismData.length,
            difficulty: 'Intermediate'
        },
        'puritan': {
            data: puritanCatechismData,
            title: 'Puritan Catechism',
            description: 'Practical Puritan teaching on Christian doctrine',
            questionCount: puritanCatechismData.length,
            difficulty: 'Intermediate'
        },
        'young-children': {
            data: catechismForYoungChildrenData,
            title: 'Catechism for Young Children',
            description: 'Simplified catechism designed for children',
            questionCount: catechismForYoungChildrenData.length,
            difficulty: 'Beginner'
        },
        'matthew-henry': {
            data: matthewHenryScriptureCatechismData,
            title: 'Matthew Henry\'s Scripture Catechism',
            description: 'Unique format with scripture proofs',
            questionCount: matthewHenryScriptureCatechismData.length,
            difficulty: 'Advanced'
        }
    };

    // Color pattern using Tailwind classes/custom tokens
    const colorPattern = [
        'bg-qc-secondary', // Gold
        'bg-qc-primary',   // Blue/Primary
        'bg-qc-charcoal',  // Dark
        'bg-qc-primary/80' // Using opacity for variety or another token
    ];

    const getCardColor = (index: number) => {
        return colorPattern[index % colorPattern.length];
    };

    const [assignedCatechismId, setAssignedCatechismId] = useState<string | null>(null);

    const handleCatechismAssignment = (catechismId: string) => {
        setAssignedCatechism(catechismConfig[catechismId]);
        setAssignedCatechismId(catechismId);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-qc-primary mb-4">Catechism Study</h2>
                <p className="text-lg text-qc-text-muted leading-relaxed max-w-3xl">
                    Catechesis provides the grammar of biblical doctrine, giving you a systematic, theological framework
                    to understand, articulate, and defend the faith once for all delivered to the saints.
                </p>
            </div>

            {/* Catechism Selection - Carousel */}
            <div className="relative">
                <div className="overflow-x-auto scrollbar-hide py-4 scroll-smooth">
                    <div className="flex gap-6 px-1">
                        {Object.entries(catechismConfig).map(([id, config], index) => (
                            <div
                                key={id}
                                className={cn(
                                    "rounded-xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] min-w-[280px] md:min-w-[320px] flex-shrink-0 touch-manipulation min-h-[44px]",
                                    getCardColor(index),
                                    assignedCatechism?.title === config.title ? 'ring-4 ring-offset-2 ring-qc-primary' : ''
                                )}
                                onClick={() => handleCatechismAssignment(id)}
                            >
                                <div className="flex items-center mb-4">
                                    <GraduationCap className="text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{config.title}</h3>
                                <p className="text-sm opacity-90 mb-3">{config.description}</p>
                                <div className="flex items-center justify-between text-sm opacity-75">
                                    <span>{config.questionCount} questions</span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs uppercase tracking-wide">{config.difficulty}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Interactive Catechism */}
            {assignedCatechism ? (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 bg-white/50 border border-qc-border-subtle rounded-xl mb-6 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold text-qc-primary">
                            {assignedCatechism.title}
                        </h3>
                        <p className="text-qc-text-muted mt-2">
                            Select a mode below to start practicing.
                        </p>
                    </div>
                    <InteractiveCatechism
                        catechismData={assignedCatechism.data}
                        title={assignedCatechism.title}
                        studentId={studentId}
                        catechismId={assignedCatechismId}
                    />
                </div>
            ) : (
                <div className="mt-8 p-12 text-center bg-white/50 border border-dashed border-qc-border-subtle rounded-xl text-qc-text-muted">
                    <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a catechism above to begin studying</p>
                </div>
            )}
        </div>
    );
}
