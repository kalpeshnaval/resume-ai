import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { enhanceResumeBullet } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bulletPoint } = await req.json();
    if (!bulletPoint) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const enhanced = await enhanceResumeBullet(bulletPoint);
    return NextResponse.json({ enhanced });
  } catch (error) {
    console.error("AI Enhance error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to enhance" }, { status: 500 });
  }
}
