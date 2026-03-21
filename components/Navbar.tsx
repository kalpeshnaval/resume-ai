import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Menu, Sparkles } from "lucide-react";

import { Suspense } from "react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-foreground/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Resume<span className="text-primary">AI</span>
          </span>
        </Link>
        
        <Suspense fallback={<div className="h-8 w-20 animate-pulse rounded-full bg-muted md:w-32" />}>
          <NavbarActions />
        </Suspense>
      </div>
    </nav>
  );
}

async function NavbarActions() {
  const { userId } = await auth();
  
  return (
    <>
      <div className="hidden items-center gap-6 md:flex">
        {userId ? (
          <>
            <Link href="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/builder" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Builder
            </Link>
            <Link href="/cover-letter" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              AI Cover Letter
            </Link>
            <UserButton />
          </>
        ) : (
          <>
            <SignInButton mode="modal">
              <button className="text-sm font-medium hover:text-primary transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95">
                Get Started
              </button>
            </SignInButton>
          </>
        )}
      </div>

      <details className="relative md:hidden">
        <summary className="flex list-none cursor-pointer items-center justify-center rounded-xl border border-foreground/10 bg-card p-2 text-foreground/80 transition-colors hover:text-foreground">
          <Menu className="h-5 w-5" />
        </summary>
        <div className="absolute right-0 top-12 min-w-52 rounded-2xl border border-border bg-card p-3 shadow-2xl">
          <div className="flex flex-col gap-2">
            {userId ? (
              <>
                <Link href="/dashboard" className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground">
                  Dashboard
                </Link>
                <Link href="/builder" className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground">
                  Builder
                </Link>
                <Link href="/cover-letter" className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground">
                  AI Cover Letter
                </Link>
                <div className="px-3 pt-1">
                  <UserButton />
                </div>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="rounded-xl px-3 py-2 text-left text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground">
                    Sign In
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                    Get Started
                  </button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </details>
    </>
  );
}
