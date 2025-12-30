import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET() {
  const subjects = await db.subject.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return NextResponse.json({ subjects });
}

