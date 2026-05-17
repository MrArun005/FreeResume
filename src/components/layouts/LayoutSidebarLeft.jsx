import React from 'react';
import { Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';

const LayoutSidebarLeft = ({ data, theme, pageIndex, isMeasurement }) => {
    // ... (rest of file)

    {
        (data.personal.socials || []).map((social) => (
            <div key={social.id} className="flex items-center gap-2 text-xs">
                <LinkIcon size={14} />
                <a href={social.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {social.network}
                </a>
            </div>
        ));
    }
    // Helper to render main content sections
    const renderMainSection = (sectionId) => {
        if (sectionId === 'summary') {
            return (
                <div key="summary" id={`section-summary`} className="mb-8">
                    <h3 className={`text-lg font-bold uppercase tracking-widest mb-4 ${theme.text}`}>
                        Profile
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">{data.personal.summary}</p>
                </div>
            );
        }

        if (sectionId === 'experience') {
            const isFirstPageOfSection =
                !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
            return (
                <div key="experience" id="section-experience" className="mb-8">
                    {isFirstPageOfSection && (
                        <h3
                            id="section-title-experience"
                            className={`text-lg font-bold uppercase tracking-widest mb-6 ${theme.text}`}
                        >
                            Experience
                        </h3>
                    )}
                    {data.experience.map((exp) => (
                        <div
                            key={exp.id}
                            id={`item-${exp.id}`}
                            className="mb-6 border-l-2 border-gray-200 pl-4 relative"
                        >
                            <div className="break-inside-avoid">
                                <div
                                    className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${theme.primary}`}
                                ></div>
                                <h4 className="font-bold text-md">{exp.role}</h4>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className={`${theme.text} font-medium`}>{exp.company}</span>
                                    <span className="text-gray-400 italic">{exp.date}</span>
                                </div>
                            </div>
                            {exp.bullets && exp.bullets.length > 0 && (
                                <ul className="list-disc list-outside ml-5 space-y-1">
                                    {exp.bullets.map((bullet, i) => (
                                        <li key={i} className="text-sm text-gray-700 leading-relaxed">
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        // Custom sections in main area
        const customSection = data.customSections?.find((s) => s.id === sectionId);
        if (customSection && customSection.items.length > 0) {
            return (
                <div key={sectionId} id={`section-${sectionId}`} className="mb-8">
                    {(!data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex) && (
                        <h3
                            id={`section-title-${sectionId}`}
                            className={`text-lg font-bold uppercase tracking-widest mb-6 ${theme.text}`}
                        >
                            {customSection.title}
                        </h3>
                    )}
                    {customSection.items.map((item) => (
                        <div
                            key={item.id}
                            id={`item-${item.id}`}
                            className="mb-6 border-l-2 border-gray-200 pl-4 relative"
                        >
                            <div className="break-inside-avoid">
                                <div
                                    className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${theme.primary}`}
                                ></div>
                                <h4 className="font-bold text-md">{item.title}</h4>
                                <div className="flex justify-between text-sm mb-2">
                                    {item.subtitle && (
                                        <span className={`${theme.text} font-medium`}>{item.subtitle}</span>
                                    )}
                                    {item.date && <span className="text-gray-400 italic">{item.date}</span>}
                                </div>
                            </div>
                            {item.description && (
                                <p className="text-sm text-gray-600 whitespace-pre-line">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <div
            className={`w-full flex bg-white ${isMeasurement ? 'h-auto overflow-visible' : 'h-[297mm] overflow-hidden'} ${theme.font}`}
        >
            {/* Fixed Sidebar */}
            <div className={`w-1/3 ${theme.primary} text-white p-[15mm] flex flex-col min-h-full`}>
                {pageIndex === 0 && (
                    <div id="section-personal">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold leading-tight mb-2">
                                {data.personal.fullName}
                            </h1>
                            <p className="text-white/80 text-sm font-medium">{data.personal.title}</p>
                        </div>
                        <div className="mb-8 space-y-3 text-white/90">
                            <div className="flex items-center gap-2 text-xs">
                                <Mail size={14} /> {data.personal.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <Phone size={14} /> {data.personal.phone}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <MapPin size={14} /> {data.personal.location}
                            </div>
                            {(data.personal.socials || []).map((social) => (
                                <div key={social.id} className="flex items-center gap-2 text-xs">
                                    <span className="font-bold opacity-70">{social.network}:</span>{' '}
                                    {social.username}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {data.education && data.education.length > 0 && (
                    <div id="section-education" className="mb-8">
                        <h3
                            id="section-title-education"
                            className="text-xs uppercase tracking-widest font-bold border-b border-white/30 pb-2 mb-3"
                        >
                            Education
                        </h3>
                        {data.education.map((edu) => (
                            <div
                                key={edu.id}
                                id={`item-${edu.id}`}
                                className="mb-3 text-sm break-inside-avoid"
                            >
                                <div className="font-bold">{edu.degree}</div>
                                <div className="text-white/80 text-xs">{edu.school}</div>
                                <div className="text-white/60 text-xs italic">{edu.date}</div>
                            </div>
                        ))}
                    </div>
                )}
                {data.skills && data.skills.length > 0 && (
                    <div id="section-skills">
                        <h3 className="text-xs uppercase tracking-widest font-bold border-b border-white/30 pb-2 mb-3">
                            Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill, i) => (
                                <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Dynamic Main Content */}
            <div className="w-2/3 p-[15mm] text-gray-800">
                {data.sectionOrder
                    ?.filter((id) => !['education', 'skills'].includes(id))
                    .map((sectionId) => renderMainSection(sectionId))}
            </div>
        </div>
    );
};

export default LayoutSidebarLeft;
