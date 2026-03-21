import { Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-foreground/10 bg-background/80">
      <div className="container mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-center text-sm text-foreground/70 md:flex-row md:items-center md:justify-between md:text-left">
        <p>Developed by Kalpesh Naval © 2026.</p>
        <div className="flex items-center gap-3">
          <a
            href="https://www.linkedin.com/in/kalpeshnaval/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile"
            title="LinkedIn"
            className="rounded-full border border-foreground/10 p-2 transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <a
            href="mailto:kalpeshnaval@outlook.com"
            aria-label="Send email"
            title="Email"
            className="rounded-full border border-foreground/10 p-2 transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
