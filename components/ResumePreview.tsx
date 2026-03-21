import type { ReactNode } from "react";
import type { ResumeData } from "@/app/builder/page";

type ResumeTemplate = "standard" | "modern" | "minimalist" | "creative" | "executive" | "tech";

type Props = {
  data: ResumeData;
  template?: ResumeTemplate;
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

function renderSkills(skills: string) {
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export default function ResumePreview({ data, template = "standard" }: Props) {
  const skills = renderSkills(data.skills);

  if (template === "standard") {
    return (
      <div id="resume-preview">
        {pageShell(
          "bg-[#f8fafc]",
          "border-slate-200 bg-white",
          <div className="flex h-full flex-col bg-white px-10 py-10">
          <header className="mb-6 border-b-2 border-slate-900 pb-4">
            <h1 className="mb-2 text-4xl font-bold uppercase tracking-wider text-slate-900">
              {data.personalInfo.fullName || "Your Name"}
            </h1>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
              {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
              {data.personalInfo.phone && <span>| {data.personalInfo.phone}</span>}
              {data.personalInfo.location && <span>| {data.personalInfo.location}</span>}
            </div>
          </header>

          <div className="flex-1 space-y-6 overflow-hidden">
            {data.personalInfo.summary && (
              <section>
                <h2 className="mb-3 border-b border-slate-300 pb-1 text-lg font-bold uppercase tracking-wide text-slate-900">
                  Professional Summary
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{data.personalInfo.summary}</p>
              </section>
            )}

            {data.experience.length > 0 && (
              <section>
                <h2 className="mb-4 border-b border-slate-300 pb-1 text-lg font-bold uppercase tracking-wide text-slate-900">
                  Experience
                </h2>
                <div className="space-y-4">
                  {data.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="mb-1 flex items-start justify-between gap-4">
                        <h3 className="text-base font-bold text-slate-900">{exp.title}</h3>
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ""}
                        </span>
                      </div>
                      <div className="mb-2 text-sm font-semibold text-slate-700">{exp.company}</div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.education.length > 0 && (
              <section>
                <h2 className="mb-4 border-b border-slate-300 pb-1 text-lg font-bold uppercase tracking-wide text-slate-900">
                  Education
                </h2>
                <div className="space-y-3">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{edu.degree}</h3>
                        <div className="text-sm text-slate-700">{edu.school}</div>
                      </div>
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {skills.length > 0 && (
              <section>
                <h2 className="mb-3 border-b border-slate-300 pb-1 text-lg font-bold uppercase tracking-wide text-slate-900">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2 text-sm text-slate-800">
                  {skills.map((skill) => (
                    <span key={skill} className="rounded border border-slate-300 px-2 py-1 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
          </div>,
        )}
      </div>
    );
  }

  if (template === "modern") {
    return (
      <div id="resume-preview">
        {pageShell(
          "bg-[#eef2f7]",
          "border-slate-200 bg-[#f8fafc]",
          <>
        <header className="bg-slate-950 px-10 py-10 text-white">
          <h1 className="mb-2 text-4xl font-light tracking-tight">{data.personalInfo.fullName || "Your Name"}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>| {data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>| {data.personalInfo.location}</span>}
          </div>
        </header>
        <div className="flex flex-1 flex-col bg-[#f8fafc] px-10 py-8">
          <ResumeBody
            data={data}
            skills={skills}
            headingClass="mb-4 border-b-2 border-slate-200 pb-2 text-lg font-semibold text-slate-900"
            bodyTextClass="text-sm leading-relaxed text-slate-600"
            companyClass="mb-2 text-sm font-medium text-slate-500"
            dateClass="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm"
            skillsRenderer={(items) => (
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span key={skill} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          />
        </div>
          </>,
        )}
      </div>
    );
  }

  if (template === "minimalist") {
    return (
      <div id="resume-preview">
        {pageShell(
          "bg-[#f6f2ea]",
          "border-stone-200 bg-[#fcfaf7]",
          <>
        <header className="bg-[#fcfaf7] px-14 pb-8 pt-14 text-center">
          <h1 className="mb-4 text-5xl uppercase tracking-[0.2em] text-stone-900">{data.personalInfo.fullName || "Your Name"}</h1>
          <div className="flex flex-wrap justify-center gap-3 text-xs uppercase tracking-[0.22em] text-stone-500">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          </div>
        </header>
        <div className="flex flex-1 flex-col bg-[#fcfaf7] px-16 py-8">
          <ResumeBody
            data={data}
            skills={skills}
            headingClass="mb-5 text-center text-xs font-bold uppercase tracking-[0.28em] text-stone-400"
            bodyTextClass="text-sm leading-loose text-stone-700"
            companyClass="mb-2 text-sm font-medium text-stone-500"
            dateClass="text-xs font-bold uppercase tracking-[0.2em] text-stone-400"
            educationRowClass="grid grid-cols-[100px_1fr] gap-4"
            experienceRowClass="grid grid-cols-[120px_1fr] gap-4"
            minimalist
            skillsRenderer={(items) => (
              <div className="text-center text-sm uppercase tracking-wide text-stone-700">
                {items.join(" | ")}
              </div>
            )}
          />
        </div>
          </>,
        )}
      </div>
    );
  }

  if (template === "creative") {
    return (
      <div id="resume-preview">
        {pageShell(
          "bg-[#fff5e8]",
          "border-amber-100 bg-[#fffbf5]",
          <>
        <header className="border-b border-amber-100 bg-[#fff7ea] px-10 pb-6 pt-10">
          <div className="text-sm font-black uppercase tracking-[0.28em] text-amber-500">Creative Resume</div>
          <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-slate-900">{data.personalInfo.fullName || "Your Name"}</h1>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-medium text-amber-700">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>| {data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>| {data.personalInfo.location}</span>}
          </div>
        </header>
        <div className="flex flex-1 bg-[#fffbf5]">
          <aside className="w-[30%] border-r border-amber-100 bg-[#fff4df] p-8">
            {data.education.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-amber-500">Education</h2>
                <div className="space-y-4">
                  {data.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="text-sm font-bold text-slate-900">{edu.degree}</h3>
                      <div className="mb-1 text-xs text-slate-600">{edu.school}</div>
                      <div className="text-xs font-bold text-amber-700">{edu.year}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {skills.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-amber-500">Skills</h2>
                <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  {skills.map((skill) => (
                    <div key={skill}>- {skill}</div>
                  ))}
                </div>
              </section>
            )}
          </aside>
          <div className="flex-1 bg-[#fffbf5] p-8">
            <ResumeBody
              data={data}
              skills={[]}
              headingClass="mb-4 text-sm font-black uppercase tracking-[0.24em] text-amber-500"
              bodyTextClass="text-sm leading-relaxed text-slate-700"
              companyClass="mb-2 text-sm font-medium text-slate-500"
              dateClass="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800"
              skillsRenderer={() => null}
              omitEducation
              omitSkills
            />
          </div>
        </div>
          </>,
        )}
      </div>
    );
  }

  if (template === "executive") {
    return (
      <div id="resume-preview">
        {pageShell(
          "bg-[#f2f0ea]",
          "border-slate-300 bg-[#fcfbf8]",
          <>
        <header className="border-b-4 border-double border-slate-300 bg-[#fcfbf8] px-12 pb-8 pt-12 text-center">
          <h1 className="mb-3 text-4xl uppercase tracking-[0.14em] text-slate-900">{data.personalInfo.fullName || "Your Name"}</h1>
          <div className="flex flex-wrap justify-center gap-3 text-sm italic text-slate-600">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>| {data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>| {data.personalInfo.location}</span>}
          </div>
        </header>
        <div className="flex flex-1 flex-col bg-[#fcfbf8] px-12 py-10">
          <ResumeBody
            data={data}
            skills={skills}
            headingClass="mb-4 border-b border-slate-400 pb-1 text-xl font-serif text-slate-900"
            bodyTextClass="text-base leading-relaxed text-slate-800"
            companyClass="mb-2 text-base font-medium text-slate-700"
            dateClass="text-sm italic text-slate-500"
            skillsRenderer={(items) => (
              <div className="text-base leading-relaxed text-slate-800">{items.join(" | ")}</div>
            )}
            executive
          />
        </div>
          </>,
        )}
      </div>
    );
  }

  return (
    <div id="resume-preview">
      {pageShell(
        "bg-[#eaf5f0]",
        "border-emerald-100 bg-[#f3fbf8]",
        <>
      <header className="border-b-4 border-emerald-500 bg-emerald-950 px-8 py-8 text-emerald-50">
        <h1 className="mb-2 text-3xl font-bold uppercase tracking-tight text-emerald-400">{data.personalInfo.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap gap-3 font-mono text-sm text-emerald-100/75">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>| {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>| {data.personalInfo.location}</span>}
        </div>
      </header>
      <div className="flex flex-1 flex-col bg-[#f3fbf8] px-8 py-8">
        <ResumeBody
          data={data}
          skills={skills}
          headingClass="mb-3 flex items-center gap-2 text-sm font-bold uppercase text-emerald-800 before:content-['>']"
          bodyTextClass="text-sm leading-relaxed text-slate-700"
          companyClass="mb-2 font-mono text-sm text-slate-500"
          dateClass="rounded bg-emerald-100 px-2 py-1 font-mono text-xs text-emerald-700"
          tech
          skillsRenderer={(items) => (
            <div className="flex flex-wrap gap-2">
              {items.map((skill) => (
                <span key={skill} className="rounded border border-emerald-200 bg-white px-2 py-1 font-mono text-xs text-emerald-800">
                  {skill}
                </span>
              ))}
            </div>
            )}
          />
        </div>
        </>,
      )}
    </div>
  );
}

type ResumeBodyProps = {
  data: ResumeData;
  skills: string[];
  headingClass: string;
  bodyTextClass: string;
  companyClass: string;
  dateClass: string;
  skillsRenderer: (skills: string[]) => ReactNode;
  educationRowClass?: string;
  experienceRowClass?: string;
  omitEducation?: boolean;
  omitSkills?: boolean;
  minimalist?: boolean;
  executive?: boolean;
  tech?: boolean;
};

function ResumeBody({
  data,
  skills,
  headingClass,
  bodyTextClass,
  companyClass,
  dateClass,
  skillsRenderer,
  educationRowClass,
  experienceRowClass,
  omitEducation,
  omitSkills,
  minimalist,
  executive,
  tech,
}: ResumeBodyProps) {
  return (
    <div className="flex-1 space-y-7 overflow-hidden">
      {data.personalInfo.summary && (
        <section>
          <h2 className={headingClass}>{minimalist ? "Profile" : "Professional Summary"}</h2>
          <p className={bodyTextClass}>{data.personalInfo.summary}</p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section>
          <h2 className={headingClass}>Experience</h2>
          <div className="space-y-5">
            {data.experience.map((exp) => (
              <div key={exp.id} className={experienceRowClass}>
                {minimalist && (
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </div>
                )}
                <div>
                  <div className="mb-1 flex items-start justify-between gap-4">
                    <h3 className={`text-base font-bold ${executive ? "text-slate-900" : tech ? "text-slate-900" : "text-slate-900"}`}>
                      {exp.title}
                    </h3>
                    {!minimalist && <span className={dateClass}>{exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ""}</span>}
                  </div>
                  <div className={companyClass}>{exp.company}</div>
                  <div className={`${bodyTextClass} whitespace-pre-wrap ${tech ? "border-l-2 border-emerald-200 pl-4" : ""}`}>
                    {exp.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!omitEducation && data.education.length > 0 && (
        <section>
          <h2 className={headingClass}>Education</h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id} className={educationRowClass ?? "flex items-start justify-between gap-4"}>
                {minimalist && <div className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">{edu.year}</div>}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{edu.degree}</h3>
                  <div className={companyClass}>{edu.school}</div>
                </div>
                {!minimalist && <span className={dateClass}>{edu.year}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {!omitSkills && skills.length > 0 && (
        <section>
          <h2 className={headingClass}>Skills</h2>
          {skillsRenderer(skills)}
        </section>
      )}
    </div>
  );
}
