"use client";

import { useState, useEffect } from "react";
import { Sparkles, FileText, Download, Building2, MapPin, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import Link from "next/link";

export default function CoverLetterPage() {
  const [isPremium, setIsPremium] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");

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

  const handleGenerate = async () => {
    if (!companyName.trim()) return;
    if (!isPremium) {
      alert("Cover Letter generation is a premium feature!");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, companyAddress })
      });
      
      if (res.ok) {
        const { text } = await res.json();
        setGeneratedContent(text);
      } else {
        alert("Failed to generate cover letter. Please check your premium status.");
      }
    } catch (error) {
       alert("Error generating cover letter.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById("letter-preview");
    if (!element || !generatedContent) return;

    try {
      const dataUrl = await toPng(element, { backgroundColor: "#ffffff", pixelRatio: 2 });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);
      const pdfHeight = (img.height * pdfWidth) / img.width;
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${companyName || "Company"}_Cover_Letter.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to download PDF.");
    }
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Input Section */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Cover Letter AI
            </h1>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Company Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Google"
                  className="w-full h-11 bg-accent/30 border border-border rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Address (Optional)
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Mountain View, CA"
                  className="w-full h-11 bg-accent/30 border border-border rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !companyName.trim()}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-lg shadow-primary/25 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? "Generating..." : "Generate with AI"}
              </button>
            </div>
          </div>

          {!isPremium && (
            <div className="bg-linear-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-6 rounded-2xl">
              <h3 className="font-bold text-amber-900 mb-2">Premium Feature</h3>
              <p className="text-sm text-amber-800/80 mb-4">AI Cover Letters are only available for Pro members.</p>
              <Link href="/premium" className="block text-center bg-amber-500 text-white py-2 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20">
                Upgrade Now
              </Link>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="w-full md:w-2/3">
          <div className="bg-accent/50 rounded-2xl p-8 min-h-[700px] flex flex-col items-center">
            {generatedContent ? (
              <div className="w-full max-w-2xl space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-end gap-3 mb-4 no-print">
                   <button 
                     onClick={handleDownload}
                     className="bg-white border border-border px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 shadow-sm"
                   >
                     <Download className="w-4 h-4" /> Download PDF
                   </button>
                </div>
                
                <div 
                  id="letter-preview" 
                  className="bg-white p-12 shadow-2xl rounded-sm text-black min-h-[842px] font-serif leading-relaxed"
                >
                   <p className="whitespace-pre-wrap text-base">{generatedContent}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-32 space-y-4">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-primary">
                  <FileText className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold">Your Cover Letter will appear here</h2>
                <p className="text-foreground/50 max-w-xs mx-auto">Fill in the company details and let AI craft the perfect professional pitch for you.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
