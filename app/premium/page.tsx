"use client";

import { useState } from "react";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { upgradeToPremium } from "./actions";

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", { method: "POST" });
      const { url, error } = await res.json();
      
      if (url) {
        window.location.href = url;
      } else {
        alert(error || "Failed to initiate checkout.");
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center py-20 px-4">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 flex items-center justify-center gap-3 text-foreground">
          <Sparkles className="w-10 h-10 text-amber-500" />
          Pro Plan
        </h1>
        <p className="text-lg text-foreground/70">
          Supercharge your job hunt with AI-powered resume building, premium templates, and custom cover letters.
        </p>
      </div>

      <div className="bg-card border-2 border-primary/50 shadow-2xl rounded-3xl p-8 max-w-lg w-full relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Lifetime Access</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-foreground font-sans tracking-tight">$5.99</span>
            <span className="text-foreground/50">one-time payment</span>
          </div>
        </div>

        <ul className="space-y-4 mb-8">
          {[
            "All 6 Premium Resume Templates",
            "Unlimited AI Bullet Enhancements",
            "Unlimited AI Cover Letters",
            "Targeted Company Research included",
            "Priority Support",
            "Lifetime Updates"
          ].map((feature, i) => (
            <li key={i} className="flex items-center gap-3 font-medium text-foreground/90">
              <div className="bg-primary/20 p-1 rounded-full">
                <Check className="w-4 h-4 text-primary font-bold" />
              </div>
              {feature}
            </li>
          ))}
        </ul>

        <button 
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-linear-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
        >
          {loading ? "Redirecting to Stripe..." : "Upgrade Now"} 
          {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </main>
  );
}
