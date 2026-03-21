import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { enhanceResumeBullet } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: check premium status in a real app,
    // though the prompt implies we integrate free AI for premium users.
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user?.isPremium) {
      return NextResponse.json({ error: "Premium feature only" }, { status: 403 });
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
