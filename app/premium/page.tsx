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
      await upgradeToPremium();
      // Mock successful payment delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center py-20 px-4">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 flex items-center justify-center gap-3">
          <Sparkles className="w-10 h-10 text-amber-500" />
          Pro Plan
        </h1>
        <p className="text-lg text-foreground/70">
          Supercharge your job hunt with AI capabilities, premium templates, and personalized cover letters.
        </p>
      </div>

      <div className="bg-card border-2 border-primary/50 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Lifetime Access</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold">$29</span>
            <span className="text-foreground/50">one-time payment</span>
          </div>
        </div>

        <ul className="space-y-4 mb-8">
          {[
            "All 6 Premium Resume Templates",
            "Unlimited AI Bullet Enhancements",
            "Unlimited AI Cover Letters",
            "Targeted Company Research included",
            "Save Resumes to Secure Cloud",
            "Priority Support"
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
          {loading ? "Processing Payment..." : "Upgrade Now"} 
          {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </main>
  );
}
