import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";
import { searchBooks } from "@/lib/utils/vector";
import { db } from "@/server/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { organizationId } = await getCurrentUserOrg();
  if (!organizationId) {
    return NextResponse.json({ error: "User has no organization" }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  try {
    // Use semantic search
    const results = await searchBooks(query, 20);

    // Get full book data
    const bookIds = results.map((r) => r.id);
    const books = await db.book.findMany({
      where: {
        id: { in: bookIds },
        organizationId,
      },
      include: {
        subject: true,
        strand: true,
      },
    });

    // Sort by similarity
    const sortedBooks = bookIds
      .map((id) => books.find((b) => b.id === id))
      .filter((b): b is NonNullable<typeof b> => b !== undefined);

    return NextResponse.json({ books: sortedBooks });
  } catch (error) {
    console.error("Search error:", error);
    // Fallback to text search
    const books = await db.book.findMany({
      where: {
        organizationId,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        subject: true,
        strand: true,
      },
      take: 20,
    });

    return NextResponse.json({ books });
  }
}

