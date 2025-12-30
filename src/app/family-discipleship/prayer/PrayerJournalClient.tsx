'use client';

import React, { useState, useMemo } from 'react';
import {
    PrayerEntry,
    PrayerEntryInput,
    createPrayerEntry,
    updatePrayerEntry,
    deletePrayerEntry,
    togglePrayerAnswered
} from '@/server/actions/prayer-journal';
import PrayerJournalSidebar from './PrayerJournalSidebar';
// Dynamically import editor to reduce initial bundle size (Tiptap is heavy)
import dynamic from 'next/dynamic';
const PrayerJournalEditor = dynamic(() => import('./PrayerJournalEditor'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-white rounded-xl border border-qc-border-subtle animate-pulse flex items-center justify-center text-qc-text-muted">Loading Editor...</div>
});
import { toast } from 'sonner';

interface PrayerJournalClientProps {
    initialEntries: PrayerEntry[];
    initialCategories: { id: string; name: string }[];
}

export default function PrayerJournalClient({
    initialEntries,
    initialCategories
}: PrayerJournalClientProps) {
    // State
    const [entries, setEntries] = useState<PrayerEntry[]>(initialEntries);
    const [selectedEntry, setSelectedEntry] = useState<PrayerEntry | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Filter State
    const [filterDate, setFilterDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterTags, setFilterTags] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);


    // Derived State
    const uniqueCategories = useMemo(() => {
        const cats = new Set(initialCategories.map(c => c.name));
        entries.forEach(e => { if (e.category) cats.add(e.category) });
        return Array.from(cats).sort();
    }, [initialCategories, entries]);

    const uniqueTags = useMemo(() => {
        const tags = new Set<string>();
        entries.forEach(e => e.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [entries]);

    // Handlers
    const handleNewEntry = () => {
        setSelectedEntry(null);
        setIsCreating(true);
        setIsEditing(true);
    };

    const handleSelectEntry = (entry: PrayerEntry) => {
        setSelectedEntry(entry);
        setIsCreating(false);
        setIsEditing(false); // Valid: View mode first
    };

    const handleEditEntry = () => {
        setIsEditing(true);
    };

    const handleSave = async (data: PrayerEntryInput) => {
        try {
            if (selectedEntry && !isCreating) {
                await updatePrayerEntry({ id: selectedEntry.id, ...data });
                toast.success('Prayer entry updated');
            } else {
                await createPrayerEntry(data);
                toast.success('Prayer entry created');
            }
            // In a real app with strict RSC, we rely on revalidatePath, 
            // but for instant feedback we might optimistically update or rely on upcoming refresh.
            // For now, let's assume the page refreshes or we need to manually reload/update local state if we want instant feedback without hydration mismatch.
            // A hard reload is simple for this MVC step:
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save entry');
        }
    };

    const handleDelete = async (entry: PrayerEntry) => {
        if (!confirm("Are you sure you want to delete this entry?")) return;
        try {
            await deletePrayerEntry(entry.id);
            setEntries(entries.filter(e => e.id !== entry.id));
            if (selectedEntry?.id === entry.id) {
                setSelectedEntry(null);
                setIsEditing(false);
            }
            toast.success('Entry deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete entry');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setIsCreating(false);
        if (isCreating) setSelectedEntry(null);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
            {/* Sidebar (30%) */}
            <div className="w-full lg:w-1/3 min-w-[300px] flex-shrink-0 h-full">
                <PrayerJournalSidebar
                    entries={entries}
                    selectedEntry={selectedEntry}
                    onEntrySelect={handleSelectEntry}
                    onNewEntry={handleNewEntry}
                    onDeleteEntry={handleDelete}
                    filterDate={filterDate}
                    setFilterDate={setFilterDate}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    filterTags={filterTags}
                    setFilterTags={setFilterTags}
                    uniqueCategories={uniqueCategories}
                    uniqueTags={uniqueTags}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                />
            </div>

            {/* Main Content (70%) */}
            <div className="flex-1 h-full min-w-0">
                <PrayerJournalEditor
                    key={selectedEntry?.id || 'new'} // Re-mount on entry change
                    entry={selectedEntry}
                    isEditing={isEditing}
                    isCreating={isCreating}
                    categories={uniqueCategories}
                    onSave={handleSave}
                    onCancel={handleCancelEdit}
                    onEdit={handleEditEntry}
                />
            </div>
        </div>
    );
}
