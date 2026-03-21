import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Payments have been removed. All features are free for signed-in users." },
    { status: 410 }
  );
}
