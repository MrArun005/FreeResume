import React from 'react';
import { Mail, Phone, MapPin, Link as LinkIcon, Leaf } from 'lucide-react';

const LayoutLeaf = ({ data, pageIndex }) => {
    const { personal, experience, education, skills, customSections } = data;

    const shouldRenderTitle = (sectionId) => {
        return !data.sectionStartPage || data.sectionStartPage[sectionId] === pageIndex;
    };

    return (
        <div className="w-full h-[297mm] bg-[#FDFDFD] text-gray-700 font-sans overflow-hidden relative flex">
            {/* Left Sidebar - Soft Green */}
            <div className="w-[32%] bg-[#E8F5E9] h-full p-8 flex flex-col gap-8 border-r border-[#C8E6C9]">
                {/* Profile Photo Placeholder / Initials */}
                {pageIndex === 0 && (
                    <div className="w-32 h-32 mx-auto bg-[#A5D6A7] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-sm">
                        {personal.fullName ? personal.fullName.charAt(0) : 'A'}
                    </div>
                )}

                {/* Contact Info */}
                {pageIndex === 0 && (
                    <div className="flex flex-col gap-4 text-sm">
                        <h3 className="text-[#2E7D32] font-bold uppercase tracking-wider text-xs border-b border-[#A5D6A7] pb-1 mb-1">
                            Contact
                        </h3>
                        {personal.email && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#2E7D32] shadow-sm shrink-0">
                                    <Mail size={14} />
                                </div>
                                <span className="break-all">{personal.email}</span>
                            </div>
                        )}
                        {personal.phone && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#2E7D32] shadow-sm shrink-0">
                                    <Phone size={14} />
                                </div>
                                <span>{personal.phone}</span>
                            </div>
                        )}
                        {personal.location && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#2E7D32] shadow-sm shrink-0">
                                    <MapPin size={14} />
                                </div>
                                <span>{personal.location}</span>
                            </div>
                        )}
                        {personal.socials?.map((social, index) => (
                            <a
                                key={index}
                                href={social.url}
                                className="flex items-center gap-3 text-gray-600 hover:text-[#2E7D32]"
                            >
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#2E7D32] shadow-sm shrink-0">
                                    <LinkIcon size={14} />
                                </div>
                                <span>{social.network}</span>
                            </a>
                        ))}
                    </div>
                )}

                {/* Skills - Sidebar */}
                {skills.length > 0 && (
                    <section id="section-skills">
                        {shouldRenderTitle('skills') && (
                            <h3
                                id="section-title-skills"
                                className="text-[#2E7D32] font-bold uppercase tracking-wider text-xs border-b border-[#A5D6A7] pb-1 mb-4"
                            >
                                Skills
                            </h3>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 bg-white text-[#2E7D32] text-xs font-medium rounded-full shadow-sm border border-[#C8E6C9]"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education - Sidebar */}
                {education.length > 0 && (
                    <section id="section-education">
                        {shouldRenderTitle('education') && (
                            <h3
                                id="section-title-education"
                                className="text-[#2E7D32] font-bold uppercase tracking-wider text-xs border-b border-[#A5D6A7] pb-1 mb-4"
                            >
                                Education
                            </h3>
                        )}
                        <div className="flex flex-col gap-6">
                            {education.map((edu) => (
                                <div key={edu.id} id={`item-${edu.id}`}>
                                    <h4 className="font-bold text-gray-800 text-sm">{edu.school}</h4>
                                    <div className="text-[#2E7D32] text-xs font-medium mb-1">
                                        {edu.degree}
                                    </div>
                                    <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full inline-block shadow-sm">
                                        {edu.date}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-10 flex flex-col gap-8">
                {/* Decorative Header with Leaf Motif - Only on first page */}
                {(!pageIndex || pageIndex === 0) && (
                    <header className="mb-2">
                        <h1 className="text-5xl font-bold text-[#1B5E20] mb-2 tracking-tight">
                            {personal.fullName}
                        </h1>
                        <p className="text-xl text-[#43A047] font-medium tracking-wide">{personal.title}</p>
                    </header>
                )}

                {/* Summary */}
                {personal.summary && (!pageIndex || pageIndex === 0) && (
                    <section id="section-summary">
                        <div className="bg-[#F1F8E9] p-6 rounded-2xl border border-[#DCEDC8]">
                            <p className="text-gray-700 leading-relaxed text-sm">{personal.summary}</p>
                        </div>
                    </section>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <section id="section-experience">
                        {shouldRenderTitle('experience') && (
                            <div id="section-title-experience" className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#E8F5E9] rounded-full text-[#2E7D32]">
                                    <Leaf size={18} />
                                </div>
                                <h3 className="text-xl font-bold text-[#2E7D32]">Experience</h3>
                            </div>
                        )}
                        <div className="space-y-8 border-l-2 border-[#E8F5E9] ml-4 pl-8 py-2">
                            {experience.map((exp) => (
                                <div key={exp.id} id={`item-${exp.id}`} className="relative">
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[41px] top-1.5 w-5 h-5 bg-white border-4 border-[#4CAF50] rounded-full"></div>

                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-lg font-bold text-gray-800">{exp.role}</h4>
                                        <span className="text-xs font-bold text-[#4CAF50] bg-[#E8F5E9] px-3 py-1 rounded-full">
                                            {exp.date}
                                        </span>
                                    </div>
                                    <div className="text-[#2E7D32] font-medium mb-3 text-sm">
                                        {exp.company}
                                        {exp.location && ` | ${exp.location}`}
                                    </div>
                                    {exp.bullets && exp.bullets.length > 0 && (
                                        <ul className="space-y-2">
                                            {exp.bullets.map((bullet, i) => (
                                                <li
                                                    key={i}
                                                    className="text-slate-700 text-sm leading-relaxed flex items-start gap-2"
                                                >
                                                    <Leaf
                                                        size={14}
                                                        className="mt-0.5 shrink-0"
                                                        color="#10b981"
                                                    />
                                                    <span className="font-light">{bullet}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
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
                                        className="flex items-center gap-3 mb-6"
                                    >
                                        <div className="p-2 bg-[#E8F5E9] rounded-full text-[#2E7D32]">
                                            <Leaf size={18} />
                                        </div>
                                        <h3 className="text-xl font-bold text-[#2E7D32]">{section.title}</h3>
                                    </div>
                                )}
                                <div className="space-y-6 ml-4">
                                    {section.items.map((item) => (
                                        <div
                                            key={item.id}
                                            id={`item-${item.id}`}
                                            className="bg-white p-5 rounded-xl border border-gray-100"
                                        >
                                            <div className="flex justify-between items-baseline mb-2">
                                                <h4 className="font-bold text-gray-800">{item.title}</h4>
                                                {item.date && (
                                                    <span className="text-xs text-gray-500">{item.date}</span>
                                                )}
                                            </div>
                                            {item.subtitle && (
                                                <div className="text-[#43A047] text-sm font-medium mb-2">
                                                    {item.subtitle}
                                                </div>
                                            )}
                                            {item.description && (
                                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
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
    );
};

export default LayoutLeaf;
