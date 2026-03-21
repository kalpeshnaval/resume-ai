import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { title, contentJson, pdfUrl, isPremiumTemplate } = body;

    const resume = await prisma.resume.create({
      data: {
        title: title || "My Resume",
        contentJson,
        pdfUrl,
        isPremiumTemplate: isPremiumTemplate || false,
        userId: user.id
      }
    });

    return NextResponse.json({ resume });
  } catch (error) {
    console.error("Save Resume error:", error);
    return NextResponse.json({ error: "Failed to save resume" }, { status: 500 });
  }
}
