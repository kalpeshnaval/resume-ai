"use client";

import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { FileText, LayoutDashboard, LogIn, Menu, PencilLine, UserRound, X } from "lucide-react";
import { useState } from "react";

type Props = {
  isSignedIn: boolean;
};

export default function MobileNavMenu({ isSignedIn }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center justify-center rounded-xl border border-foreground/10 bg-card p-2 text-foreground/80 transition-colors hover:text-foreground"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 min-w-64 overflow-hidden rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 rounded-xl border border-primary/10 bg-primary/5 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/45">Menu</div>
            <div className="mt-1 text-sm font-medium text-foreground/75">
              {isSignedIn ? "Your resume workspace" : "Access your resume workspace"}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isSignedIn ? (
              <>
                <div className="rounded-xl border border-border/70 bg-background/60 p-2">
                  <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">
                    Navigation
                  </div>
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      Dashboard
                    </Link>
                    <Link
                      href="/builder"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      Resume
                    </Link>
                    <Link
                      href="/cover-letter"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <PencilLine className="h-4 w-4 text-primary" />
                      Cover Letter
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-background/60 p-2">
                  <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">
                    Account
                  </div>
                  <div className="flex items-center justify-between rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground/75">
                      <UserRound className="h-4 w-4 text-primary" />
                      Signed in
                    </div>
                    <UserButton />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-border/70 bg-background/60 p-2">
                  <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">
                    Account
                  </div>
                  <div className="flex flex-col gap-2">
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <LogIn className="h-4 w-4 text-primary" />
                        Sign In
                      </button>
                    </SignInButton>
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
                      >
                        Get Started
                      </button>
                    </SignInButton>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
