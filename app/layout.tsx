import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextAIResume",
  description: "AI-powered resume builder with templates, PDF export, and cover letters.",
  verification: {
    google: "Zg2R4B7vIP2lZSAnh5nOsMIRIirjVpkciC8KnIMJxxs",
  },
};

import { ClerkProvider } from '@clerk/nextjs'
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full antialiased">
        <body suppressHydrationWarning className="min-h-full flex flex-col">
          <Navbar />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
