"use client";

import { useState } from "react";
import { Sparkles, FileText, UploadCloud } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CoverLetterPage() {
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [userContext, setUserContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const handleGenerate = async () => {
    if (!companyName.trim()) return;

    try {
      setIsGenerating(true);
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, companyAddress, userContext })
      });
      if (res.ok) {
        const { text } = await res.json();
        setCoverLetter(text);
      } else {
        alert("Failed to generate or not premium.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("cl-preview");
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CoverLetter_${companyName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      <aside className="w-full md:w-[45%] h-full border-r border-border bg-card overflow-y-auto p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-primary w-6 h-6" /> AI Cover Letter
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            Personalize your application by letting our AI research and draft the perfect cover letter for your target role.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name *</label>
            <input 
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="e.g. Google, Stripe, etc."
              className="w-full p-2 text-sm border-b border-border bg-transparent focus:outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Context/Address (Optional)</label>
            <input 
              value={companyAddress}
              onChange={e => setCompanyAddress(e.target.value)}
              placeholder="e.g. London Office, or focus on their new AI division"
              className="w-full p-2 text-sm border-b border-border bg-transparent focus:outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Core Background (Optional)</label>
            <textarea 
              value={userContext}
              onChange={e => setUserContext(e.target.value)}
              placeholder="I am a Sr Frontend Engineer with 5 years in React and focus on accessibility..."
              className="w-full p-3 text-sm border border-border rounded-lg bg-transparent focus:outline-none focus:border-primary min-h-[120px]"
            />
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !companyName.trim()}
          className="bg-primary text-primary-foreground py-3 rounded-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? "Researching & Drafting..." : "Generate Magic Cover Letter"}
        </button>
      </aside>

      <section className="flex-1 bg-accent p-6 flex flex-col relative overflow-y-auto w-full">
        {coverLetter && (
          <button 
             onClick={handleDownloadPDF} 
             className="absolute top-6 right-6 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" /> Download PDF
          </button>
        )}

        <div className="flex-1 w-full flex items-start justify-center pt-16">
          {!coverLetter ? (
             <div className="flex flex-col items-center justify-center text-foreground/40 h-full max-w-sm text-center">
               <FileText className="w-16 h-16 mb-4" />
               <p>Your AI-generated cover letter will appear here perfectly formatted and ready to print.</p>
             </div>
          ) : (
             <div id="cl-preview" className="w-[800px] min-h-[1056px] bg-white text-black p-12 shadow-xl mx-auto font-serif text-[15px] leading-[1.8] transform scale-90 lg:scale-[0.85] origin-top text-left whitespace-pre-wrap">
               {coverLetter}
             </div>
          )}
        </div>
      </section>
    </main>
  );
}
