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

function pageShell(pageTone: string, frameTone: string, content: React.ReactNode) {
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

  if (template === "classic") {
    return (
      <div id="letter-preview">
        {pageShell(
          "bg-[#f8f4ec]",
          "border-stone-200 bg-[#fffdfa]",
          <>
        <div className="border-b border-stone-200 px-16 pb-8 pt-14">
          <div className="text-[14px] uppercase tracking-[0.35em] text-stone-500">Cover Letter</div>
          <div className="mt-4 h-[2px] w-20 bg-stone-800" />
        </div>
        <div className="flex-1 bg-[#fffdfa] px-16 py-12 font-serif text-[15px] leading-8 text-stone-900">
          <div className="space-y-7 whitespace-pre-wrap">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
          </>,
        )}
      </div>
    );
  }

  if (template === "modern") {
    return (
      <div id="letter-preview">
        {pageShell(
          "bg-[#edf2f7]",
          "border-slate-200 bg-[#f8fafc]",
          <>
        <div className="bg-slate-950 px-16 py-12 text-white">
          <div className="text-sm uppercase tracking-[0.4em] text-slate-300">Application Letter</div>
          <div className="mt-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-700" />
            <div className="text-xs uppercase tracking-[0.45em] text-slate-400">Refined</div>
          </div>
        </div>
        <div className="flex-1 bg-[#f8fafc] px-16 py-12 font-sans text-[15px] leading-8 text-slate-800">
          <div className="space-y-6 whitespace-pre-wrap">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
          </>,
        )}
      </div>
    );
  }

  if (template === "minimal") {
    return (
      <div id="letter-preview">
        {pageShell(
          "bg-[#f4f4f2]",
          "border-zinc-200 bg-white",
          <>
        <div className="px-16 pt-16 text-center">
          <div className="text-[13px] uppercase tracking-[0.5em] text-zinc-400">Letter</div>
          <div className="mx-auto mt-6 h-px w-24 bg-zinc-300" />
        </div>
        <div className="flex-1 bg-white px-20 py-14 font-serif text-[15px] leading-8 text-zinc-900">
          <div className="space-y-8 whitespace-pre-wrap">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
          </>,
        )}
      </div>
    );
  }

  if (template === "executive") {
    return (
      <div id="letter-preview">
        {pageShell(
          "bg-[#f2f0ea]",
          "border-slate-300 bg-[#fcfbf7]",
          <>
        <div className="border-b-4 border-double border-slate-300 px-16 py-12 text-center">
          <div className="text-[12px] uppercase tracking-[0.45em] text-slate-500">Executive Correspondence</div>
        </div>
        <div className="flex-1 bg-[#fcfbf7] px-16 py-12 font-serif text-[15px] leading-8 text-slate-900">
          <div className="space-y-7 whitespace-pre-wrap">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
          </>,
        )}
      </div>
    );
  }

  if (template === "editorial") {
    return (
      <div id="letter-preview">
        {pageShell(
          "bg-[#fff4e4]",
          "border-amber-100 bg-[#fffaf2]",
          <>
        <div className="grid grid-cols-[28px_1fr] bg-[#fff4df] px-12 py-12">
          <div className="rounded-full bg-amber-500" />
          <div className="pl-6">
            <div className="text-[13px] uppercase tracking-[0.4em] text-amber-900">Editorial Style</div>
            <div className="mt-3 text-sm text-amber-800">Confident, polished, and warm.</div>
          </div>
        </div>
        <div className="flex-1 bg-[#fffaf2] px-16 py-12 font-serif text-[15px] leading-8 text-amber-950">
          <div className="space-y-7 whitespace-pre-wrap">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
          </>,
        )}
      </div>
    );
  }

  return (
    <div id="letter-preview">
      {pageShell(
        "bg-[#e8edf6]",
        "border-slate-800 bg-[#f7f8fb]",
        <>
      <div className="bg-slate-900 px-16 py-10 text-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] uppercase tracking-[0.45em] text-slate-400">Midnight</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">Cover Letter</div>
          </div>
          <div className="h-12 w-12 rounded-full border border-indigo-400/50 bg-indigo-500/10" />
        </div>
      </div>
      <div className="flex-1 bg-[#f7f8fb] px-16 py-12 font-sans text-[15px] leading-8 text-slate-800">
        <div className="space-y-6 whitespace-pre-wrap">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
        </>,
      )}
    </div>
  );
}
