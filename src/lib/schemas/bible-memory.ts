import { z } from "zod";

// Bible Memory Verse Action Schemas
export const addVerseSchema = z.object({
    studentId: z.string().cuid("Invalid student ID format"),
    reference: z.string().min(1, "Reference is required").max(100, "Reference too long"),
    text: z.string().optional(),
});

export const createFolderSchema = z.object({
    studentId: z.string().cuid("Invalid student ID format"),
    name: z.string().min(1, "Folder name is required").max(50, "Folder name too long"),
});

export const renameFolderSchema = z.object({
    folderId: z.string().cuid("Invalid folder ID format"),
    name: z.string().min(1, "Folder name is required").max(50, "Folder name too long"),
});

export const moveVerseSchema = z.object({
    verseId: z.string().cuid("Invalid verse ID format"),
    folderId: z.string().cuid("Invalid folder ID format").nullable(),
});

export const verseIdSchema = z.string().cuid("Invalid verse ID format");

export const folderIdSchema = z.string().cuid("Invalid folder ID format");

export const studentIdSchema = z.string().cuid("Invalid student ID format");

export const copyFolderSchema = z.object({
    folderId: z.string().cuid("Invalid folder ID format"),
    targetStudentId: z.string().cuid("Invalid student ID format"),
});
