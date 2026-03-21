"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LayoutTemplate, MessageSquare, Save, Send, Sparkles, UploadCloud, X } from "lucide-react";

import ResumePreview from "@/components/ResumePreview";
import { exportElementToPdf } from "@/lib/pdf";

export type ResumeData = {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{ id: string; title: string; company: string; startDate: string; endDate: string; description: string }>;
  education: Array<{ id: string; degree: string; school: string; year: string }>;
  skills: string;
};

type TemplateType = "standard" | "modern" | "minimalist" | "creative" | "executive" | "tech";

type StoredResumePayload = {
  data: ResumeData;
  template: TemplateType;
};

const initialData: ResumeData = {
  personalInfo: { fullName: "", email: "", phone: "", location: "", summary: "" },
  experience: [],
  education: [],
  skills: "",
};

export default function BuilderPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ResumeData>(initialData);
  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "education" | "skills" | "template">("personal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState<TemplateType>("standard");
  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ai"; content: string }>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [chatHistory, isChatLoading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resumeId = params.get("resumeId");

    if (!resumeId || !isSignedIn) {
      return;
    }

    let isCancelled = false;

    async function loadResume() {
      try {
        const res = await fetch(`/api/resumes/${resumeId}`);
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(payload.error || "Failed to load resume.");
        }

        if (isCancelled) return;

        const parsed = JSON.parse(payload.resume.contentJson) as StoredResumePayload | ResumeData;
        const storedData = "data" in parsed ? parsed.data : parsed;
        const storedTemplate = "template" in parsed ? parsed.template : "standard";

        setData(storedData);
        setTemplate(storedTemplate);
        setSavedResumeId(payload.resume.id);
        setSaveMessage(`Loaded "${payload.resume.title}".`);
      } catch (error) {
        console.error(error);
        if (!isCancelled) {
          setSaveMessage(error instanceof Error ? error.message : "Failed to load resume.");
        }
      }
    }

    loadResume();

    return () => {
      isCancelled = true;
    };
  }, [isSignedIn]);

  const getResumeTitle = () => {
    const name = data.personalInfo.fullName.trim();
    return name ? `${name} Resume` : "Untitled Resume";
  };

  const handleSaveResume = async () => {
    if (!isSignedIn) {
      alert("Please sign in to save your resume.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const body = {
        title: getResumeTitle(),
        contentJson: JSON.stringify({
          data,
          template,
        } satisfies StoredResumePayload),
      };

      const endpoint = savedResumeId ? `/api/resumes/${savedResumeId}` : "/api/resumes";
      const method = savedResumeId ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || "Failed to save resume.");
      }

      const resumeId = payload.resume.id as string;
      setSavedResumeId(resumeId);
      setSaveMessage("Resume saved securely to your account.");

      const nextSearchParams = new URLSearchParams(window.location.search);
      nextSearchParams.set("resumeId", resumeId);
      router.replace(`/builder?${nextSearchParams.toString()}`, { scroll: false });
    } catch (error) {
      console.error(error);
      setSaveMessage(error instanceof Error ? error.message : "Failed to save resume.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!isSignedIn) {
      alert("Please sign in to download your resume.");
      return;
    }

    const element = document.getElementById("resume-preview");
    if (!element) return;

    try {
      setIsGenerating(true);
      await exportElementToPdf({
        element,
        fileName: `${data.personalInfo.fullName || "Resume"}.pdf`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhance = async (index: number) => {
    if (!isSignedIn) {
      alert("Please sign in to use AI tools.");
      return;
    }

    const textToEnhance = data.experience[index].description;
    if (!textToEnhance.trim()) return;

    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulletPoint: textToEnhance }),
      });

      if (res.ok) {
        const { enhanced } = await res.json();
        const newExp = [...data.experience];
        newExp[index].description = enhanced;
        setData({ ...data, experience: newExp });
      } else {
        alert("AI enhancement failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatLoading) return;

    if (!isSignedIn) {
      alert("Please sign in to use AI tools.");
      return;
    }

    const message = chatMessage;
    setChatHistory((prev) => [...prev, { role: "user", content: message }]);
    setChatMessage("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions: message, currentData: data }),
      });

      if (res.ok) {
        const { message: aiMessage, updatedData } = await res.json();
        if (updatedData) {
          setData(updatedData);
        }
        setChatHistory((prev) => [...prev, { role: "ai", content: aiMessage || "Updated your resume." }]);
      } else {
        const errData = await res.json();
        setChatHistory((prev) => [...prev, { role: "ai", content: errData.error || "Sorry, I'm having trouble connecting right now." }]);
      }
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [...prev, { role: "ai", content: "Something went wrong. Please try again later." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <main className="flex h-[calc(100vh-64px)] flex-1 flex-col overflow-hidden md:flex-row">
      <aside className="flex h-full w-full flex-col overflow-y-auto border-r border-border bg-card md:w-1/2 lg:w-[45%]">
        <div className="sticky top-0 z-10 border-b border-border bg-background p-4">
          <h1 className="text-2xl font-bold">Resume Builder</h1>
          <p className="text-sm text-foreground/60">Fill in your details below to generate.</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveResume}
              disabled={isSaving || !isLoaded || !isSignedIn}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : savedResumeId ? "Save Changes" : "Save Resume"}
            </button>
            {saveMessage && (
              <span className="text-xs font-medium text-emerald-600">{saveMessage}</span>
            )}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {(["personal", "experience", "education", "skills", "template"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent/80"
                }`}
              >
                {tab === "template" && <LayoutTemplate className="h-4 w-4" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">
          {activeTab === "personal" && (
            <div className="animate-in space-y-4 fade-in slide-in-from-bottom-2">
              <h2 className="mb-4 text-xl font-semibold">Personal Information</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={data.personalInfo.fullName}
                  onChange={(e) => setData({ ...data, personalInfo: { ...data.personalInfo, fullName: e.target.value } })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={data.personalInfo.email}
                  onChange={(e) => setData({ ...data, personalInfo: { ...data.personalInfo, email: e.target.value } })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Professional Summary</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={data.personalInfo.summary}
                  onChange={(e) => setData({ ...data, personalInfo: { ...data.personalInfo, summary: e.target.value } })}
                  placeholder="A highly motivated professional..."
                />
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="animate-in space-y-4 fade-in slide-in-from-bottom-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Experience</h2>
                <button
                  onClick={() => setData({
                    ...data,
                    experience: [...data.experience, { id: Date.now().toString(), title: "", company: "", startDate: "", endDate: "", description: "" }],
                  })}
                  className="rounded-md bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                >
                  + Add Role
                </button>
              </div>

              {data.experience.length === 0 && <p className="text-sm text-foreground/50">No experience added yet.</p>}

              {data.experience.map((exp, index) => (
                <div key={exp.id} className="group relative space-y-3 rounded-lg border border-border p-4">
                  <button
                    onClick={() => {
                      const newExp = [...data.experience];
                      newExp.splice(index, 1);
                      setData({ ...data, experience: newExp });
                    }}
                    className="absolute right-2 top-2 text-xs font-bold text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Remove
                  </button>
                  <input
                    placeholder="Job Title"
                    className="w-full border-b border-border bg-transparent p-2 text-sm focus:border-primary focus:outline-none"
                    value={exp.title}
                    onChange={(e) => {
                      const newExp = [...data.experience];
                      newExp[index].title = e.target.value;
                      setData({ ...data, experience: newExp });
                    }}
                  />
                  <input
                    placeholder="Company"
                    className="w-full border-b border-border bg-transparent p-2 text-sm focus:border-primary focus:outline-none"
                    value={exp.company}
                    onChange={(e) => {
                      const newExp = [...data.experience];
                      newExp[index].company = e.target.value;
                      setData({ ...data, experience: newExp });
                    }}
                  />
                  <div className="relative">
                    <textarea
                      placeholder="Describe your role and achievements..."
                      className="min-h-[80px] w-full rounded-md border border-border bg-transparent p-2 text-sm focus:border-primary focus:outline-none"
                      value={exp.description}
                      onChange={(e) => {
                        const newExp = [...data.experience];
                        newExp[index].description = e.target.value;
                        setData({ ...data, experience: newExp });
                      }}
                    />
                    <button
                      onClick={() => handleEnhance(index)}
                      title="AI Enhance"
                      className="absolute bottom-2 right-2 flex items-center justify-center rounded-md bg-primary/10 p-1.5 text-primary transition-colors group-hover:opacity-100 hover:bg-primary/20"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "education" && (
            <div className="animate-in space-y-4 fade-in slide-in-from-bottom-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Education</h2>
                <button
                  onClick={() => setData({
                    ...data,
                    education: [...data.education, { id: Date.now().toString(), degree: "", school: "", year: "" }],
                  })}
                  className="rounded-md bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
                >
                  + Add Education
                </button>
              </div>

              {data.education.length === 0 && <p className="text-sm text-foreground/50">No education added yet.</p>}

              {data.education.map((edu, index) => (
                <div key={edu.id} className="group relative space-y-3 rounded-lg border border-border p-4">
                  <button
                    onClick={() => {
                      const newEdu = [...data.education];
                      newEdu.splice(index, 1);
                      setData({ ...data, education: newEdu });
                    }}
                    className="absolute right-2 top-2 text-xs font-bold text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Remove
                  </button>
                  <input
                    placeholder="Degree (e.g. BS in Computer Science)"
                    className="w-full border-b border-border bg-transparent p-2 text-sm focus:border-primary focus:outline-none"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...data.education];
                      newEdu[index].degree = e.target.value;
                      setData({ ...data, education: newEdu });
                    }}
                  />
                  <input
                    placeholder="School / University"
                    className="w-full border-b border-border bg-transparent p-2 text-sm focus:border-primary focus:outline-none"
                    value={edu.school}
                    onChange={(e) => {
                      const newEdu = [...data.education];
                      newEdu[index].school = e.target.value;
                      setData({ ...data, education: newEdu });
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "skills" && (
            <div className="animate-in space-y-4 fade-in slide-in-from-bottom-2">
              <h2 className="mb-4 text-xl font-semibold">Skills</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">List your top skills (comma separated)</label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:border-primary focus-visible:outline-none"
                  value={data.skills}
                  onChange={(e) => setData({ ...data, skills: e.target.value })}
                  placeholder="React, Next.js, TypeScript, Node.js..."
                />
              </div>
            </div>
          )}

          {activeTab === "template" && (
            <div className="animate-in space-y-4 fade-in slide-in-from-bottom-2">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Sparkles className="h-5 w-5 text-amber-500" /> Templates
              </h2>
              <p className="mb-6 text-sm text-foreground/60">Choose the layout you want for your resume.</p>

              <div className="grid grid-cols-2 gap-4">
                {(["standard", "modern", "minimalist", "creative", "executive", "tech"] as const).map((tmpl) => (
                  <button
                    key={tmpl}
                    onClick={() => setTemplate(tmpl)}
                    className={`flex items-center justify-between rounded-xl border-2 p-4 text-left font-semibold capitalize transition-all ${
                      template === tmpl
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    {tmpl}
                    {tmpl !== "standard" && <Sparkles className="h-4 w-4 text-amber-500 opacity-50" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      <section className="relative hidden h-full w-1/2 flex-col bg-accent px-8 py-6 md:flex lg:w-[55%]">
        <div className="absolute right-8 top-4 z-20 flex gap-3">
          <button
            onClick={handleSaveResume}
            disabled={isSaving || !isLoaded || !isSignedIn}
            className="flex items-center gap-2 rounded-lg border border-primary/20 bg-card px-4 py-2 font-medium text-foreground shadow hover:bg-accent disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : savedResumeId ? "Save Changes" : "Save Resume"}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating || !isLoaded || !isSignedIn}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
          >
            <UploadCloud className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Download PDF"}
          </button>
        </div>

        {saveMessage && (
          <div className="absolute left-8 top-4 z-20 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 shadow-sm">
            {saveMessage}
          </div>
        )}

        <div className="mt-[-64px] flex w-full flex-1 items-start justify-center overflow-y-auto pb-20 pt-16">
          <div className="group relative origin-top scale-[0.72] lg:scale-[0.82] xl:scale-[0.92] 2xl:scale-100">
            <ResumePreview data={data} template={template} />
          </div>
        </div>
      </section>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="group fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-all hover:scale-110 active:scale-95"
      >
        {isChatOpen ? <X /> : <MessageSquare />}
        {!isChatOpen && (
          <span className="pointer-events-none absolute right-full mr-4 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
            AI Assistant
          </span>
        )}
      </button>

      {isChatOpen && (
        <div className="animate-in slide-in-from-bottom-4 fade-in fixed bottom-24 right-8 z-50 flex h-[600px] max-h-[70vh] w-80 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl duration-300 md:w-96">
          <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-bold">AI Resume Assistant</span>
            </div>
            <button onClick={() => setIsChatOpen(false)}>
              <X className="h-5 w-5 opacity-70 hover:opacity-100" />
            </button>
          </div>

          <div ref={chatScrollRef} className="flex-1 space-y-4 overflow-y-auto bg-accent/30 p-4">
            {!isSignedIn ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Sign in to use the AI resume assistant.</p>
                <div className="mt-4">
                  <SignInButton mode="modal">
                    <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Hello! How can I help you improve your resume today?</p>
                <p className="mt-2 text-xs text-foreground/50">
                  Try: &quot;Help me write a summary for a Senior Developer&quot; or &quot;Add a new experience for Google.&quot;
                </p>
              </div>
            ) : null}

            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  msg.role === "user"
                    ? "rounded-tr-none bg-primary text-primary-foreground"
                    : "rounded-tl-none border border-slate-200 bg-white text-slate-900 shadow-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-tl-none border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:0.2s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-border bg-card p-4">
            <input
              type="text"
              placeholder="Type your instructions..."
              className="flex-1 rounded-xl border-none bg-accent/50 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatMessage.trim() || !isSignedIn}
              className="rounded-xl bg-primary p-2 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
