'use server';

import { auth } from "@/auth";

export async function verifyPin(pin: string): Promise<boolean> {
    const session = await auth();
    if (!session?.user) {
        return false;
    }

    // Mock PIN verification for MVP
    // In a real implementation, this would check against a user's configured PIN in the database
    return pin === "1234";
}
