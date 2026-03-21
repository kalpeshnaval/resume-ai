import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, PencilLine, Plus, Trash2 } from "lucide-react";
import { Suspense } from "react";

import ResumePreview from "@/components/ResumePreview";
import { getOrCreateCurrentDbUser } from "@/lib/db-user";
import { prisma } from "@/lib/prisma";

type TemplateType = "standard" | "modern" | "minimalist" | "creative" | "executive" | "tech";

type ResumeData = {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    year: string;
  }>;
  skills: string;
};

type StoredResumePayload = {
  data: ResumeData;
  template?: TemplateType;
};

const emptyResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  },
  experience: [],
  education: [],
  skills: "",
};

type ResumeRecord = {
  id: string;
  title: string;
  contentJson: string;
  updatedAt: Date;
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Ensure user exists in our DB
  const dbUser = await getOrCreateCurrentDbUser();

  if (!dbUser) {
    redirect("/");
  }

  // Fetch their resumes
  const resumes = await prisma.resume.findMany({
    where: { userId: dbUser.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {dbUser.name || "User"}</h1>
          <p className="text-foreground/60 mt-2">Manage your resumes and cover letters here.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/builder" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Resume
          </Link>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Your Resumes</h2>
      
      {resumes.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No resumes yet</h3>
          <p className="text-foreground/60 mb-6 max-w-sm">
            You havent created any resumes yet. Start building your first professional resume now.
          </p>
          <Link 
            href="/builder" 
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium shadow hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Build Resume
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="overflow-hidden rounded-2xl border border-border bg-card/95 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg group relative">
              <div className="mb-4 h-56 w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
                <ResumeCardPreview resume={resume} />
              </div>
              <h3 className="truncate pr-8 text-base font-semibold">{resume.title}</h3>
              <p className="mt-1 text-sm text-foreground/50">
                Updated {new Date(resume.updatedAt).toLocaleDateString()}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/builder?resumeId=${resume.id}`}
                  className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </Link>
                <DeleteResumeButton resumeId={resume.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="h-10 w-72 rounded-xl bg-muted/60" />
          <div className="h-5 w-80 rounded-lg bg-muted/40" />
        </div>
        <div className="h-11 w-48 rounded-xl bg-muted/50" />
      </div>
      <div className="mb-6 h-7 w-36 rounded-lg bg-muted/50" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-border bg-card/95 p-4">
            <div className="mb-4 h-56 w-full rounded-xl bg-muted/40" />
            <div className="h-6 w-40 rounded-md bg-muted/50" />
            <div className="mt-2 h-4 w-28 rounded-md bg-muted/35" />
            <div className="mt-4 flex gap-2">
              <div className="h-9 w-20 rounded-md bg-muted/45" />
              <div className="h-9 w-24 rounded-md bg-muted/35" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function ResumeCardPreview({ resume }: { resume: ResumeRecord }) {
  const parsedResume = parseResumeContent(resume.contentJson);
  const previewScale = 0.16;
  const previewWidth = 794 * previewScale;
  const previewHeight = 1123 * previewScale;

  if (!parsedResume) {
    return (
      <div className="flex h-full items-center justify-center bg-accent/50">
        <FileText className="w-12 h-12 text-primary/40" />
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center overflow-hidden p-4">
      <div
        className="relative overflow-hidden rounded-md shadow-[0_16px_40px_rgba(15,23,42,0.35)]"
        style={{
          width: `${previewWidth}px`,
          height: `${previewHeight}px`,
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ transform: `scale(${previewScale})` }}
        >
          <ResumePreview data={parsedResume.data} template={parsedResume.template} />
        </div>
      </div>
    </div>
  );
}

function parseResumeContent(contentJson: string): { data: ResumeData; template: TemplateType } | null {
  try {
    const parsed = JSON.parse(contentJson) as ResumeData | StoredResumePayload;

    if ("data" in parsed) {
      return {
        data: normalizeResumeData(parsed.data),
        template: parsed.template ?? "standard",
      };
    }

    return {
      data: normalizeResumeData(parsed),
      template: "standard",
    };
  } catch {
    return null;
  }
}

function normalizeResumeData(data: Partial<ResumeData> | undefined): ResumeData {
  return {
    personalInfo: {
      ...emptyResumeData.personalInfo,
      ...(data?.personalInfo ?? {}),
    },
    experience: Array.isArray(data?.experience) ? data.experience : [],
    education: Array.isArray(data?.education) ? data.education : [],
    skills: typeof data?.skills === "string" ? data.skills : "",
  };
}

function DeleteResumeButton({ resumeId }: { resumeId: string }) {
  return (
    <form
      action={async () => {
        "use server";

        const { userId } = await auth();
        if (!userId) {
          redirect("/");
        }

        const dbUser = await getOrCreateCurrentDbUser();
        if (!dbUser) {
          redirect("/");
        }

        const resume = await prisma.resume.findFirst({
          where: {
            id: resumeId,
            userId: dbUser.id,
          },
        });

        if (!resume) {
          return;
        }

        await prisma.resume.delete({
          where: { id: resume.id },
        });

        redirect("/dashboard");
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </form>
  );
}
