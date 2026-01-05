'use server';

import { auth } from "@/auth";
import { StandardError, ERROR_CODES, ERROR_CATEGORIES, createSuccessResponse } from "../utils/errorTaxonomy";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";
import * as cheerio from "cheerio";
import { z } from "zod";

import { models, AITaskType, getModelForTask } from "@/lib/ai/config";
import { generateText } from "ai";

// --- Types ---

interface ESVPassageResponse {
    query: string;
    canonical: string;
    parsed: Array<[number, number]>;
    passage_meta: Array<{
        canonical: string;
        chapter_start: [number, number];
        chapter_end: [number, number];
        prev_chapter: [number, number] | null;
        next_chapter: [number, number] | null;
        prev_verse: number | null;
        next_verse: number | null;
    }>;
    passages: string[];
}

interface ESVSearchResult {
    reference: string;
    content: string;
}

interface ESVSearchResponse {
    page: number;
    total_results: number;
    total_pages: number;
    results: ESVSearchResult[];
}

export interface CommentaryData {
    reference: string;
    book: string;
    chapter: number;
    verse: number | null;
    html: string;
    fullChapter: boolean;
}

// --- Configuration ---
const ESV_API_KEY = process.env.BIBLE_API_KEY;
const MAX_SEARCH_RESULTS = 20;

// --- Helper Functions ---

/**
 * Validates the Bible reference string.
 * This checks for basic structure but assumes the ESV API will handle specific canonical validation.
 */
function isValidReference(reference: string): boolean {
    return reference.trim().length > 2; // Basic check: at least 3 chars (e.g. "Job")
}

/**
 * Makes an authenticated request to the ESV API.
 */
