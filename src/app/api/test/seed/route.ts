import { db } from "@/server/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Try to get current session
        let organizationId: string | null | undefined;
        let userId: string | undefined;

        const { auth } = await import("@/auth");
        const session = await auth();

        if (session?.user?.id) {
            userId = session.user.id;
            const result = await db.user.findUnique({ where: { id: userId }, select: { organizationId: true } });
            organizationId = result?.organizationId;
        }

        // Fallback if no session
        if (!organizationId) {
            let org = await db.organization.findFirst({ where: { name: "Test Org" } });
            if (!org) {
                org = await db.organization.create({
                    data: {
                        name: "Test Org",
                        type: "PARENT_INSTRUCTOR"
                    }
                });
            }
            organizationId = org.id;
        }

        if (!userId) {
            let user = await db.user.findFirst({ where: { email: "test@example.com" } });
            if (!user) {
                user = await db.user.create({
                    data: {
                        name: "Test User",
                        email: "test@example.com",
                        organizationId: organizationId
                    }
                });
            }
            userId = user.id;
        }

        // 3. Ensure Subject
        // Note: Subject in schema does NOT have organizationId? Let's check schema.
        // Assuming Subject is global or standard. If local, it needs relation.
        // Based on previous errors, Subject likely doesn't have organizationId in create payload if it's not in schema.
        // I will omit organizationId for Subject if it failed before.

        let subject = await db.subject.findFirst({ where: { name: "Literature" } });
        if (!subject) {
            subject = await db.subject.create({
                data: {
                    name: "Literature",
                    code: "LIT",
                    sortOrder: 1,
                    // No slug, no organizationId (based on previous errors and schema check which I will do)
                }
            });
        }

        // 4. Create Book
        let book = await db.book.findFirst({ where: { title: "The Hobbit", organizationId } });
        if (!book) {
            book = await db.book.create({
                data: {
                    organizationId: organizationId!,
                    addedByUserId: userId!,
                    title: "The Hobbit",
                    authors: ["J.R.R. Tolkien"],
                    description: "A fantasy novel about Bilbo Baggins.",
                    summary: "Bilbo Baggins, a hobbit, is swept into an epic quest to reclaim the lost Kingdom of Erebor from the fearsome dragon Smaug. Joined by thirteen dwarves and the wizard Gandalf the Grey, Bilbo journeys through the Wild, facing goblins, wargs, and the creature Gollum, from whom he gains a magic ring.",
                    subjectId: subject.id,
                    externalSource: "MANUAL",
                    extractionStatus: "EXTRACTED",
                }
            });
        }

        // 5. Ensure Resource Kinds
        let kind = await db.resourceKind.findFirst({ where: { code: "worksheet_basic" } });
        if (!kind) {
            kind = await db.resourceKind.create({
                data: {
                    code: "worksheet_basic",
                    label: "Basic Worksheet",
                    description: "Standard Q&A worksheet",
                    contentType: "WORKSHEET"
                }
            });
        }

        return NextResponse.json({ success: true, bookId: book.id, userId: userId });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to seed: " + (error as Error).message }, { status: 500 });
    }
}
