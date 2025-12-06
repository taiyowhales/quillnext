import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/server/db";

/**
 * Curriculum Router
 * Provides access to Academic Spine data and context-aware tools
 */
export const curriculumRouter = createTRPCRouter({
  /**
   * Get available tools for a specific strand
   * Implements "Smart Tooling" - shows context-aware generators
   */
  getAvailableTools: publicProcedure
    .input(
      z.object({
        strandId: z.string().optional(),
        subjectId: z.string().optional(),
        includeGeneric: z.boolean().default(true),
      }),
    )
    .query(async ({ input }) => {
      const { strandId, subjectId, includeGeneric } = input;

      // Find specialized tools for this strand
      const specializedTools = strandId
        ? await db.resourceKind.findMany({
            where: {
              strandId,
              isSpecialized: true,
            },
            include: {
              strand: {
                include: {
                  subject: true,
                },
              },
            },
            orderBy: {
              label: "asc",
            },
          })
        : [];

      // Find subject-level tools
      const subjectTools = subjectId
        ? await db.resourceKind.findMany({
            where: {
              subjectId,
              isSpecialized: false,
            },
            include: {
              subject: true,
            },
            orderBy: {
              label: "asc",
            },
          })
        : [];

      // Get generic tools (available to all)
      const genericTools = includeGeneric
        ? await db.resourceKind.findMany({
            where: {
              strandId: null,
              subjectId: null,
              isSpecialized: false,
            },
            orderBy: {
              label: "asc",
            },
          })
        : [];

      // Combine and deduplicate
      const allTools = [...specializedTools, ...subjectTools, ...genericTools];
      const uniqueTools = Array.from(
        new Map(allTools.map((tool) => [tool.id, tool])).values(),
      );

      // Recommended tools are specialized ones
      const recommended = specializedTools.map((tool) => tool.id);

      return {
        tools: uniqueTools,
        recommended,
        allTools: genericTools,
      };
    }),

  /**
   * Get objectives for a subject/grade
   * Used for Course Builder auto-fill
   */
  getObjectives: publicProcedure
    .input(
      z.object({
        subjectId: z.string(),
        gradeLevel: z.number().int().min(0).max(12).optional(),
        strandId: z.string().optional(),
        topicId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { subjectId, gradeLevel, strandId, topicId } = input;

      const objectives = await db.objective.findMany({
        where: {
          subtopic: {
            topic: {
              strand: {
                subjectId,
                ...(strandId ? { id: strandId } : {}),
              },
              ...(topicId ? { id: topicId } : {}),
            },
          },
          ...(gradeLevel !== undefined ? { gradeLevel } : {}),
        },
        include: {
          subtopic: {
            include: {
              topic: {
                include: {
                  strand: {
                    include: {
                      subject: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      });

      return objectives;
    }),

  /**
   * Get full Academic Spine hierarchy
   * Used for navigation and selection
   */
  getSpineHierarchy: publicProcedure
    .input(
      z.object({
        subjectId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (input.subjectId) {
        // Get single subject with full hierarchy
        const subject = await db.subject.findUnique({
          where: { id: input.subjectId },
          include: {
            strands: {
              include: {
                topics: {
                  include: {
                    subtopics: {
                      include: {
                        objectives: {
                          orderBy: {
                            sortOrder: "asc",
                          },
                        },
                      },
                      orderBy: {
                        sortOrder: "asc",
                      },
                    },
                  },
                  orderBy: {
                    sortOrder: "asc",
                  },
                },
              },
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        });

        return subject ? [subject] : [];
      }

      // Get all subjects with strands
      const subjects = await db.subject.findMany({
        include: {
          strands: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      });

      return subjects;
    }),

  /**
   * Get a single objective with full context
   * Used for prompt building
   */
  getObjective: publicProcedure
    .input(
      z.object({
        objectiveId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const objective = await db.objective.findUnique({
        where: { id: input.objectiveId },
        include: {
          subtopic: {
            include: {
              topic: {
                include: {
                  strand: {
                    include: {
                      subject: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!objective) {
        throw new Error(`Objective ${input.objectiveId} not found`);
      }

      return objective;
    }),
});

