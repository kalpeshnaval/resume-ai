import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOrCreateCurrentDbUser } from "@/lib/db-user";
import { generateCoverLetter } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getOrCreateCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyName, companyAddress, userContext, resumeFile } = await req.json();
    if (!companyName) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    const text = await generateCoverLetter({
      companyName,
      companyAddress,
      userContext,
      resumeFile,
    });
    
    // Save to DB (optional but good for tracking)
    await prisma.coverLetter.create({
      data: {
        companyName,
        companyAddress,
        content: text,
        userId: user.id
      }
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI Cover Letter error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to generate" }, { status: 500 });
  }
}
