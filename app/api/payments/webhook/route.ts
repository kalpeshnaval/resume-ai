import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    const userId = session?.metadata?.userId;

    if (!userId) {
      return new NextResponse("User ID not found in metadata", { status: 400 });
    }

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { isPremium: true },
    });
  }

  return new NextResponse(null, { status: 200 });
}
