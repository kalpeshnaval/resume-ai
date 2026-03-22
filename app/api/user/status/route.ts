import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getOrCreateCurrentDbUser } from "@/lib/db-user";

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await getOrCreateCurrentDbUser();

    return NextResponse.json({
      isSignedIn: !!userId,
      hasAccount: !!user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("During prerendering")
    ) {
      return NextResponse.json({ isSignedIn: false, hasAccount: false }, { status: 200 });
    }

    console.error("Error fetching user status:", error);
    return NextResponse.json({ isSignedIn: false, hasAccount: false }, { status: 500 });
  }
}
