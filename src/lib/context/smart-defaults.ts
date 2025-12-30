import { db } from "@/server/db";

/**
 * Get smart defaults for context parameters
 */
export async function getSmartDefaults(organizationId: string, courseId?: string) {
  const defaults: {
    suggestedStudentId?: string;
    suggestedObjectives?: Array<{
      id: string;
      text: string;
      code: string;
      subtopic: {
        topic: {
          strand: {
            subject: { name: string };
            name: string;
          };
        };
      };
    }>;
  } = {};

  // If courseId provided, get enrolled students
  if (courseId) {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        students: {
          include: {
            student: true,
          },
        },
      },
    });

    if (course) {
      // Auto-select student if only one enrolled
      if (course.students.length === 1) {
        defaults.suggestedStudentId = course.students[0].studentId;
      }

      // Get objectives from course's subject/strand
      const objectives = await db.objective.findMany({
        where: {
          subtopic: {
            topic: {
              strand: {
                OR: [
                  { id: course.strandId || undefined },
                  { subjectId: course.subjectId },
                ],
              },
            },
          },
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
        take: 10,
        orderBy: { sortOrder: "asc" },
      });

      if (objectives.length > 0) {
        defaults.suggestedObjectives = objectives as any;
      }
    }
  } else {
    // If no course, check if there's only one student in organization
    const students = await db.student.findMany({
      where: { organizationId },
      take: 2,
    });

    if (students.length === 1) {
      defaults.suggestedStudentId = students[0].id;
    }
  }

  return defaults;
}

