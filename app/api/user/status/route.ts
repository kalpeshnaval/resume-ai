import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ isPremium: false }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { isPremium: true }
    });

    return NextResponse.json({ isPremium: !!user?.isPremium });
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json({ isPremium: false }, { status: 500 });
  }
}
