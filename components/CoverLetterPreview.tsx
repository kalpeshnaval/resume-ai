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
    <div className={`mx-auto flex h-[1123px] w-[794px] overflow-hidden rounded-[10px] border border-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.18)] ${pageTone}`}>
      <div className={`flex h-full w-full flex-col overflow-hidden ${frameTone}`}>
        {content}
      </div>
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
      ? "border-stone-200 bg-[#fffdfa]"
      : template === "modern"
        ? "border-slate-200 bg-[#f8fafc]"
        : template === "minimal"
          ? "border-zinc-200 bg-white"
          : template === "executive"
            ? "border-slate-300 bg-[#fcfbf7]"
            : template === "editorial"
              ? "border-amber-100 bg-[#fffaf2]"
              : "border-slate-800 bg-[#f7f8fb]";

  return (
    <div id="letter-preview">
      {pageShell(
        pageTone,
        frameTone,
        <div className={bodyClass}>
          <div className="space-y-7 whitespace-pre-wrap">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>,
      )}
    </div>
  );
}
