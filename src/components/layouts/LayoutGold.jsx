import React from 'react';
import { Mail, Phone, MapPin, Link as LinkIcon, Award } from 'lucide-react';

const LayoutGold = ({ data, pageIndex }) => {
    const { personal, experience, education, skills, customSections } = data;

    const shouldRenderTitle = (sectionId) => {
        return !data.sectionStartPage || data.sectionStartPage[sectionId] === pageIndex;
    };

    const goldColor = '#C5A028'; // A slightly darker, richer gold for better readability
    const bgRich = '#FFFCF5'; // Very subtle cream background

    return (
        <div className="w-full h-[297mm] text-slate-800 font-serif overflow-hidden relative print:break-inside-avoid print:break-before-avoid" style={{ backgroundColor: bgRich }}>
            {/* Decorative Frame */}
            <div className="absolute inset-4 border-2 border-double" style={{ borderColor: goldColor, opacity: 0.3, pointerEvents: 'none' }}></div>

            {/* Corner Accents */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4" style={{ borderColor: goldColor }}></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4" style={{ borderColor: goldColor }}></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4" style={{ borderColor: goldColor }}></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4" style={{ borderColor: goldColor }}></div>

            <div className="px-20 py-10 h-full flex flex-col">

                {/* Header - Only on first page */}
                {(!pageIndex || pageIndex === 0) && (
                    <header className="text-center mb-12 relative">
                        <div className="inline-block mb-4 p-2 border rounded-full" style={{ borderColor: goldColor }}>
                            <Award size={24} color={goldColor} />
                        </div>
                        <h1 className="text-5xl font-bold mb-4 tracking-wide uppercase" style={{ color: '#1a1a1a', fontFamily: 'Playfair Display, serif' }}>
                            {personal.fullName}
                        </h1>
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 bg-slate-300"></div>
                            <p className="text-xl font-medium italic tracking-wider" style={{ color: goldColor }}>
                                {personal.title}
                            </p>
                            <div className="h-px w-12 bg-slate-300"></div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-slate-600 font-sans tracking-wide">
                            {personal.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={12} color={goldColor} /> {personal.email}
                                </div>
                            )}
                            {personal.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={12} color={goldColor} /> {personal.phone}
                                </div>
                            )}
                            {personal.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} color={goldColor} /> {personal.location}
                                </div>
                            )}
                            {personal.socials?.map((social, index) => (
                                <a key={index} href={social.url} className="flex items-center gap-2 hover:text-[#C5A028] transition-colors">
                                    <LinkIcon size={12} color={goldColor} /> {social.network}
                                </a>
                            ))}
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-10">
                    {data.sectionOrder?.map(sectionId => {
                        const isCustom = !['summary', 'experience', 'education', 'skills'].includes(sectionId);
                        const customSection = isCustom ? customSections?.find(s => s.id === sectionId) : null;

                        // Summary
                        if (sectionId === 'summary' && personal.summary) {
                            return (
                                <section key="summary" id="section-summary" className="text-center max-w-3xl mx-auto">
                                    <p className="text-slate-700 leading-loose text-justify font-light text-sm">
                                        <span className="text-4xl float-left mr-2 -mt-2" style={{ color: goldColor, fontFamily: 'Playfair Display, serif' }}>"</span>
                                        {personal.summary}
                                    </p>
                                </section>
                            );
                        }

                        // Experience
                        if (sectionId === 'experience' && experience.length > 0) {
                            return (
                                <section key="experience" id="section-experience">
                                    {shouldRenderTitle('experience') && (
                                        <div id="section-title-experience" className="flex items-center gap-4 mb-8">
                                            <h3 className="text-lg font-bold uppercase tracking-[0.2em]" style={{ color: '#1a1a1a' }}>Professional Experience</h3>
                                            <div className="h-px flex-1" style={{ backgroundColor: goldColor }}></div>
                                        </div>
                                    )}
                                    <div className="space-y-8">
                                        {experience.map((exp) => (
                                            <div key={exp.id} id={`item-${exp.id}`} className="relative pl-6 border-l-2 break-inside-avoid" style={{ borderColor: '#E5E7EB' }}>
                                                <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white border-2 rounded-full" style={{ borderColor: goldColor }}></div>

                                                <div className="flex justify-between items-baseline mb-2">
                                                    <h4 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>{exp.role}</h4>
                                                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-white border rounded" style={{ borderColor: goldColor, color: goldColor }}>{exp.date}</span>
                                                </div>
                                                <div className="text-sm font-bold uppercase tracking-wide mb-3 text-slate-500">
                                                    {exp.company}{exp.location ? <><span className="mx-1">•</span>{exp.location}</> : null}
                                                </div>
                                                {exp.bullets && exp.bullets.length > 0 && (
                                                    <ul className="space-y-2">
                                                        {exp.bullets.map((bullet, i) => (
                                                            <li key={i} className="text-slate-700 text-sm leading-relaxed flex items-start gap-2">
                                                                <span className="text-xl mt-[-2px] shrink-0" style={{ color: '#C5A028' }}>•</span>
                                                                <span className="font-light">{bullet}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        }

                        // Education
                        if (sectionId === 'education' && education.length > 0) {
                            return (
                                <section key="education" id="section-education">
                                    {shouldRenderTitle('education') && (
                                        <div id="section-title-education" className="flex items-center gap-4 mb-8">
                                            <h3 className="text-lg font-bold uppercase tracking-[0.2em]" style={{ color: '#1a1a1a' }}>Education</h3>
                                            <div className="h-px flex-1" style={{ backgroundColor: goldColor }}></div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 gap-6">
                                        {education.map((edu) => (
                                            <div key={edu.id} id={`item-${edu.id}`} className="flex justify-between items-center p-4 bg-white border border-stone-100 shadow-sm break-inside-avoid">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>{edu.school}</h4>
                                                    <div className="text-slate-600 italic text-sm mt-1">{edu.degree}</div>
                                                </div>
                                                <span className="text-sm font-medium" style={{ color: goldColor }}>{edu.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        }

                        // Skills
                        if (sectionId === 'skills' && skills.length > 0) {
                            return (
                                <section key="skills" id="section-skills">
                                    {shouldRenderTitle('skills') && (
                                        <div id="section-title-skills" className="flex items-center gap-4 mb-8">
                                            <h3 className="text-lg font-bold uppercase tracking-[0.2em]" style={{ color: '#1a1a1a' }}>Expertise</h3>
                                            <div className="h-px flex-1" style={{ backgroundColor: goldColor }}></div>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-3">
                                        {skills.map((skill, index) => (
                                            <div key={index} className="px-4 py-2 bg-white border text-sm font-medium tracking-wide shadow-sm" style={{ borderColor: '#E5E7EB', color: '#4B5563' }}>
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        }

                        // Custom Sections
                        if (isCustom && customSection && customSection.items.length > 0) {
                            return (
                                <section key={sectionId} id={`section-${sectionId}`}>
                                    {shouldRenderTitle(sectionId) && (
                                        <div id={`section-title-${sectionId}`} className="flex items-center gap-4 mb-8">
                                            <h3 className="text-lg font-bold uppercase tracking-[0.2em]" style={{ color: '#1a1a1a' }}>{customSection.title}</h3>
                                            <div className="h-px flex-1" style={{ backgroundColor: goldColor }}></div>
                                        </div>
                                    )}
                                    <div className="space-y-6">
                                        {customSection.items.map((item) => (
                                            <div key={item.id} id={`item-${item.id}`} className="break-inside-avoid">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h4 className="font-bold text-slate-900 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>{item.title}</h4>
                                                    {item.date && <span className="text-sm font-medium" style={{ color: goldColor }}>{item.date}</span>}
                                                </div>
                                                {item.subtitle && <div className="text-slate-500 text-xs font-bold uppercase mb-2">{item.subtitle}</div>}
                                                {item.description && (
                                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-light">{item.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        }

                        return null;
                    })}
                </div>
            </div>
        </div>
    );
};

export default LayoutGold;
