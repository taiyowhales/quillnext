export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";


export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { organizationId: _orgId } = await getCurrentUserOrg();
  const { isbn } = await request.json();

  if (!isbn) {
    return NextResponse.json({ error: "ISBN required" }, { status: 400 });
  }

  try {
    // Use Google Books API to fetch book data
    const googleBooksResponse = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
    );

    if (!googleBooksResponse.ok) {
      throw new Error("Google Books API failed");
    }

    const googleData = await googleBooksResponse.json();

    if (!googleData.items || googleData.items.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const volume = googleData.items[0]!.volumeInfo;
    const bookData = {
      title: volume.title,
      authors: volume.authors || [],
      publisher: volume.publisher,
      publishedDate: volume.publishedDate,
      description: volume.description,
      pageCount: volume.pageCount,
      coverUrl: volume.imageLinks?.thumbnail,
      isbn,
      externalSource: "GOOGLE_BOOKS",
      externalId: googleData.items[0]!.id,
    };

    return NextResponse.json({ book: bookData });
  } catch (error) {
    console.error("Book scan error:", error);
    return NextResponse.json({ error: "Failed to scan book" }, { status: 500 });
  }
}

