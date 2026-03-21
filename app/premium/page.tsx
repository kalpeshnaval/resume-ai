"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function PremiumPage() {
  return (
    <main className="flex-1 flex flex-col items-center py-20 px-4">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 flex items-center justify-center gap-3 text-foreground">
          <Sparkles className="w-10 h-10 text-amber-500" />
          Everything Is Free
        </h1>
        <p className="text-lg text-foreground/70">
          All templates and AI tools are now included for every signed-in user.
        </p>
      </div>

      <div className="bg-card border-2 border-primary/30 shadow-2xl rounded-3xl p-8 max-w-lg w-full relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <p className="mb-6 text-lg text-foreground/70">
          ResumeAI no longer has subscriptions or paid feature gates.
        </p>
        <Link
          href="/builder"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
        >
          Start Building
        </Link>
      </div>
    </main>
  );
}
