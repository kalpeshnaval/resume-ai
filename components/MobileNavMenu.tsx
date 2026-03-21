"use client";

import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
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
        <div className="absolute right-0 top-12 min-w-52 rounded-2xl border border-border bg-card p-3 shadow-2xl">
          <div className="flex flex-col gap-2">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Link
                  href="/builder"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                >
                  Builder
                </Link>
                <Link
                  href="/cover-letter"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                >
                  AI Cover Letter
                </Link>
                <div className="px-3 pt-1">
                  <UserButton />
                </div>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl px-3 py-2 text-left text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Sign In
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
                  >
                    Get Started
                  </button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
