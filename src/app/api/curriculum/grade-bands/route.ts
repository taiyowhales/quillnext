import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { db } from "@/server/db";

export async function GET() {
  const gradeBands = await db.gradeBand.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      minGrade: true,
      maxGrade: true,
    },
    orderBy: {
      minGrade: "asc",
    },
  });

  return NextResponse.json({ gradeBands });
}

