import React from 'react';
import { Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';

const LayoutExecutive = ({ data, pageIndex }) => {
    const { personal, experience, education, skills, customSections } = data;

    const shouldRenderTitle = (sectionId) => {
        return !data.sectionStartPage || data.sectionStartPage[sectionId] === pageIndex;
    };

    return (
        <div className="w-full h-[297mm] bg-white text-slate-800 font-serif overflow-hidden relative">
            {/* Elegant Top Border */}
            <div className="absolute top-0 left-0 w-full h-3 bg-slate-900"></div>
            <div className="absolute top-3 left-0 w-full h-1 bg-[#D4AF37]"></div> {/* Gold Accent */}
            <div className="px-16 py-12 h-full flex flex-col">
                {/* Header - Only on first page */}
                {(!pageIndex || pageIndex === 0) && (
                    <header className="text-center mb-10 border-b border-slate-200 pb-8">
                        <h1
                            className="text-4xl font-bold text-slate-900 mb-3 tracking-wide uppercase"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            {personal.fullName}
                        </h1>
                        <p className="text-lg text-slate-600 mb-6 font-medium italic tracking-wider">
                            {personal.title}
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 font-sans">
                            {personal.email && (
                                <div className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>{' '}
                                    {personal.email}
                                </div>
                            )}
                            {personal.phone && (
                                <div className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>{' '}
                                    {personal.phone}
                                </div>
                            )}
                            {personal.location && (
                                <div className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>{' '}
                                    {personal.location}
                                </div>
                            )}
                            {personal.socials?.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.url}
                                    className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors"
                                >
                                    <span className="w-1 h-1 bg-[#D4AF37] rounded-full"></span>{' '}
                                    {social.network}
                                </a>
                            ))}
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-8">
                    {/* Summary */}
                    {personal.summary && (!pageIndex || pageIndex === 0) && (
                        <section id="section-summary" className="text-center max-w-2xl mx-auto">
                            <p className="text-slate-700 leading-relaxed italic">"{personal.summary}"</p>
                        </section>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <section id="section-experience">
                            {shouldRenderTitle('experience') && (
                                <div id="section-title-experience" className="flex items-center gap-4 mb-6">
                                    <div className="h-px bg-slate-300 flex-1"></div>
                                    <h3 className="text-md font-bold uppercase tracking-widest text-slate-900 font-sans">
                                        Experience
                                    </h3>
                                    <div className="h-px bg-slate-300 flex-1"></div>
                                </div>
                            )}
                            <div className="space-y-8">
                                {experience.map((exp) => (
                                    <div key={exp.id} id={`item-${exp.id}`}>
                                        <div className="flex justify-between items-baseline mb-1 font-sans">
                                            <h4 className="text-lg font-bold text-slate-900">{exp.role}</h4>
                                            <span className="text-sm text-slate-500 font-medium">
                                                {exp.date}
                                            </span>
                                        </div>
                                        <div className="text-md text-[#D4AF37] font-bold mb-3 font-sans uppercase tracking-wide text-xs">
                                            {exp.company}
                                            {exp.location && ` | ${exp.location}`}
                                        </div>
                                        {exp.bullets && exp.bullets.length > 0 && (
                                            <ul className="space-y-1.5">
                                                {exp.bullets.map((bullet, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-gray-700 text-sm leading-relaxed flex items-start gap-2"
                                                    >
                                                        <span className="text-amber-600 mt-0.5">•</span>
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
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
                                    className="flex items-center gap-4 mb-6 mt-2"
                                >
                                    <div className="h-px bg-slate-300 flex-1"></div>
                                    <h3 className="text-md font-bold uppercase tracking-widest text-slate-900 font-sans">
                                        Education
                                    </h3>
                                    <div className="h-px bg-slate-300 flex-1"></div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-4">
                                {education.map((edu) => (
                                    <div
                                        key={edu.id}
                                        id={`item-${edu.id}`}
                                        className="flex justify-between items-end border-b border-slate-100 pb-2"
                                    >
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">{edu.school}</h4>
                                            <div className="text-slate-600 italic">{edu.degree}</div>
                                        </div>
                                        <span className="text-sm text-slate-500 font-sans font-medium">
                                            {edu.date}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <section id="section-skills">
                            {shouldRenderTitle('skills') && (
                                <div id="section-title-skills" className="flex items-center gap-4 mb-6 mt-2">
                                    <div className="h-px bg-slate-300 flex-1"></div>
                                    <h3 className="text-md font-bold uppercase tracking-widest text-slate-900 font-sans">
                                        Skills
                                    </h3>
                                    <div className="h-px bg-slate-300 flex-1"></div>
                                </div>
                            )}
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                                {skills.map((skill, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 text-slate-700 font-medium text-sm"
                                    >
                                        <span className="w-1.5 h-1.5 bg-[#D4AF37] rotate-45"></span>
                                        {skill}
                                    </div>
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
                                            className="flex items-center gap-4 mb-6 mt-2"
                                        >
                                            <div className="h-px bg-slate-300 flex-1"></div>
                                            <h3 className="text-md font-bold uppercase tracking-widest text-slate-900 font-sans">
                                                {section.title}
                                            </h3>
                                            <div className="h-px bg-slate-300 flex-1"></div>
                                        </div>
                                    )}
                                    <div className="space-y-6">
                                        {section.items.map((item) => (
                                            <div key={item.id} id={`item-${item.id}`}>
                                                <div className="flex justify-between items-baseline mb-1 font-sans">
                                                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                                                    {item.date && (
                                                        <span className="text-sm text-slate-500">
                                                            {item.date}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.subtitle && (
                                                    <div className="text-[#D4AF37] text-xs font-bold uppercase mb-2">
                                                        {item.subtitle}
                                                    </div>
                                                )}
                                                {item.description && (
                                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line text-justify">
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

export default LayoutExecutive;
