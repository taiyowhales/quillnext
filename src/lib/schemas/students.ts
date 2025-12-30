import * as z from "zod";

// -----------------------------------------------------------------------
// Student Schemas
// -----------------------------------------------------------------------

export const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  preferredName: z.string().optional(),
  birthdate: z.date({
    message: "Birthdate is required",
  }),
  currentGrade: z.string().min(1, "Current grade is required"),
  sex: z.enum(["MALE", "FEMALE"]).optional(),
  learningDifficulties: z.array(z.string()).optional(),

  // Neurodiverse Support
  supportLabels: z.array(z.string()).optional(),
  supportProfile: z.record(z.string(), z.any()).optional(), // Storing as simple object for now
  supportIntensity: z.string().optional(),
});

export type StudentFormData = z.infer<typeof studentSchema>;

