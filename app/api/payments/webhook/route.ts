import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Payments have been removed. No webhook processing is required." },
    { status: 410 }
  );
}
