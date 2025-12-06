import { z } from "zod";

// -----------------------------------------------------------------------
// Family Blueprint Wizard Schemas
// -----------------------------------------------------------------------

export const instructorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  whatStudentsCall: z.string().optional(), // e.g., "Mom", "Dad", "Ms. Smith"
  email: z.string().email().optional(),
});

export const classroomSchema = z.object({
  name: z.string().min(1, "Classroom name is required"),
  description: z.string().optional(),
  instructors: z.array(instructorSchema).min(1, "At least one instructor is required"),
  instructorPin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
  educationalPhilosophy: z.enum([
    "TRADITIONAL",
    "CLASSICAL",
    "CHARLOTTE_MASON",
    "UNIT_STUDIES",
    "ONLINE_VIRTUAL",
    "UNSCHOOL",
    "MONTESSORI",
    "OTHER",
  ]),
  educationalPhilosophyOther: z.string().optional(),
  academicGoals: z.string().optional(),
  faithBackground: z.enum([
    "PROTESTANT",
    "CATHOLIC",
    "ORTHODOX",
    "NON_DENOMINATIONAL",
    "INTERFAITH",
    "SECULAR",
    "OTHER",
  ]),
  faithBackgroundOther: z.string().optional(),
});

export const scheduleSchema = z.object({
  schoolYearStartDate: z.date(),
  schoolYearEndDate: z.date(),
  schoolDaysOfWeek: z.array(z.number().int().min(0).max(6)).min(1), // 0=Sunday, 1=Monday, etc.
  daysPerWeek: z.number().int().min(1).max(7).optional(), // For "varies week by week"
  dailyStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:MM format
  dailyEndTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  dailyTimesVary: z.boolean().default(false),
  breaks: z
    .array(
      z.object({
        type: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "RECESS", "EXERCISE", "SPORTS"]),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        durationMinutes: z.number().int().positive().optional(),
      }),
    )
    .optional(),
  plannedOffDays: z.array(z.date()).optional(), // Calendar selection
});

export const environmentSchema = z.object({
  philosophyPreferences: z.array(z.string()).optional(),
  resourceTypes: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  deviceTypes: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  faithBackground: z.string().optional(), // Additional context
});

// Combined Family Blueprint Schema
export const familyBlueprintSchema = z.object({
  // Step 1: Classroom
  classroom: classroomSchema,
  // Step 2: Schedule
  schedule: scheduleSchema,
  // Step 3: Environment
  environment: environmentSchema,
});

export type Instructor = z.infer<typeof instructorSchema>;
export type Classroom = z.infer<typeof classroomSchema>;
export type Schedule = z.infer<typeof scheduleSchema>;
export type Environment = z.infer<typeof environmentSchema>;
export type FamilyBlueprint = z.infer<typeof familyBlueprintSchema>;

// Progressive save schemas (for step-by-step saving)
export const classroomStepSchema = classroomSchema;
export const scheduleStepSchema = scheduleSchema;
export const environmentStepSchema = environmentSchema;

