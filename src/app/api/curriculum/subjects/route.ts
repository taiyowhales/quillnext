import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { db } from "@/server/db";

export const runtime = "nodejs";

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

