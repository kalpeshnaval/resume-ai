import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOrCreateCurrentDbUser } from "@/lib/db-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getOrCreateCurrentDbUser();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error("List Resumes error:", error);
    return NextResponse.json({ error: "Failed to load resumes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getOrCreateCurrentDbUser();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { title, contentJson, pdfUrl } = body;

    const resume = await prisma.resume.create({
      data: {
        title: title || "My Resume",
        contentJson,
        pdfUrl,
        userId: user.id
      }
    });

    return NextResponse.json({ resume });
  } catch (error) {
    console.error("Save Resume error:", error);
    return NextResponse.json({ error: "Failed to save resume" }, { status: 500 });
  }
}
