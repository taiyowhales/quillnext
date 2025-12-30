import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMasterContext } from "@/lib/context/master-context";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await request.json();
  const context = await getMasterContext(params);

  return NextResponse.json(context);
}

