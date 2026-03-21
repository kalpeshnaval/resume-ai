import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Resume } from "@prisma/client";
import Link from "next/link";
import { FileText, Plus, Star, Trash2 } from "lucide-react";

export const unstable_instant = { prefetch: 'static' };

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/");
  }

  // Ensure user exists in our DB
  let dbUser = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkUserId: userId,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        imageUrl: user.imageUrl,
      },
    });
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
          {!dbUser.isPremium && (
            <Link 
              href="/premium" 
              className="bg-linear-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Star className="w-4 h-4" /> Upgrade to Premium
            </Link>
          )}
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
          {resumes.map((resume: Resume) => (
            <div key={resume.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all group relative">
              <div className="aspect-[1/1.4] w-full bg-accent/50 rounded-lg mb-4 flex items-center justify-center border border-border">
                <FileText className="w-12 h-12 text-primary/40" />
              </div>
              <h3 className="font-semibold text-lg truncate pr-8">{resume.title}</h3>
              <p className="text-sm text-foreground/50 mt-1">
                Updated {new Date(resume.updatedAt).toLocaleDateString()}
              </p>
              
              <button className="absolute bottom-6 right-6 p-2 bg-destructive/10 text-destructive rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
