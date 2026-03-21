"use client";

import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { ArrowRight, FileText, Sparkles, UploadCloud, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";



export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <main className="flex-1 flex flex-col items-center overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 lg:py-40 flex flex-col items-center text-center px-4">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Resume Builder</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 text-foreground"
        >
          Craft your perfect resume in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">minutes</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-foreground/70 max-w-2xl mb-10"
        >
          Stand out from the crowd with premium templates and AI-generated smart content. Join thousands of job seekers landing their dream roles.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 min-h-[60px]"
        >
          {isLoaded && !isSignedIn && (
            <SignInButton mode="modal">
              <button className="group flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95">
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignInButton>
          )}
          {isLoaded && isSignedIn && (
            <Link href="/dashboard" className="group flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95">
              Go to Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-accent/50 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-foreground/70">Powerful features designed to get you hired faster.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileText className="w-8 h-8 text-primary" />}
              title="Modern Templates"
              description="Choose from a collection of professionally designed templates that pass ATS tracking systems."
            />
            <FeatureCard 
              icon={<Sparkles className="w-8 h-8 text-primary" />}
              title="AI Content Generation"
              description="Writer's block? Let our advanced AI write impactful bullet points tailored to your industry."
            />
            <FeatureCard 
              icon={<UploadCloud className="w-8 h-8 text-primary" />}
              title="Instant PDF Export"
              description="Download your pixel-perfect resume instantly, or save it to our secure cloud storage."
            />
          </div>
        </div>
      </section>

      {/* Pricing / CTA */}
      <section className="w-full py-24 flex flex-col items-center">
        <div className="max-w-3xl text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Upgrade to Premium</h2>
          <p className="text-lg text-foreground/70 mb-10">
            Unlock 6+ premium templates, unlimited AI generation, and personalized smart cover letters researched directly for the company you apply to.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Personalized Cover Letters
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Unlimited AI Uses
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-primary" /> All Premium Templates
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all"
    >
      <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-foreground/70 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
