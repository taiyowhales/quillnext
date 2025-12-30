
'use server';

import fs from 'fs/promises';
import path from 'path';
import { fetchUnreachedOfTheDay } from '@/lib/joshua-project';

// --- Types ---

export interface OperationWorldStats {
    metadata: {
        totalCountries: number;
        scrapedAt: string;
        source: string;
    };
    countries: Array<{
        country: string;
        url: string;
        data: Record<string, unknown>;
    }>;
}

export interface CountyData {
    State: string;
    County: string;
    // We can add more specific fields from the JSON as needed, but for now we'll be flexible
    [key: string]: unknown;
}

// --- Actions ---

export async function getUnreachedOfTheDayAction() {
    return await fetchUnreachedOfTheDay();
}

/**
 * Reads the Operation World stats from the JSON file.
 * This file is relatively small (~175KB), so we can read it fully.
 */
export async function getOperationWorldStats(): Promise<OperationWorldStats | null> {
    try {
        const filePath = path.join(process.cwd(), 'src', 'server', 'data', 'mission-stats.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        return data;
    } catch (error) {
        console.error('Error reading Operation World stats:', error);
        return null;
    }
}

/**
 * Gets counties for a specific state.
 * The source file is large (29MB), so we read and stream/filter it to avoid memory spikes.
 */
export async function getCountiesForState(stateName: string): Promise<CountyData[]> {
    try {
        const filePath = path.join(process.cwd(), 'src', 'server', 'data', 'counties_list.json');

        // Since we can't easily stream-parse JSON without a library like 'stream-json' and we want to avoid new deps if possible,
        // we will try reading it. 29MB is large but manageable for Node.js memory limits (usually 2GB+).
        // If it causes issues, we can optimize later.
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const allCounties: CountyData[] = JSON.parse(fileContent);

        return allCounties.filter(county => county.State === stateName).sort((a, b) => a.County.localeCompare(b.County));
    } catch (error) {
        console.error('Error reading counties list:', error);
        return [];
    }
}

/**
 * Gets the list of unique states from the counties dataset.
 * Caches the result if possible (Next.js request memoization helps here).
 */
export async function getAllStates(): Promise<string[]> {
    try {
        const filePath = path.join(process.cwd(), 'src', 'server', 'data', 'counties_list.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const allCounties: CountyData[] = JSON.parse(fileContent);

        const states = new Set(allCounties.map(c => c.State));
        return Array.from(states).sort();
    } catch (error) {
        console.error('Error reading counties list for states:', error);
        return [];
    }
}
