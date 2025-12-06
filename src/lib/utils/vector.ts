import { db } from "@/server/db";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
// Note: Using OpenAI embeddings for now as they're well-established
// TODO: Switch to Gemini embeddings when fully supported in Vercel AI SDK

/**
 * Semantic search for books using pgvector
 * Uses cosine similarity to find relevant books based on query
 */
export async function searchBooks(query: string, limit = 5) {
  // 1. Generate embedding for user query
  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  });

  // 2. Perform vector similarity search (Cosine Distance)
  // We cast the embedding array to a string for the SQL query
  const vectorQuery = `[${queryEmbedding.join(",")}]`;

  // 3. Query using raw SQL (Prisma doesn't fully support vector queries yet)
  const books = await db.$queryRaw<
    Array<{
      id: string;
      title: string;
      summary: string | null;
      similarity: number;
    }>
  >`
    SELECT 
      id, 
      title, 
      summary, 
      1 - (embedding <=> ${vectorQuery}::vector) as similarity
    FROM "books"
    WHERE embedding IS NOT NULL
      AND 1 - (embedding <=> ${vectorQuery}::vector) > 0.5
    ORDER BY similarity DESC
    LIMIT ${limit};
  `;

  return books;
}

/**
 * Generate and store embedding for a book
 * Called when book content is extracted or updated
 */
export async function generateBookEmbedding(bookId: string, text: string) {
  // Generate embedding
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text,
  });

  // Store in database using raw SQL
  const vectorString = `[${embedding.join(",")}]`;

  await db.$executeRaw`
    UPDATE "books"
    SET embedding = ${vectorString}::vector
    WHERE id = ${bookId};
  `;

  return embedding;
}

/**
 * Find books similar to a given book
 * Useful for "related books" or "if you liked this" features
 */
export async function findSimilarBooks(bookId: string, limit = 5) {
  const books = await db.$queryRaw<
    Array<{
      id: string;
      title: string;
      summary: string | null;
      similarity: number;
    }>
  >`
    SELECT 
      b2.id, 
      b2.title, 
      b2.summary,
      1 - (b1.embedding <=> b2.embedding) as similarity
    FROM "books" b1
    CROSS JOIN "books" b2
    WHERE b1.id = ${bookId}
      AND b2.id != ${bookId}
      AND b1.embedding IS NOT NULL
      AND b2.embedding IS NOT NULL
      AND 1 - (b1.embedding <=> b2.embedding) > 0.5
    ORDER BY similarity DESC
    LIMIT ${limit};
  `;

  return books;
}

