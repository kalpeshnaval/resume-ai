import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOrCreateCurrentDbUser } from "@/lib/db-user";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getOwnedResume(resumeId: string, clerkUserId: string) {
  const user = await getOrCreateCurrentDbUser();

  if (!user || user.clerkUserId !== clerkUserId) {
    return { user: null, resume: null };
  }

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
  });

  return { user, resume };
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const { resume } = await getOwnedResume(id, userId);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ resume });
  } catch (error) {
    console.error("Get Resume error:", error);
    return NextResponse.json({ error: "Failed to load resume" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const { resume } = await getOwnedResume(id, userId);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const body = await req.json();
    const updatedResume = await prisma.resume.update({
      where: { id: resume.id },
      data: {
        title: body.title || resume.title,
        contentJson: body.contentJson ?? resume.contentJson,
        pdfUrl: body.pdfUrl ?? resume.pdfUrl,
      },
    });

    return NextResponse.json({ resume: updatedResume });
  } catch (error) {
    console.error("Update Resume error:", error);
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const { resume } = await getOwnedResume(id, userId);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    await prisma.resume.delete({
      where: { id: resume.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Resume error:", error);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
