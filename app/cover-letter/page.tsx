"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Building2, Download, FileText, Loader2, MapPin, Sparkles, Upload, X } from "lucide-react";

import CoverLetterPreview, { type CoverLetterTemplate } from "@/components/CoverLetterPreview";
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
  const mobilePreviewScale = 0.32;
  const mobilePreviewWidth = 794 * mobilePreviewScale;
  const mobilePreviewHeight = 1123 * mobilePreviewScale;
  const mobileZoomScale = 0.62;
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [userContext, setUserContext] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [template, setTemplate] = useState<CoverLetterTemplate>("classic");
  const [isPreviewZoomOpen, setIsPreviewZoomOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<ResumeReferenceFile | null>(null);
  const [resumeUploadError, setResumeUploadError] = useState("");
  const desktopPreviewRef = useRef<HTMLDivElement | null>(null);
  const mobilePreviewRef = useRef<HTMLDivElement | null>(null);

  const getDownloadElement = () => {
    const candidates = [desktopPreviewRef.current, mobilePreviewRef.current];
    return candidates.find((candidate) => candidate && candidate.offsetWidth > 0 && candidate.offsetHeight > 0) ?? null;
  };

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

    const element = getDownloadElement();
    if (!generatedContent || !element) return;

    try {
      await exportElementToPdf({
        element,
        fileName: `${companyName || "Company"}_Cover_Letter.pdf`,
      });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to download PDF.");
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

              <div className="space-y-3 rounded-2xl border border-border bg-accent/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Letter Template
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(["classic", "modern", "minimal", "executive", "editorial", "midnight"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTemplate(option)}
                      className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold capitalize transition-colors ${
                        template === option
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
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
                  <div ref={desktopPreviewRef} className="hidden sm:block">
                    <CoverLetterPreview content={generatedContent} template={template} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPreviewZoomOpen(true)}
                    className="relative block overflow-hidden rounded-md shadow-[0_16px_40px_rgba(15,23,42,0.2)] sm:hidden"
                    style={{
                      width: `${mobilePreviewWidth}px`,
                      height: `${mobilePreviewHeight}px`,
                    }}
                  >
                    <div
                      ref={mobilePreviewRef}
                      className="absolute left-0 top-0 origin-top-left"
                      style={{ transform: `scale(${mobilePreviewScale})` }}
                    >
                      <CoverLetterPreview content={generatedContent} template={template} />
                    </div>
                  </button>
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

      {isPreviewZoomOpen && generatedContent && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm md:hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 text-white">
            <div>
              <div className="text-lg font-semibold">Cover Letter Preview</div>
              <div className="text-xs text-white/60">Tap outside or use close to return.</div>
            </div>
            <button
              type="button"
              onClick={() => setIsPreviewZoomOpen(false)}
              className="rounded-xl border border-white/15 bg-white/5 p-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            aria-label="Close zoomed cover letter preview"
            onClick={() => setIsPreviewZoomOpen(false)}
            className="block h-[calc(100vh-73px)] w-full overflow-auto px-4 py-6"
          >
            <div
              className="relative mx-auto overflow-hidden rounded-lg shadow-[0_24px_60px_rgba(15,23,42,0.35)]"
              style={{
                width: `${794 * mobileZoomScale}px`,
                height: `${1123 * mobileZoomScale}px`,
              }}
            >
              <div
                className="absolute left-0 top-0 origin-top-left"
                style={{ transform: `scale(${mobileZoomScale})` }}
              >
                <CoverLetterPreview content={generatedContent} template={template} />
              </div>
            </div>
          </button>
        </div>
      )}
    </main>
  );
}
