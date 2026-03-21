"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upgradeToPremium() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { clerkUserId: userId },
    data: { isPremium: true }
  });

  revalidatePath("/dashboard");
  revalidatePath("/builder");
  revalidatePath("/cover-letter");
  
  return { success: true };
}
