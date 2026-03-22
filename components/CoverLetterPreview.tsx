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
  companyName?: string;
  companyAddress?: string;
  letterDate?: string;
};

function pageShell(frameTone: string, content: ReactNode) {
  return (
    <div className={`mx-auto flex h-[1123px] w-[794px] flex-col overflow-hidden ${frameTone}`}>
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

export default function CoverLetterPreview({
  content,
  template,
  companyName,
  companyAddress,
  letterDate,
}: Props) {
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
    frameTone,
    <div className={bodyClass}>
      <div className="space-y-7 whitespace-pre-wrap">
        {(letterDate || companyName || companyAddress) && (
          <div className="space-y-8">
            {letterDate && <p className="text-right">{letterDate}</p>}
            {(companyName || companyAddress) && (
              <div className="space-y-2">
                {companyName && <p>{companyName}</p>}
                {companyAddress && <p>{companyAddress}</p>}
              </div>
            )}
          </div>
        )}
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>,
  );
}
