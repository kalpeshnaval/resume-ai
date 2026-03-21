import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { chatWithAI } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { instructions, currentData } = await req.json();
    if (!instructions) {
      return NextResponse.json({ error: "No instructions provided" }, { status: 400 });
    }

    const response = await chatWithAI(instructions, currentData);
    return NextResponse.json(response);
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assistant is currently unavailable." },
      { status: 500 }
    );
  }
}
