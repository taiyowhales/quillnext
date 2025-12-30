import "server-only";
import { db } from "@/server/db";
import { academicSpineCacheStrategy } from "@/lib/utils/prisma-cache";

/**
 * Get available tools for a specific strand
 * Implements "Smart Tooling" - shows context-aware generators
 */
export async function getAvailableTools(input: {
    strandId?: string;
    subjectId?: string;
    includeGeneric?: boolean;
}) {
    const { strandId, subjectId, includeGeneric = true } = input;

    // Find specialized tools for this strand (with caching)
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
            cacheStrategy: academicSpineCacheStrategy,
        })
        : [];

    // Find subject-level tools (with caching)
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
            cacheStrategy: academicSpineCacheStrategy,
        })
        : [];

    // Get generic tools (available to all, with caching)
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
            cacheStrategy: academicSpineCacheStrategy,
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
}

/**
 * Get objectives for a subject/grade
 * Used for Course Builder auto-fill
 */
export async function getObjectives(input: {
    subjectId: string;
    gradeLevel?: number;
    strandId?: string;
    topicId?: string;
}) {
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
}

/**
 * Get full Academic Spine hierarchy
 * Used for navigation and selection
 */
export async function getSpineHierarchy(input: { subjectId?: string }) {
    if (input.subjectId) {
        // Get single subject with full hierarchy (with caching)
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
            cacheStrategy: academicSpineCacheStrategy,
        });

        return subject ? [subject] : [];
    }

    // Get all subjects with strands (with caching - this data rarely changes)
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
        cacheStrategy: academicSpineCacheStrategy,
    });

    return subjects;
}

/**
 * Get a single objective with full context
 * Used for prompt building
 */
export async function getObjective(objectiveId: string) {
    const objective = await db.objective.findUnique({
        where: { id: objectiveId },
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
        cacheStrategy: academicSpineCacheStrategy,
    });

    if (!objective) {
        throw new Error(`Objective ${objectiveId} not found`);
    }

    return objective;
}
