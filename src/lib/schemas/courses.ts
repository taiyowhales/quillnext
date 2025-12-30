import { z } from "zod";

// -----------------------------------------------------------------------
// Course Block Schemas
// -----------------------------------------------------------------------

export const courseBlockSchema = z.object({
  kind: z.enum(["UNIT", "MODULE", "SECTION", "CHAPTER", "LESSON"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  position: z.number().int().positive(),
  parentBlockId: z.string().optional(),
  topicId: z.string().optional(),
  subtopicId: z.string().optional(),
  bookId: z.string().optional(),
  bookChapterId: z.string().optional(),
});

export type CourseBlockFormData = z.infer<typeof courseBlockSchema>;

