import { NextResponse } from "next/server";
import { getCurrentUserOrg } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const { userId, organizationId } = await getCurrentUserOrg();
    return NextResponse.json({ userId, organizationId });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

