"use server";

import { db } from "@/server/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2).max(50),
  image: z.string().url().optional().or(z.literal("")),
});

export async function updateProfile(data: z.infer<typeof profileSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = profileSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: "Invalid data" };
  }

  // Removed defensive try/catch - let Prisma errors bubble up
  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: result.data.name,
      image: result.data.image || null,
    },
  });

  revalidatePath("/");
  return { success: true };
}
