import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Sparkles } from "lucide-react";

import { Suspense } from "react";
import MobileNavMenu from "@/components/MobileNavMenu";

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

      <MobileNavMenu isSignedIn={!!userId} />
    </>
  );
}
