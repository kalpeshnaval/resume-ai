import type { ReactNode } from "react";

export type CoverLetterTemplate =
  | "classic"
  | "modern"
  | "minimal"
  | "executive"
  | "editorial"
  | "midnight";

type Props = {
  content: string;
  template: CoverLetterTemplate;
};

function pageShell(pageTone: string, frameTone: string, content: ReactNode) {
  return (
    <div className={`mx-auto flex h-[1123px] w-[794px] flex-col overflow-hidden ${pageTone} ${frameTone}`}>
      {content}
    </div>
  );
}

function getParagraphs(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function CoverLetterPreview({ content, template }: Props) {
  const paragraphs = getParagraphs(content);

  const bodyClass =
    template === "classic"
      ? "bg-[#fffdfa] px-16 py-14 font-serif text-[15px] leading-8 text-stone-900"
      : template === "modern"
        ? "bg-[#f8fafc] px-16 py-14 font-sans text-[15px] leading-8 text-slate-800"
        : template === "minimal"
          ? "bg-white px-20 py-16 font-serif text-[15px] leading-8 text-zinc-900"
          : template === "executive"
            ? "bg-[#fcfbf7] px-16 py-14 font-serif text-[15px] leading-8 text-slate-900"
            : template === "editorial"
              ? "bg-[#fffaf2] px-16 py-14 font-serif text-[15px] leading-8 text-amber-950"
              : "bg-[#f7f8fb] px-16 py-14 font-sans text-[15px] leading-8 text-slate-800";

  const pageTone =
    template === "classic"
      ? "bg-[#f8f4ec]"
      : template === "modern"
        ? "bg-[#edf2f7]"
        : template === "minimal"
          ? "bg-[#f4f4f2]"
          : template === "executive"
            ? "bg-[#f2f0ea]"
            : template === "editorial"
              ? "bg-[#fff4e4]"
              : "bg-[#e8edf6]";

  const frameTone =
    template === "classic"
      ? "bg-[#fffdfa]"
      : template === "modern"
        ? "bg-[#f8fafc]"
        : template === "minimal"
          ? "bg-white"
          : template === "executive"
            ? "bg-[#fcfbf7]"
            : template === "editorial"
              ? "bg-[#fffaf2]"
              : "bg-[#f7f8fb]";

  return pageShell(
    pageTone,
    frameTone,
    <div className={bodyClass}>
      <div className="space-y-7 whitespace-pre-wrap">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>,
  );
}
