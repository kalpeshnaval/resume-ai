import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export async function getOrCreateCurrentDbUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    throw new Error("Authenticated user is missing a primary email address.");
  }

  return prisma.user.upsert({
    where: { clerkUserId: clerkUser.id },
    update: {
      email: primaryEmail,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      clerkUserId: clerkUser.id,
      email: primaryEmail,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
      imageUrl: clerkUser.imageUrl,
    },
  });
}