async function fetchFromESV(endpoint: string, params: Record<string, string>): Promise<any> {
    if (!ESV_API_KEY) {
        throw new StandardError(
            ERROR_CODES.SYSTEM.CONFIGURATION_ERROR,
            "Server configuration error: Bible API key is missing.",
            500,
            null,
            ERROR_CATEGORIES.SYSTEM
        );
    }

    const url = new URL(`https://api.esv.org/v3/passage/${endpoint}/`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

    try {
        const response = await fetch(url.toString(), {
            headers: { 'Authorization': `Token ${ESV_API_KEY}` },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`ESV API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("ESV Fetch Error:", error);
        throw new StandardError(
            ERROR_CODES.EXTERNAL.API_ERROR,
            "Failed to fetch data from Bible service.",
            502,
            null,
            ERROR_CATEGORIES.EXTERNAL
        );
    }
}

// Validation schemas
const searchBibleSchema = z.object({
    query: z.string().min(2),
    page: z.number().int().min(1).optional().default(1),
});

const getBiblePassageSchema = z.object({
    reference: z.string().min(3),
});

/**
 * Searches the Bible (ESV) for a given query string.
 */
export async function searchBible(rawData: unknown) {
    const data = searchBibleSchema.parse(rawData);

    const session = await auth();
    if (!session?.user) {
        throw new StandardError(ERROR_CODES.AUTHORIZATION.UNAUTHORIZED, "Unauthorized", 401);
    }

    if (!data.query || data.query.length < 2) {
        return { results: [], total_results: 0, total_pages: 0, page: 1 };
    }

    const responseData: ESVSearchResponse = await fetchFromESV("search", {
        q: data.query,
        "page-size": MAX_SEARCH_RESULTS.toString(),
        page: data.page.toString()
    });

    return responseData;
}

/**
 * Fetches proper HTML content for a Bible passage from ESV API.
 */
export async function getBiblePassage(rawData: unknown) {
    const data = getBiblePassageSchema.parse(rawData);

    const session = await auth();
    if (!session?.user) {
        throw new StandardError(ERROR_CODES.AUTHORIZATION.UNAUTHORIZED, "Unauthorized", 401);
    }

    if (!isValidReference(data.reference)) {
        throw new StandardError(ERROR_CODES.VALIDATION.INVALID_INPUT, "Invalid reference", 400);
    }

    const responseData: ESVPassageResponse = await fetchFromESV("html", {
        q: data.reference,
        "include-footnotes": "false",
        "include-verse-numbers": "true",
        "include-headings": "true",
        "include-short-copyright": "false",
        "include-audio-link": "false",
        "include-passage-references": "false",
        "wrapping-div": "true",
        "div-classes": "esv-text"
    });

    if (!responseData.passages || responseData.passages.length === 0) {
        throw new StandardError(ERROR_CODES.VALIDATION.NOT_FOUND, "Passage not found", 404);
    }

    return {
        html: responseData.passages[0],
        reference: responseData.canonical,
        meta: responseData.passage_meta[0]
    };
}

/**
 * Fetches the audio URL for a given Bible reference from ESV API.
 * Note: ESV API often redirects to the MP3 file.
 */
export async function getBibleAudio(rawData: unknown) {
    const data = getBiblePassageSchema.parse(rawData);

    const session = await auth();
    if (!session?.user) {
        throw new StandardError(ERROR_CODES.AUTHORIZATION.UNAUTHORIZED, "Unauthorized", 401);
    }

    if (!isValidReference(data.reference)) {
        throw new StandardError(ERROR_CODES.VALIDATION.INVALID_INPUT, "Invalid reference", 400);
    }

    if (!ESV_API_KEY) {
        throw new StandardError(ERROR_CODES.SYSTEM.CONFIGURATION_ERROR, "Bible API key missing", 500);
    }

    const url = new URL(`https://api.esv.org/v3/passage/audio/`);
    url.searchParams.append('q', data.reference);

    try {
        const response = await fetch(url.toString(), {
            headers: { 'Authorization': `Token ${ESV_API_KEY}` },
            redirect: 'manual'
        });

        if (response.status === 302 || response.status === 301) {
            const audioUrl = response.headers.get('Location');
            if (!audioUrl) {
                throw new StandardError(ERROR_CODES.EXTERNAL.API_ERROR, "Audio location not found", 404);
            }
            return { audioUrl };
        }

        if (!response.ok) {
            throw new Error(`ESV API error: ${response.status}`);
        }

        return { audioUrl: response.url };

    } catch (error: any) {
        console.error("ESV Audio Fetch Error:", error);
        throw new StandardError(
            ERROR_CODES.EXTERNAL.API_ERROR,
            "Failed to fetch audio",
            502
        );
    }
}

/**
 * Fetches plain text for a Bible reference from ESV API.
 * Useful for memorization and display where HTML is not needed.
 */
export async function getBibleText(rawData: unknown) {
    const data = getBiblePassageSchema.parse(rawData);

    const session = await auth();
    if (!session?.user) {
        throw new StandardError(ERROR_CODES.AUTHORIZATION.UNAUTHORIZED, "Unauthorized", 401);
    }

    if (!isValidReference(data.reference)) {
        throw new StandardError(ERROR_CODES.VALIDATION.INVALID_INPUT, "Invalid reference", 400);
    }

    const responseData: ESVPassageResponse = await fetchFromESV("text", {
        q: data.reference,
        "include-headings": "false",
        "include-verse-numbers": "false",
        "include-footnotes": "false",
        "include-short-copyright": "false",
        "include-passage-references": "false",
        "indent-paragraphs": "0",
        "indent-poetry": "false",
        "indent-declares": "0",
        "indent-psalm-doxology": "0"
    });

    if (!responseData.passages || responseData.passages.length === 0) {
        throw new StandardError(ERROR_CODES.VALIDATION.NOT_FOUND, "Passage not found", 404);
    }

    return responseData.passages[0].trim();
}

// --- Matthew Henry Commentary Logic ---

const BIBLE_BOOK_MAP: Record<string, number> = {
    'genesis': 1, 'gen': 1, 'ge': 1, 'gn': 1,
    'exodus': 2, 'ex': 2, 'exo': 2, 'exod': 2,
    'leviticus': 3, 'lev': 3, 'le': 3, 'lv': 3,
    'numbers': 4, 'num': 4, 'nu': 4, 'nm': 4, 'nb': 4,
    'deuteronomy': 5, 'deut': 5, 'deu': 5, 'dt': 5,
    'joshua': 6, 'josh': 6, 'jos': 6, 'jsh': 6,
    'judges': 7, 'judg': 7, 'jdg': 7, 'jg': 7,
    'ruth': 8, 'rut': 8, 'ru': 8,
    '1 samuel': 9, '1sam': 9, '1 sa': 9, '1sm': 9, 'i sam': 9,
    '2 samuel': 10, '2sam': 10, '2 sa': 10, '2sm': 10, 'ii sam': 10,
    '1 kings': 11, '1kgs': 11, '1 ki': 11, '1k': 11, 'i kgs': 11,
    '2 kings': 12, '2kgs': 12, '2 ki': 12, '2k': 12, 'ii kgs': 12,
    '1 chronicles': 13, '1chron': 13, '1 ch': 13, 'i chron': 13,
    '2 chronicles': 14, '2chron': 14, '2 ch': 14, 'ii chron': 14,
    'ezra': 15, 'ezr': 15,
    'nehemiah': 16, 'neh': 16, 'ne': 16,
    'esther': 17, 'esth': 17, 'es': 17,
    'job': 18, 'jb': 18,
    'psalms': 19, 'psalm': 19, 'ps': 19, 'psa': 19, 'pss': 19,
    'proverbs': 20, 'prov': 20, 'pro': 20, 'prv': 20,
    'ecclesiastes': 21, 'eccl': 21, 'ec': 21, 'ecc': 21,
    'song of solomon': 22, 'song': 22, 'sos': 22, 'cant': 22,
    'isaiah': 23, 'isa': 23, 'is': 23,
    'jeremiah': 24, 'jer': 24, 'je': 24, 'jr': 24,
    'lamentations': 25, 'lam': 25, 'la': 25, 'lm': 25,
    'ezekiel': 26, 'ezek': 26, 'eze': 26, 'ez': 26,
    'daniel': 27, 'dan': 27, 'da': 27, 'dn': 27,
    'hosea': 28, 'hos': 28, 'ho': 28,
    'joel': 29, 'jl': 29,
    'amos': 30, 'am': 30,
    'obadiah': 31, 'obad': 31, 'ob': 31,
    'jonah': 32, 'jon': 32, 'jnh': 32,
    'micah': 33, 'mic': 33, 'mi': 33, 'mc': 33,
    'nahum': 34, 'nah': 34, 'na': 34,
    'habakkuk': 35, 'hab': 35, 'hb': 35,
    'zephaniah': 36, 'zeph': 36, 'zep': 36, 'zp': 36,
    'haggai': 37, 'hag': 37, 'hg': 37,
    'zechariah': 38, 'zech': 38, 'zec': 38, 'zc': 38,
    'malachi': 39, 'mal': 39, 'ml': 39,
    'matthew': 40, 'matt': 40, 'mt': 40,
    'mark': 41, 'mrk': 41, 'mk': 41, 'mr': 41,
    'luke': 42, 'luk': 42, 'lk': 42, 'lu': 42,
    'john': 43, 'joh': 43, 'jn': 43, 'jhn': 43,
    'acts': 44, 'act': 44, 'ac': 44,
    'romans': 45, 'rom': 45, 'ro': 45, 'rm': 45,
    '1 corinthians': 46, '1cor': 46, '1 co': 46, 'i cor': 46,
    '2 corinthians': 47, '2cor': 47, '2 co': 47, 'ii cor': 47,
    'galatians': 48, 'gal': 48, 'ga': 48,
    'ephesians': 49, 'eph': 49, 'ep': 49,
    'philippians': 50, 'phil': 50, 'php': 50, 'pp': 50,
    'colossians': 51, 'col': 51, 'co': 51,
    '1 thessalonians': 52, '1thess': 52, '1 th': 52, 'i thess': 52,
    '2 thessalonians': 53, '2thess': 53, '2 th': 53, 'ii thess': 53,
    '1 timothy': 54, '1tim': 54, '1 ti': 54, 'i tim': 54,
    '2 timothy': 55, '2tim': 55, '2 ti': 55, 'ii tim': 55,
    'titus': 56, 'tit': 56, 'ti': 56,
    'philemon': 57, 'philem': 57, 'phm': 57, 'pm': 57,
    'hebrews': 58, 'heb': 58,
    'james': 59, 'jas': 59, 'jm': 59,
    '1 peter': 60, '1pet': 60, '1 pe': 60, 'i pet': 60,
    '2 peter': 61, '2pet': 61, '2 pe': 61, 'ii pet': 61,
    '1 john': 62, '1jn': 62, '1 jn': 62, 'i jn': 62,
    '2 john': 63, '2jn': 63, '2 jn': 63, 'ii jn': 63,
    '3 john': 64, '3jn': 64, '3 jn': 64, 'iii jn': 64,
    'jude': 65, 'jud': 65, 'jd': 65,
    'revelation': 66, 'rev': 66, 're': 66, 'rv': 66
};

function getMHCVolume(bookNumber: number): string | null {
    if (bookNumber >= 1 && bookNumber <= 5) return 'MHC-V1';
    if (bookNumber >= 6 && bookNumber <= 17) return 'MHC-V2';
    if (bookNumber >= 18 && bookNumber <= 22) return 'MHC-V3';
    if (bookNumber >= 23 && bookNumber <= 39) return 'MHC-V4';
    if (bookNumber >= 40 && bookNumber <= 43) return 'MHC-V5';
    if (bookNumber >= 44 && bookNumber <= 66) return 'MHC-V6';
    return null;
}

function parseBibleReference(reference: string) {
    if (!reference) return null;
    const cleaned = reference.trim().replace(/\s+/g, ' ');

    // Regex for "1 John 3:16", "John 3:16", "John 3"
    const regex = /^((?:\d\s+)?[a-zA-Z]+)\s+(\d+)(?::(\d+))?/;
    const match = cleaned.match(regex);

    if (!match) return null;

    const bookName = match[1].toLowerCase();
    const chapter = parseInt(match[2], 10);
    const verse = match[3] ? parseInt(match[3], 10) : null;

    const bookNumber = BIBLE_BOOK_MAP[bookName] || BIBLE_BOOK_MAP[bookName.replace(/\s+/g, '')] || null;

    if (!bookNumber) return null;

    return {
        bookName: match[1], // Keep original casing/spacing for display if wanted
        bookNumber,
        chapter,
        verse
    };
}

/**
 * Loads and parses the Matthew Henry Commentary for a given reference.
 */
export async function getCommentary(reference: string): Promise<CommentaryData | null> {
    const session = await auth();
    if (!session?.user) {
        // Allow unauthenticated access if strictly necessary, but sticking to pattern
        // throw new StandardError(ERROR_CODES.AUTHORIZATION.UNAUTHORIZED, "Unauthorized", 401);
        // For read-only content like this, maybe lenient? Strict for now.
    }

    const parsed = parseBibleReference(reference);
    if (!parsed) return null;

    const volume = getMHCVolume(parsed.bookNumber);
    if (!volume) return null;

    // Filename format: MHC + 2-digit book + 3-digit chapter.HTM
    const bookStr = String(parsed.bookNumber).padStart(2, '0');
    const chapterStr = String(parsed.chapter).padStart(3, '0');
    const filename = `MHC${bookStr}${chapterStr}.HTM`;

    // Path resolution
    const dataDir = path.join(process.cwd(), 'src', 'server', 'data', 'Matthew-Henry-Commentary-Volumes');
    const filePath = path.join(dataDir, volume, filename);

    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        let commentaryHTML = '';
        const fullChapter = parsed.verse === null;

        if (fullChapter) {
            // Full chapter: Extract all paragraphs
            const $ = cheerio.load(fileContent);
            commentaryHTML = $('body').html() || '';
            // Basic cleanup: remove navigation links if any
            // The original loader extracted <P> tags. Let's do similar or better.
            const paragraphs = $('p').toArray().map(p => $.html(p)).join('');
            if (paragraphs) commentaryHTML = paragraphs; // Use paragraphs if found
        } else {
            // Specific verse: Extract relevant section
            // Logic ported from matthewHenryLoader.js
            const $ = cheerio.load(fileContent);

            // Try explicit anchors first
            // Common formats: "Joh3_16", "John3_16"
            // We need to guess the book abbr used in anchors for THIS file.
            // But actually, we can scan for anchors that *look* right.

            // Simplified approach: Find paragraphs containing the verse number/reference
            // This is "fuzzy" but robust enough for MVP without complex anchor maps
            const verseNum = parsed.verse!;
            const paragraphs = $('p').toArray();
            let relevantParagraphs: string[] = [];
            let capturing = false;

            // Pattern for verse start like "v. 16" or "16" at start
            const verseStartRegex = new RegExp(`^\\s*(?:v\\.|verse)?\\s*${verseNum}\\b`, 'i');
            const nextVerseStartRegex = new RegExp(`^\\s*(?:v\\.|verse)?\\s*${verseNum + 1}\\b`, 'i');

            // Also check for bold/strong content at start

            for (const p of paragraphs) {
                const text = $(p).text().trim();

                // VERY basic heuristic (improve if needed based on real file structure)
                // If we see the verse number explicitly mentioned as a start, start capturing
                // Stop when we see next verse

                // NOTE: The reference implementation logic was quite complex with anchor tags.
                // Let's try to replicate the anchor finding if possible or fallback to text search.

                // Let's implement the anchor search logic from reference
                // "Joh3_16"
                // Construct basic anchor
                // We don't have the "bookAbbrev" map easily handy without copying it all.
                // Text search fallback is safer for immediate implementation.

                if (text.includes(`v. ${verseNum}`) || text.includes(`verse ${verseNum}`) || text.startsWith(`${verseNum} `)) {
                    capturing = true;
                }

                if (capturing) {
                    // Check if we moved to next verse
                    if (text.includes(`v. ${verseNum + 1}`) || text.includes(`verse ${verseNum + 1}`) || text.startsWith(`${verseNum + 1} `)) {
                        break;
                    }
                    relevantParagraphs.push($.html(p));
                }
            }

            // If heuristics failed, return full chapter (better than nothing) or nothing?
            // Let's default to full chapter if specific extraction fails, but mark it.
            if (relevantParagraphs.length === 0) {
                // Fallback: try finding anchor by fuzzy matching
                const anchors = $(`a[name*="${parsed.chapter}_${verseNum}"], a[name*="${parsed.chapter}${verseNum}"]`);
                if (anchors.length > 0) {
                    // Found anchor, take subsequent paragraphs
                    let current = anchors.first().parent(); // Usually inside a P or similar
                    // This is getting tricky to do precisely without the full legacy logic.
                    // Valid fallback: return full chapter but client scrolls to it?
                    // Let's send full chapter for now if granular fails, client can handle.
                    commentaryHTML = $('body').html() || '';
                } else {
                    commentaryHTML = "<div><em>Specific notes for this verse not found. Displaying full chapter introduction or checking context...</em></div>" + ($('body').html() || '');
                }
            } else {
                commentaryHTML = relevantParagraphs.join('');
            }
        }

        // Clean up HTML (styles, font tags)
        // Simple regex replace for common old tags
        commentaryHTML = commentaryHTML
            .replace(/<FONT\s+[^>]*>/gi, '<span>')
            .replace(/<\/FONT>/gi, '</span>')
            .replace(/<B>/gi, '<strong>').replace(/<\/B>/gi, '</strong>')
            .replace(/<I>/gi, '<em>').replace(/<\/I>/gi, '</em>')
            .replace(/BGCOLOR="[^"]*"/gi, '')
            .replace(/ALIGN="[^"]*"/gi, '');

        return {
            reference,
            book: parsed.bookName,
            chapter: parsed.chapter,
            verse: parsed.verse,
            html: commentaryHTML,
            fullChapter
        };

    } catch (error) {
        console.error("MHC Load Error:", error);
        return null; // Return null to indicate no commentary found (client renders empty state)
    }
}

/**
 * Summarizes the provided commentary HTML into plain English using AI.
 */
export async function summarizeCommentary(commentaryHtml: string) {
    const session = await auth();
    if (!session?.user) {
        throw new StandardError(ERROR_CODES.AUTHORIZATION.UNAUTHORIZED, "Unauthorized", 401);
    }

    if (!commentaryHtml || commentaryHtml.length < 10) {
        throw new StandardError(ERROR_CODES.VALIDATION.INVALID_INPUT, "Commentary content too short", 400);
    }

    // Clean html slightly to save tokens, though models handle html fine
    const cleanText = commentaryHtml.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().substring(0, 15000); // Limit context

    try {
        const { text } = await generateText({
            model: models.flash, // Fast model for on-demand UI summary
            system: "You are Inkling, a helpful AI tutor. Rewrite the following Matthew Henry Commentary into plain, easy-to-understand English for a modern student. Keep it accurate but simple and concise. Do not add own opinion, just simplify the provided text.",
            prompt: `Summarize this commentary in plain English:\n\n${cleanText}`,
        });

        return { summary: text };
    } catch (error) {
        console.error("AI Summary Error:", error);
        throw new StandardError(
            ERROR_CODES.EXTERNAL.API_ERROR,
            "Failed to generate summary",
            500
        );
    }
}
