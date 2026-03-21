import type { ResumeData } from "@/app/builder/page";

type Props = {
  data: ResumeData;
  template?: "standard" | "modern" | "minimalist" | "creative" | "executive" | "tech";
};

export default function ResumePreview({ data, template = "standard" }: Props) {
  // Define layout styles based on template
  const isModern = template === "modern";
  const isMinimalist = template === "minimalist";
  const isCreative = template === "creative";
  const isExecutive = template === "executive";
  const isTech = template === "tech";

  // Base containers
  const containerClass = `w-[800px] min-h-[1056px] text-black shadow-xl mx-auto flex flex-col mb-10 overflow-hidden transform scale-90 lg:scale-[0.8] origin-top bg-white ${
    isModern ? "font-sans text-slate-800" :
    isMinimalist ? "font-serif text-gray-900" :
    isCreative ? "font-sans bg-slate-50 border-l-[16px] border-primary" :
    isExecutive ? "font-serif bg-[#fdfdfc] border-t-[8px] border-slate-900" :
    isTech ? "font-mono text-slate-900 bg-white" :
    "font-sans p-10" /* Standard */
  } ${!isStandard(template) ? "p-0" : ""}`;

  function isStandard(t: string) { return t === "standard"; }

  if (isStandard(template)) {
    // 1. STANDARD TEMPLATE (Free)
    return (
      <div id="resume-preview" className={containerClass}>
        <header className="border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-4xl font-bold uppercase tracking-wider text-slate-900 mb-2">
            {data.personalInfo.fullName || "Your Name"}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 font-medium">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
          </div>
        </header>

        <div className="flex-1 space-y-6">
          {data.personalInfo.summary && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">Professional Summary</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.personalInfo.summary}</p>
            </section>
          )}
          {data.experience.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-4">Experience</h2>
              <div className="space-y-4">
                {data.experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base font-bold text-slate-900">{exp.title}</h3>
                      <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded">{exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ""}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-2">{exp.company}</div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {data.education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-4">Education</h2>
              <div className="space-y-3">
                {data.education.map(edu => (
                  <div key={edu.id} className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{edu.degree}</h3>
                      <div className="text-sm text-slate-700">{edu.school}</div>
                    </div>
                    <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded">{edu.year}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
          {data.skills && (
            <section>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2 text-sm text-slate-800">
                {data.skills.split(",").map((s, i) => s.trim() && (
                  <span key={i} className="inline-block px-2 py-1 border border-slate-300 rounded font-medium">{s.trim()}</span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // Next 5 Premium Templates use a shared structured rendering but with different Tailwind layout mapping
  return (
    <div id="resume-preview" className={containerClass}>
      {/* HEADER SECTION */}
      <header className={`
        ${isModern ? "bg-slate-900 text-white p-10" : ""}
        ${isMinimalist ? "text-center pt-16 pb-8 px-10" : ""}
        ${isCreative ? "p-10 pb-6 border-b border-slate-200" : ""}
        ${isExecutive ? "text-center p-12 pb-8 border-b-4 border-double border-slate-300" : ""}
        ${isTech ? "bg-emerald-950 text-emerald-50 p-8 border-b-4 border-emerald-500" : ""}
      `}>
        <h1 className={`
          ${isModern ? "text-4xl font-light mb-2" : ""}
          ${isMinimalist ? "text-5xl tracking-widest uppercase mb-4 text-slate-800" : ""}
          ${isCreative ? "text-5xl font-extrabold text-slate-900 tracking-tighter mb-2" : ""}
          ${isExecutive ? "text-4xl font-serif text-slate-900 uppercase tracking-wide mb-3" : ""}
          ${isTech ? "text-3xl font-bold uppercase tracking-tight text-emerald-400 mb-2" : ""}
        `}>
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        <div className={`
          flex flex-wrap gap-x-4 gap-y-2 text-sm
          ${isModern ? "text-slate-300" : ""}
          ${isMinimalist ? "justify-center text-slate-500 uppercase tracking-widest text-xs" : ""}
          ${isCreative ? "text-primary font-medium" : ""}
          ${isExecutive ? "justify-center text-slate-600 italic" : ""}
          ${isTech ? "text-emerald-200/70" : ""}
        `}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
        </div>
      </header>

      {/* BODY SECTION */}
      <div className={`flex-1 ${isCreative ? "flex" : ""}`}>
        
        {/* Creative Left Sidebar (Only visible in 'creative') */}
        {isCreative && (
          <div className="w-1/3 bg-slate-100 p-8 pt-6 border-r border-slate-200 h-full">
            {data.education.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Education</h2>
                <div className="space-y-4">
                  {data.education.map(edu => (
                    <div key={edu.id}>
                      <h3 className="text-sm font-bold text-slate-900">{edu.degree}</h3>
                      <div className="text-xs text-slate-600 mb-1">{edu.school}</div>
                      <div className="text-xs font-bold text-primary">{edu.year}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {data.skills && (
              <section>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Skills</h2>
                <div className="flex flex-col gap-2 text-sm text-slate-700 font-medium">
                  {data.skills.split(",").map((s, i) => s.trim() && <div key={i}>• {s.trim()}</div>)}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className={`
          ${isModern ? "p-10 space-y-8" : ""}
          ${isMinimalist ? "px-16 py-8 space-y-10" : ""}
          ${isCreative ? "w-2/3 p-8 pt-6 space-y-8" : ""}
          ${isExecutive ? "px-12 py-10 space-y-8" : ""}
          ${isTech ? "p-8 space-y-6 bg-slate-50" : ""}
        `}>
          
          {data.personalInfo.summary && (
            <section>
              <h2 className={`
                ${isModern ? "text-lg font-semibold text-slate-900 border-b-2 border-slate-100 pb-2 mb-4" : ""}
                ${isMinimalist ? "text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 text-center" : ""}
                ${isCreative ? "text-sm font-black text-slate-400 uppercase tracking-widest mb-3" : ""}
                ${isExecutive ? "text-xl font-serif text-slate-900 border-b border-slate-400 pb-1 mb-4" : ""}
                ${isTech ? "text-sm font-bold text-emerald-700 uppercase mb-2 flex items-center gap-2 before:content-['>']" : ""}
              `}>
                {isMinimalist ? "Profile" : "Professional Summary"}
              </h2>
              <p className={`
                ${isModern ? "text-slate-600 leading-relaxed" : ""}
                ${isMinimalist ? "text-slate-700 leading-loose text-justify" : ""}
                ${isCreative ? "text-slate-700 leading-relaxed font-medium text-sm" : ""}
                ${isExecutive ? "text-slate-800 leading-relaxed text-justify indent-8" : ""}
                ${isTech ? "text-slate-700 leading-relaxed text-sm" : ""}
              `}>
                {data.personalInfo.summary}
              </p>
            </section>
          )}

          {data.experience.length > 0 && (
            <section>
              <h2 className={`
                ${isModern ? "text-lg font-semibold text-slate-900 border-b-2 border-slate-100 pb-2 mb-6" : ""}
                ${isMinimalist ? "text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 text-center" : ""}
                ${isCreative ? "text-sm font-black text-slate-400 uppercase tracking-widest mb-6" : ""}
                ${isExecutive ? "text-xl font-serif text-slate-900 border-b border-slate-400 pb-1 mb-6" : ""}
                ${isTech ? "text-sm font-bold text-emerald-700 uppercase mb-4 flex items-center gap-2 before:content-['>']" : ""}
              `}>
                Experience
              </h2>
              <div className="space-y-6">
                {data.experience.map(exp => (
                  <div key={exp.id} className={isMinimalist ? "grid grid-cols-[120px_1fr] gap-4 items-baseline" : ""}>
                    {isMinimalist && (
                      <div className="text-xs font-bold text-slate-400 tracking-wider">
                        {exp.startDate} -<br/>{exp.endDate || "Present"}
                      </div>
                    )}
                    
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className={`
                          ${isModern ? "text-lg font-medium text-slate-900" : ""}
                          ${isMinimalist ? "text-base font-bold text-slate-800 uppercase tracking-wide" : ""}
                          ${isCreative ? "text-base font-extrabold text-slate-900" : ""}
                          ${isExecutive ? "text-lg font-bold text-slate-900" : ""}
                          ${isTech ? "text-base font-bold text-slate-800" : ""}
                        `}>{exp.title}</h3>
                        
                        {!isMinimalist && (
                          <span className={`
                            ${isModern ? "text-sm font-medium text-primary" : ""}
                            ${isCreative ? "text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full" : ""}
                            ${isExecutive ? "text-sm font-medium text-slate-500 italic" : ""}
                            ${isTech ? "text-xs font-mono text-emerald-600 bg-emerald-100 px-2 py-0.5" : ""}
                          `}>
                            {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ""}
                          </span>
                        )}
                      </div>
                      <div className={`
                        ${isModern ? "text-slate-500 text-sm mb-3" : ""}
                        ${isMinimalist ? "text-primary text-sm font-medium mb-3" : ""}
                        ${isCreative ? "text-slate-500 text-sm font-medium mb-2" : ""}
                        ${isExecutive ? "text-slate-700 text-base font-medium mb-2" : ""}
                        ${isTech ? "text-slate-500 text-sm font-mono mb-2" : ""}
                      `}>{exp.company}</div>
                      
                      <div className={`
                        whitespace-pre-wrap
                        ${isModern ? "text-slate-600 text-sm leading-relaxed" : ""}
                        ${isMinimalist ? "text-slate-600 text-sm leading-relaxed" : ""}
                        ${isCreative ? "text-slate-700 text-sm leading-relaxed" : ""}
                        ${isExecutive ? "text-slate-800 text-base leading-relaxed" : ""}
                        ${isTech ? "text-slate-600 text-sm leading-relaxed border-l-2 border-emerald-200 pl-4 ml-1" : ""}
                      `}>
                        {exp.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Render Education and Skills here for non-creative templates */}
          {!isCreative && data.education.length > 0 && (
            <section>
              <h2 className={`
                ${isModern ? "text-lg font-semibold text-slate-900 border-b-2 border-slate-100 pb-2 mb-4 mt-8" : ""}
                ${isMinimalist ? "text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 text-center mt-10" : ""}
                ${isExecutive ? "text-xl font-serif text-slate-900 border-b border-slate-400 pb-1 mb-4 mt-8" : ""}
                ${isTech ? "text-sm font-bold text-emerald-700 uppercase mb-4 mt-6 flex items-center gap-2 before:content-['>']" : ""}
              `}>
                Education
              </h2>
              <div className="space-y-4">
                {data.education.map(edu => (
                  <div key={edu.id} className={isMinimalist ? "grid grid-cols-[120px_1fr] gap-4 items-baseline" : "flex justify-between items-baseline"}>
                    
                    {isMinimalist && (
                      <div className="text-xs font-bold text-slate-400 tracking-wider">
                        {edu.year}
                      </div>
                    )}

                    <div className={isMinimalist ? "" : ""}>
                      <h3 className={`
                        ${isModern ? "font-medium text-slate-900" : ""}
                        ${isMinimalist ? "font-bold text-slate-800 uppercase tracking-wide text-sm" : ""}
                        ${isExecutive ? "font-bold text-slate-900" : ""}
                        ${isTech ? "font-bold text-slate-800 text-sm" : ""}
                      `}>{edu.degree}</h3>
                      <div className={`
                        ${isModern ? "text-sm text-slate-500" : ""}
                        ${isMinimalist ? "text-sm text-primary font-medium" : ""}
                        ${isExecutive ? "text-base text-slate-700" : ""}
                        ${isTech ? "text-sm text-slate-500 font-mono mt-1" : ""}
                      `}>{edu.school}</div>
                    </div>

                    {!isMinimalist && (
                      <span className={`
                        ${isModern ? "text-sm font-medium text-primary" : ""}
                        ${isExecutive ? "text-sm font-medium text-slate-500 italic" : ""}
                        ${isTech ? "text-xs font-mono text-emerald-600" : ""}
                      `}>{edu.year}</span>
                    )}

                  </div>
                ))}
              </div>
            </section>
          )}

          {!isCreative && data.skills && (
             <section>
              <h2 className={`
                ${isModern ? "text-lg font-semibold text-slate-900 border-b-2 border-slate-100 pb-2 mb-4 mt-8" : ""}
                ${isMinimalist ? "text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 text-center mt-10" : ""}
                ${isExecutive ? "text-xl font-serif text-slate-900 border-b border-slate-400 pb-1 mb-4 mt-8" : ""}
                ${isTech ? "text-sm font-bold text-emerald-700 uppercase mb-4 mt-6 flex items-center gap-2 before:content-['>']" : ""}
              `}>
                Skills
              </h2>
              <div className={`
                ${isModern ? "flex flex-wrap gap-2 text-sm text-slate-700" : ""}
                ${isMinimalist ? "text-center text-sm text-slate-600 leading-loose uppercase tracking-wide" : ""}
                ${isExecutive ? "text-base text-slate-800 leading-relaxed" : ""}
                ${isTech ? "flex flex-wrap gap-2" : ""}
              `}>
                {isMinimalist || isExecutive 
                  ? data.skills.split(",").map(s => s.trim()).join(" • ")
                  : data.skills.split(",").map((s, i) => s.trim() && (
                    <span key={i} className={`
                      ${isModern ? "px-3 py-1 bg-slate-100 rounded-full font-medium" : ""}
                      ${isTech ? "px-2 py-0.5 border border-emerald-200 bg-emerald-50 text-emerald-800 font-mono text-xs" : ""}
                    `}>{s.trim()}</span>
                  ))
                }
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
