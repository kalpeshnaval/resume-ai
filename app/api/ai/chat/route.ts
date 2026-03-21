import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { chatWithAI } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user?.isPremium) {
      return NextResponse.json({ error: "Premium feature only" }, { status: 403 });
    }

    const { instructions, currentData } = await req.json();
    if (!instructions) {
      return NextResponse.json({ error: "No instructions provided" }, { status: 400 });
    }

    const response = await chatWithAI(instructions, currentData);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json({ error: "Assistant is currently unavailable." }, { status: 500 });
  }
}
