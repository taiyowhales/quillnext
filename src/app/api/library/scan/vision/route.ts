import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateObject } from "ai";
import { models } from "@/lib/ai/config";
import { z } from "zod";

const BookExtractionSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().describe("The book title"),
  authors: z.array(z.string()).optional().describe("List of authors"),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  description: z.string().optional(),
  pageCount: z.number().int().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    // Convert base64 to data URL format for Gemini
    const imageDataUrl = `data:image/jpeg;base64,${image}`;

    // Use Gemini Vision API to extract book information
    const { object } = await generateObject({
      model: models.pro3, // Use Gemini 3 Pro for vision tasks
      schema: BookExtractionSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this book cover image and extract all visible information:
      
- ISBN (if visible)
- Title
- Authors
- Publisher
- Publication date
- Any description or subtitle
- Page count (if visible)

Extract as much information as possible from the cover. If information is not visible, leave it as optional.`,
            },
            {
              type: "image",
              image: imageDataUrl,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ book: object });
  } catch (error) {
    console.error("Vision API error:", error);
    return NextResponse.json(
      { error: "Failed to extract book information" },
      { status: 500 },
    );
  }
}

