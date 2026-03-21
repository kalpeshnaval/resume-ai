"use client";

import { useState, useEffect } from "react";
import ResumePreview from "@/components/ResumePreview";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { UploadCloud, Sparkles, LayoutTemplate, MessageSquare, Send, X } from "lucide-react";
import Link from "next/link";

// Basic structure for Resume Data
export type ResumeData = {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{ id: string, title: string, company: string, startDate: string, endDate: string, description: string }>;
  education: Array<{ id: string, degree: string, school: string, year: string }>;
  skills: string;
};

const initialData: ResumeData = {
  personalInfo: { fullName: "", email: "", phone: "", location: "", summary: "" },
  experience: [],
  education: [],
  skills: ""
};

export default function BuilderPage() {
  const [data, setData] = useState<ResumeData>(initialData);
  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "education" | "skills" | "template">("personal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState<"standard" | "modern" | "minimalist" | "creative" | "executive" | "tech">("standard");
  const [isPremium, setIsPremium] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ai", content: string }>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);


  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/user/status");
        if (res.ok) {
          const { isPremium } = await res.json();
          setIsPremium(isPremium);
        }
      } catch (e) {
        console.error("Error checking premium status:", e);
      }
    }
    checkStatus();
  }, []);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("resume-preview");
    if (!element) return;
    
    try {
      setIsGenerating(true);
      
      // Use html-to-image instead of html2canvas for better modern CSS support (lab, etc.)
      const dataUrl = await toPng(element, { 
        pixelRatio: 2, 
        skipAutoScale: false,
        backgroundColor: "#ffffff",
        style: {
          transform: "none", // Remove scale during capture
        }
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Calculate height to maintain aspect ratio
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.personalInfo.fullName || "Resume"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF due to modern CSS color limits. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };



  const handleEnhance = async (index: number) => {
    const textToEnhance = data.experience[index].description;
    if (!textToEnhance.trim()) return;

    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulletPoint: textToEnhance })
      });
      if (res.ok) {
        const { enhanced } = await res.json();
        const newExp = [...data.experience];
        newExp[index].description = enhanced;
        setData({ ...data, experience: newExp });
      } else {
        alert("Premium feature only or AI failed.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatLoading) return;

    if (!isPremium) {
      alert("AI Assistant is a premium feature!");
      return;
    }

    const newUserMsg = { role: "user" as const, content: chatMessage };
    setChatHistory(prev => [...prev, newUserMsg]);
    setChatMessage("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions: chatMessage, currentData: data })
      });
      
      if (res.ok) {
        const { response } = await res.json();
        setChatHistory(prev => [...prev, { role: "ai", content: response }]);
      } else {
        const errData = await res.json();
        setChatHistory(prev => [...prev, { role: "ai", content: errData.error || "Sorry, I'm having trouble connecting right now." }]);
      }
    } catch (error) {
       setChatHistory(prev => [...prev, { role: "ai", content: "Something went wrong. Please try again later." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar Editor */}
      <aside className="w-full md:w-1/2 lg:w-[45%] h-full border-r border-border bg-card overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-border bg-background sticky top-0 z-10">
          <h1 className="text-2xl font-bold">Resume Builder</h1>
          <p className="text-sm text-foreground/60">Fill in your details below to generate.</p>
          
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {(["personal", "experience", "education", "skills", "template"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize whitespace-nowrap transition-colors flex items-center gap-1 ${
                  activeTab === tab ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent/80"
                }`}
              >
                {tab === "template" && <LayoutTemplate className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 flex-1">
          {activeTab === "personal" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input 
                  type="text" 
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={data.personalInfo.fullName}
                  onChange={e => setData({...data, personalInfo: {...data.personalInfo, fullName: e.target.value}})}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input 
                  type="email" 
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={data.personalInfo.email}
                  onChange={e => setData({...data, personalInfo: {...data.personalInfo, email: e.target.value}})}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Professional Summary</label>
                <textarea 
                  className="w-full flex min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={data.personalInfo.summary}
                  onChange={e => setData({...data, personalInfo: {...data.personalInfo, summary: e.target.value}})}
                  placeholder="A highly motivated professional..."
                />
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Experience</h2>
                <button 
                  onClick={() => setData({
                    ...data, 
                    experience: [...data.experience, { id: Date.now().toString(), title: "", company: "", startDate: "", endDate: "", description: "" }]
                  })}
                  className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary/20"
                >
                  + Add Role
                </button>
              </div>
              
              {data.experience.length === 0 && <p className="text-sm text-foreground/50">No experience added yet.</p>}
              
              {data.experience.map((exp, index) => (
                <div key={exp.id} className="border border-border rounded-lg p-4 space-y-3 relative group">
                  <button 
                    onClick={() => {
                      const newExp = [...data.experience];
                      newExp.splice(index, 1);
                      setData({...data, experience: newExp});
                    }}
                    className="absolute top-2 right-2 text-destructive font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                  <input 
                    placeholder="Job Title"
                    className="w-full p-2 text-sm border-b border-border bg-transparent focus:outline-none focus:border-primary"
                    value={exp.title}
                    onChange={e => {
                      const newExp = [...data.experience];
                      newExp[index].title = e.target.value;
                      setData({...data, experience: newExp});
                    }}
                  />
                  <input 
                    placeholder="Company"
                    className="w-full p-2 text-sm border-b border-border bg-transparent focus:outline-none focus:border-primary"
                    value={exp.company}
                    onChange={e => {
                      const newExp = [...data.experience];
                      newExp[index].company = e.target.value;
                      setData({...data, experience: newExp});
                    }}
                  />
                  <div className="relative">
                    <textarea 
                      placeholder="Describe your role and achievements..."
                      className="w-full p-2 text-sm border border-border rounded-md bg-transparent focus:outline-none focus:border-primary min-h-[80px]"
                      value={exp.description}
                      onChange={e => {
                        const newExp = [...data.experience];
                        newExp[index].description = e.target.value;
                        setData({...data, experience: newExp});
                      }}
                    />
                    <button 
                      onClick={() => handleEnhance(index)}
                      title="AI Enhance (Premium)"
                      className="absolute bottom-2 right-2 bg-primary/10 text-primary p-1.5 rounded-md hover:bg-primary/20 transition-colors flex items-center justify-center group-hover:opacity-100"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "education" && (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-semibold">Education</h2>
               <button 
                 onClick={() => setData({
                   ...data, 
                   education: [...data.education, { id: Date.now().toString(), degree: "", school: "", year: "" }]
                 })}
                 className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary/20"
               >
                 + Add Education
               </button>
             </div>
             
             {data.education.length === 0 && <p className="text-sm text-foreground/50">No education added yet.</p>}
             
             {data.education.map((edu, index) => (
               <div key={edu.id} className="border border-border rounded-lg p-4 space-y-3 relative group">
                  <button 
                    onClick={() => {
                      const newEdu = [...data.education];
                      newEdu.splice(index, 1);
                      setData({...data, education: newEdu});
                    }}
                    className="absolute top-2 right-2 text-destructive font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                 <input 
                   placeholder="Degree (e.g. BS in Computer Science)"
                   className="w-full p-2 text-sm border-b border-border bg-transparent focus:outline-none focus:border-primary"
                   value={edu.degree}
                   onChange={e => {
                     const newEdu = [...data.education];
                     newEdu[index].degree = e.target.value;
                     setData({...data, education: newEdu});
                   }}
                 />
                 <input 
                   placeholder="School / University"
                   className="w-full p-2 text-sm border-b border-border bg-transparent focus:outline-none focus:border-primary"
                   value={edu.school}
                   onChange={e => {
                     const newEdu = [...data.education];
                     newEdu[index].school = e.target.value;
                     setData({...data, education: newEdu});
                   }}
                 />
               </div>
             ))}
           </div>
          )}

          {activeTab === "skills" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-semibold mb-4">Skills</h2>
              <div className="space-y-2">
                <label className="text-sm font-medium">List your top skills (comma separated)</label>
                <textarea 
                  className="w-full flex min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-primary"
                  value={data.skills}
                  onChange={e => setData({...data, skills: e.target.value})}
                  placeholder="React, Next.js, TypeScript, Node.js..."
                />
              </div>
            </div>
          )}

          {activeTab === "template" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Premium Templates
              </h2>
              <p className="text-sm text-foreground/60 mb-6">Choose a premium layout for your resume.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {(["standard", "modern", "minimalist", "creative", "executive", "tech"] as const).map(tmpl => (
                  <button
                    key={tmpl}
                    onClick={() => {
                        setTemplate(tmpl);
                    }}
                    className={`p-4 border-2 rounded-xl text-left capitalize font-semibold transition-all flex justify-between items-center ${
                      template === tmpl 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-border hover:border-primary/40 bg-card"
                    }`}
                  >
                    {tmpl}
                    {tmpl !== "standard" && <Sparkles className="w-4 h-4 text-amber-500 opacity-50" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Primary Live Preview */}
      <section className="hidden md:flex flex-col w-1/2 lg:w-[55%] h-full bg-accent relative px-8 py-6">
        <div className="absolute top-4 right-8 flex gap-3 z-20">
          <button 
            onClick={handleDownloadPDF} 
            disabled={isGenerating || (template !== "standard" && !isPremium)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" /> 
            {isGenerating ? "Generating..." : "Download PDF"}
          </button>
        </div>
        
        <div className="flex-1 w-full flex items-start justify-center overflow-y-auto pb-20 pt-16 mt-[-64px]">
           <div className="relative group">
              <ResumePreview data={data} template={template} />
              
              {template !== "standard" && !isPremium && (
                <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-card/90 border border-border p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-xs pointer-events-auto">
                    <Sparkles className="w-10 h-10 text-amber-500 mb-4" />
                    <h3 className="text-lg font-bold">Premium Template</h3>
                    <p className="text-sm text-foreground/60 mb-6">Upgrade to premium to download or save this professional layout.</p>
                    <Link 
                      href="/premium" 
                      className="w-full bg-linear-to-r from-amber-500 to-orange-600 text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all text-sm mb-3"
                    >
                      Upgrade Now
                    </Link>
                    <button 
                      onClick={() => setTemplate("standard")}
                      className="text-xs text-foreground/40 hover:text-foreground transition-colors"
                    >
                      Use standard template for free
                    </button>
                  </div>
                </div>
              )}
           </div>
        </div>
      </section>

      {/* AI Assistant FAB */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        {isChatOpen ? <X /> : <MessageSquare />}
        {!isChatOpen && (
          <span className="absolute right-full mr-4 bg-card border border-border px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            AI Assistant
          </span>
        )}
      </button>

      {/* AI Chat Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-8 w-80 md:w-96 h-[600px] max-h-[70vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">AI Resume Assistant</span>
            </div>
            <button onClick={() => setIsChatOpen(false)}><X className="w-5 h-5 opacity-70 hover:opacity-100" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-accent/30">
            {chatHistory.length === 0 && (
              <div className="text-center py-10 px-4">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                   <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">Hello! How can I help you improve your resume today?</p>
                <p className="text-xs text-foreground/50 mt-2">Try: &quot;Help me write a summary for a Senior Developer&quot; or &quot;Add a new experience for Google.&quot;</p>
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-white border border-border rounded-tl-none text-foreground shadow-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-border p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-card border-t border-border flex gap-2">
            <input 
              type="text"
              placeholder="Type your instructions..."
              className="flex-1 bg-accent/50 border-none px-4 py-2 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <button 
              type="submit"
              disabled={isChatLoading || !chatMessage.trim()}
              className="bg-primary text-primary-foreground p-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
