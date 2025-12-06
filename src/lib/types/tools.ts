import { z } from "zod";

// -----------------------------------------------------------------------
// Generator/Tool Type Definitions
// Based on GENERATOR_CONTENT_TYPES.YAML structure
// -----------------------------------------------------------------------

/**
 * Generator configuration schema matching the YAML structure
 * This ensures type safety when working with ResourceKind data
 */
export const GeneratorConfigSchema = z.object({
  id: z.string(), // Unique identifier (e.g., "primary_source_analysis")
  label: z.string(), // Display name (e.g., "Primary Source Analysis")
  description: z.string().optional(),
  // The 'prompt_context' from YAML becomes strict instruction
  systemInstruction: z.string().optional(),
  // Form fields definition for the generator UI
  inputSchema: z.record(z.string(), z.any()).optional(),
  // Content type enum
  contentType: z.enum([
    "WORKSHEET",
    "TEMPLATE",
    "PROMPT",
    "GUIDE",
    "QUIZ",
    "RUBRIC",
    "LESSON_PLAN",
    "OTHER",
  ]),
  // Whether this is specialized to a specific strand
  isSpecialized: z.boolean().default(false),
});

export type GeneratorConfig = z.infer<typeof GeneratorConfigSchema>;

/**
 * Tool availability response
 * Used by the frontend to show context-aware tools
 */
export const AvailableToolsSchema = z.object({
  tools: z.array(GeneratorConfigSchema),
  recommended: z.array(z.string()).optional(), // IDs of recommended tools
  allTools: z.array(GeneratorConfigSchema).optional(), // Generic tools available to all
});

export type AvailableTools = z.infer<typeof AvailableToolsSchema>;

/**
 * Generator input schema (dynamic based on generator type)
 * This is what the user fills out in the form
 */
export const GeneratorInputSchema = z.object({
  generatorId: z.string(),
  studentId: z.string().optional(),
  subjectId: z.string().optional(),
  strandId: z.string().optional(),
  objectiveId: z.string().optional(),
  // Dynamic fields based on generator type
  fields: z.record(z.string(), z.any()),
});

export type GeneratorInput = z.infer<typeof GeneratorInputSchema>;

/**
 * Omni-Generator Tool Definition
 * Used for the unified generator endpoint with tool selection
 */
export const OmniGeneratorToolSchema = z.object({
  name: z.string(), // Tool name (e.g., "generateQuiz", "generateWorksheet")
  description: z.string(),
  parameters: z.object({
    type: z.literal("object"),
    properties: z.record(z.string(), z.any()),
    required: z.array(z.string()).optional(),
  }),
});

export type OmniGeneratorTool = z.infer<typeof OmniGeneratorToolSchema>;

