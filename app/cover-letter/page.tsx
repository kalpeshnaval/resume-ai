"use client";

import { useState, type ChangeEvent } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Building2, Download, FileText, Loader2, MapPin, Sparkles, Upload } from "lucide-react";

import { exportElementToPdf } from "@/lib/pdf";

type ResumeReferenceFile = {
  name: string;
  type: string;
  data: string;
};

async function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Unable to read the selected resume."));
        return;
      }

      resolve(result.split(",")[1] || "");
    };

    reader.onerror = () => reject(new Error("Unable to read the selected resume."));
    reader.readAsDataURL(file);
  });
}

export default function CoverLetterPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [userContext, setUserContext] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [resumeFile, setResumeFile] = useState<ResumeReferenceFile | null>(null);
  const [resumeUploadError, setResumeUploadError] = useState("");

  const handleGenerate = async () => {
    if (!companyName.trim()) return;
    if (!isSignedIn) {
      alert("Please sign in to generate cover letters.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, companyAddress, userContext, resumeFile }),
      });

      if (res.ok) {
        const { text } = await res.json();
        setGeneratedContent(text);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to generate cover letter. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error generating cover letter.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!isSignedIn) {
      alert("Please sign in to download your cover letter.");
      return;
    }

    const element = document.getElementById("letter-preview");
    if (!element || !generatedContent) return;

    try {
      await exportElementToPdf({
        element,
        fileName: `${companyName || "Company"}_Cover_Letter.pdf`,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to download PDF.");
    }
  };

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!["application/pdf", "text/plain"].includes(file.type)) {
      setResumeUploadError("Please upload a PDF or TXT resume.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setResumeUploadError("Please keep the resume file under 4MB.");
      return;
    }

    try {
      setResumeUploadError("");
      const data = await readFileAsBase64(file);
      setResumeFile({
        name: file.name,
        type: file.type,
        data,
      });
    } catch (error) {
      console.error(error);
      setResumeUploadError("The resume could not be processed. Please try another file.");
    }
  };

  return (
    <main className="container mx-auto flex-1 max-w-6xl px-4 py-8 sm:py-12">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full space-y-6 md:w-1/3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <Sparkles className="h-6 w-6 text-primary" />
              Cover Letter AI
            </h1>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Building2 className="h-4 w-4" /> Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  className="h-11 w-full rounded-xl border border-border bg-accent/30 px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" /> Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mountain View, CA"
                  className="h-11 w-full rounded-xl border border-border bg-accent/30 px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" /> Role Notes
                </label>
                <textarea
                  placeholder="Target role, strengths, job description highlights, or anything the AI should emphasize..."
                  className="min-h-28 w-full rounded-xl border border-border bg-accent/30 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                  value={userContext}
                  onChange={(e) => setUserContext(e.target.value)}
                />
              </div>

              <div className="space-y-3 rounded-2xl border border-dashed border-border bg-accent/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Upload className="h-4 w-4" />
                  Upload Resume Reference
                </div>
                <p className="text-xs text-foreground/60">
                  Upload a PDF or TXT resume so the AI can use your real experience as source material.
                </p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100">
                  <Upload className="h-4 w-4" />
                  Choose Resume
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={handleResumeUpload}
                  />
                </label>
                {resumeFile && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    Using resume reference: {resumeFile.name}
                  </div>
                )}
                {resumeUploadError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {resumeUploadError}
                  </div>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !companyName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {isGenerating ? "Generating..." : "Generate with AI"}
              </button>
            </div>
          </div>

          {!isSignedIn && isLoaded && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <h3 className="mb-2 font-bold text-foreground">Sign in required</h3>
              <p className="mb-4 text-sm text-foreground/70">Sign in to generate AI cover letters and download them as PDF.</p>
              <SignInButton mode="modal">
                <button className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                  Sign In
                </button>
              </SignInButton>
            </div>
          )}
        </div>

        <div className="w-full md:w-2/3">
          <div className="flex min-h-[420px] flex-col items-center rounded-2xl bg-accent/50 p-4 sm:min-h-[520px] sm:p-6 md:min-h-[700px] md:p-8">
            {generatedContent ? (
              <div className="animate-in w-full space-y-6 fade-in zoom-in-95 duration-500">
                <div className="no-print mb-4 flex justify-center gap-3 sm:justify-end">
                  <button
                    onClick={handleDownload}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition-colors hover:bg-slate-100 sm:w-auto"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                </div>

                <div className="flex justify-start overflow-x-auto pb-4 sm:justify-center">
                  <div
                    id="letter-preview"
                    className="min-h-[1123px] w-[794px] rounded-sm bg-white px-8 py-10 font-serif text-[15px] leading-7 text-black shadow-2xl sm:px-12 sm:py-12 md:px-16 md:py-14"
                  >
                    <p className="whitespace-pre-wrap">{generatedContent}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-20 text-center sm:py-24 md:py-32">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold">Your Cover Letter will appear here</h2>
                <p className="mx-auto max-w-xs text-foreground/50">
                  Fill in the company details and let AI craft a professional letter using your resume as reference.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
