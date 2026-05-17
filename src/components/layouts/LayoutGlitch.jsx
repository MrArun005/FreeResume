import React from 'react';
import {
    MapPin,
    Mail,
    Phone,
    Link as LinkIcon,
    Github,
    Linkedin,
    Twitter,
    Globe,
    Terminal,
} from 'lucide-react';

const LayoutGlitch = ({ data, pageIndex }) => {
    const { personal, experience, education, skills, customSections } = data;

    // Helper to check if section title should be rendered (only on first page of section)
    const shouldRenderTitle = (sectionId) => {
        return !data.sectionStartPage || data.sectionStartPage[sectionId] === pageIndex;
    };

    return (
        <div className="w-full h-[297mm] bg-zinc-900 text-zinc-300 font-mono text-sm leading-relaxed overflow-hidden relative selection:bg-cyan-500 selection:text-black">
            {/* Glitch Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-magenta-500 to-yellow-500 opacity-70"></div>
            {/* decorative glow removed for PDF compatibility */}

            <div className="p-12 h-full flex flex-col">
                {/* Header - Only on first page */}
                {(!pageIndex || pageIndex === 0) && (
                    <header className="border-b-2 border-zinc-800 pb-8 mb-8 relative group">
                        <div className="absolute -left-4 top-0 h-full w-1 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h1
                            className="text-5xl font-bold text-white tracking-tighter mb-2 uppercase glitch-text"
                            style={{ textShadow: '2px 2px 0px #06b6d4' }}
                        >
                            {personal.fullName}
                        </h1>
                        <p className="text-xl text-cyan-400 mb-6 font-medium tracking-wide">
                            &gt; {personal.title} <span className="animate-pulse">_</span>
                        </p>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-400">
                            {personal.email && (
                                <div className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                                    <Mail size={14} /> {personal.email}
                                </div>
                            )}
                            {personal.phone && (
                                <div className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                                    <Phone size={14} /> {personal.phone}
                                </div>
                            )}
                            {personal.location && (
                                <div className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                                    <MapPin size={14} /> {personal.location}
                                </div>
                            )}
                            {personal.socials?.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.url}
                                    className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
                                >
                                    <LinkIcon size={14} /> {social.network}
                                </a>
                            ))}
                        </div>
                    </header>
                )}

                {/* Main Content Grid */}
                <div className="flex-1 flex flex-col gap-8">
                    {/* Summary */}
                    {personal.summary && (!pageIndex || pageIndex === 0) && (
                        <section id="section-summary">
                            <div className="mb-4 flex items-center gap-2 text-cyan-500">
                                <Terminal size={16} />
                                <h3 className="text-sm font-bold uppercase tracking-widest">About_Me</h3>
                            </div>
                            <p className="text-zinc-400 max-w-3xl border-l border-zinc-800 pl-4">
                                {personal.summary}
                            </p>
                        </section>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <section id="section-experience">
                            {shouldRenderTitle('experience') && (
                                <div
                                    id="section-title-experience"
                                    className="mb-6 flex items-center gap-2 text-magenta-500 border-b border-zinc-800 pb-2"
                                >
                                    <span className="text-lg font-bold">01.</span>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                                        Experience_Log
                                    </h3>
                                </div>
                            )}
                            <div className="space-y-6">
                                {experience.map((exp) => (
                                    <div key={exp.id} id={`item-${exp.id}`} className="group">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                {exp.role}
                                            </h4>
                                            <span className="text-xs text-zinc-500 font-mono">
                                                [{exp.date}]
                                            </span>
                                        </div>
                                        <div className="text-sm text-cyan-600 mb-2 font-medium">
                                            @ {exp.company}
                                        </div>
                                        <p className="text-zinc-400 text-sm whitespace-pre-line border-l border-zinc-800 pl-4 hover:border-cyan-500/50 transition-colors">
                                            {exp.bullets && exp.bullets.length > 0 && (
                                                <ul className="space-y-1.5">
                                                    {exp.bullets.map((bullet, i) => (
                                                        <li
                                                            key={i}
                                                            className="text-gray-300 text-sm leading-relaxed flex items-start gap-2"
                                                        >
                                                            <span className="text-cyan-400">▶</span>
                                                            <span>{bullet}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <section id="section-education">
                            {shouldRenderTitle('education') && (
                                <div
                                    id="section-title-education"
                                    className="mb-6 flex items-center gap-2 text-yellow-500 border-b border-zinc-800 pb-2"
                                >
                                    <span className="text-lg font-bold">02.</span>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                                        Education_Data
                                    </h3>
                                </div>
                            )}
                            <div className="space-y-4">
                                {education.map((edu) => (
                                    <div key={edu.id} id={`item-${edu.id}`}>
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-bold text-white">{edu.school}</h4>
                                            <span className="text-xs text-zinc-500">[{edu.date}]</span>
                                        </div>
                                        <div className="text-zinc-400">{edu.degree}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <section id="section-skills">
                            {shouldRenderTitle('skills') && (
                                <div
                                    id="section-title-skills"
                                    className="mb-6 flex items-center gap-2 text-green-500 border-b border-zinc-800 pb-2"
                                >
                                    <span className="text-lg font-bold">03.</span>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                                        Skill_Matrix
                                    </h3>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-zinc-800 text-cyan-400 text-xs rounded-sm border border-zinc-700 hover:border-cyan-500 hover:bg-zinc-800/80 transition-all"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Custom Sections */}
                    {customSections?.map(
                        (section) =>
                            section.items.length > 0 && (
                                <section key={section.id} id={`section-${section.id}`}>
                                    {shouldRenderTitle(section.id) && (
                                        <div
                                            id={`section-title-${section.id}`}
                                            className="mb-6 flex items-center gap-2 text-purple-500 border-b border-zinc-800 pb-2"
                                        >
                                            <span className="text-lg font-bold">#</span>
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                                                {section.title.replace(/\s+/g, '_')}
                                            </h3>
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        {section.items.map((item) => (
                                            <div key={item.id} id={`item-${item.id}`}>
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h4 className="font-bold text-white">{item.title}</h4>
                                                    {item.date && (
                                                        <span className="text-xs text-zinc-500">
                                                            [{item.date}]
                                                        </span>
                                                    )}
                                                </div>
                                                {item.subtitle && (
                                                    <div className="text-cyan-600 text-sm mb-1">
                                                        {item.subtitle}
                                                    </div>
                                                )}
                                                {item.description && (
                                                    <p className="text-zinc-400 text-sm whitespace-pre-line border-l border-zinc-800 pl-4">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )
                    )}
                </div>
            </div>
        </div>
    );
};

export default LayoutGlitch;
