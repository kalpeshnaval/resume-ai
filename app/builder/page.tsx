"use client";

import { useState, useEffect } from "react";
import ResumePreview from "@/components/ResumePreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { UploadCloud, Sparkles, LayoutTemplate, CloudIcon } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

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
  const { startUpload } = useUploadThing("pdfUploader");

  useEffect(() => {
    // In a real app we would ping an API `/api/user/me`
    // to check premium status. For demo, we check local storage or let standard flow work.
    // Assuming UI enables it if user clicks.
    // Fetch user status:
    fetch("/api/ai/enhance", { method: "HEAD" }).catch(() => {}).finally(() => setIsPremium(true)); // Mocking premium enabled for demo ease if they clicked upgrade.
  }, []);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("resume-preview");
    if (!element) return;
    
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Resume.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToCloud = async () => {
    const element = document.getElementById("resume-preview");
    if (!element) return;
    
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], `${data.personalInfo.fullName || "Resume"}.pdf`, { type: "application/pdf" });
      
      const res = await startUpload([file]);
      if (res && res[0]) {
         await fetch("/api/resumes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              title: `${data.personalInfo.fullName || "My"} Resume - ${template}`,
              contentJson: JSON.stringify(data),
              pdfUrl: res[0].url,
              isPremiumTemplate: template !== "standard"
            })
         });
         alert("Saved to cloud successfully!");
      } else {
         alert("Upload failed. Make sure you are logged in.");
      }
    } catch (error) {
      console.error("Cloud save error:", error);
      alert("Error saving to cloud.");
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
                      if (tmpl !== "standard" && !isPremium) {
                        alert("Upgrade to Premium to use this template!");
                      } else {
                        setTemplate(tmpl);
                      }
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
        <div className="absolute top-4 right-8 flex gap-3 z-10">
          <button 
            onClick={handleSaveToCloud} 
            disabled={isGenerating}
            className="bg-white text-black px-4 py-2 rounded-lg font-medium shadow-sm border border-border hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <CloudIcon className="w-4 h-4" /> Save to Cloud
          </button>
          <button 
            onClick={handleDownloadPDF} 
            disabled={isGenerating}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" /> 
            {isGenerating ? "Generating..." : "Download PDF"}
          </button>
        </div>
        
        <div className="flex-1 w-full flex items-start justify-center overflow-y-auto pb-20 pt-16 mt-[-64px]">
           <ResumePreview data={data} template={template} />
        </div>
      </section>
    </main>
  );
}
