import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const LayoutAts = ({ data, theme, pageIndex, isMeasurement }) => {
    return (
        <div className={`p-12 ${isMeasurement ? 'h-auto overflow-visible' : 'h-[297mm] overflow-hidden'} font-sans text-gray-900 bg-white relative box-border`}>
            {/* Header - Only on first page */}
            {pageIndex === 0 && (
                <div id="section-personal" className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 uppercase tracking-wide">{data.personal.fullName}</h1>
                    {data.personal.title && <p className="text-lg text-gray-700 mb-3">{data.personal.title}</p>}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                        {data.personal.email && (
                            <div className="flex items-center gap-1.5">
                                <Mail size={14} />
                                <span>{data.personal.email}</span>
                            </div>
                        )}
                        {data.personal.phone && (
                            <div className="flex items-center gap-1.5">
                                <Phone size={14} />
                                <span>{data.personal.phone}</span>
                            </div>
                        )}
                        {data.personal.location && (
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} />
                                <span>{data.personal.location}</span>
                            </div>
                        )}
                        {(data.personal.socials || []).map(social => (
                            <span key={social.id}>
                                {social.network}: <a href={social.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{social.username || social.url}</a>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Dynamic Sections */}
            {data.sectionOrder.map(sectionId => {
                const isCustom = !['summary', 'experience', 'education', 'skills'].includes(sectionId);
                const sectionData = isCustom ? data.customSections.find(s => s.id === sectionId) : null;

                if (sectionId === 'summary' && data.personal.summary) {
                    return (
                        <div key={sectionId} id={`section-${sectionId}`} className="mb-6 break-inside-avoid">
                            <div id={`section-title-${sectionId}`}>
                                <h2 className={`text-sm font-bold uppercase tracking-widest mb-2 pb-1 border-b-2 ${theme.border}`}>
                                    Professional Summary
                                </h2>
                            </div>
                            <p className="text-sm leading-relaxed mt-3 text-gray-800">{data.personal.summary}</p>
                        </div>
                    );
                }

                if (sectionId === 'experience' && data.experience.length > 0) {
                    const isFirstPageOfSection = !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
                    return (
                        <div key={sectionId} id={`section-${sectionId}`} className="mb-6">
                            {isFirstPageOfSection && (
                                <div id={`section-title-${sectionId}`}>
                                    <h2 className={`text-sm font-bold uppercase tracking-widest mb-2 pb-1 border-b-2 ${theme.border}`}>
                                        Professional Experience
                                    </h2>
                                </div>
                            )}
                            {data.experience.map((exp) => (
                                <div key={exp.id} id={`item-${exp.id}`} className="mt-4 break-inside-avoid">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg text-gray-900">{exp.company}</h3>
                                        <span className="text-sm text-gray-600">{exp.date}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-base font-semibold text-gray-700">{exp.role}</span>
                                        {exp.location && <span className="text-sm text-gray-500">{exp.location}</span>}
                                    </div>
                                    {exp.bullets && exp.bullets.length > 0 && (
                                        <ul className="list-disc list-outside ml-5 space-y-1">
                                            {exp.bullets.map((bullet, i) => (
                                                <li key={i} className="text-sm text-gray-700 leading-relaxed">{bullet}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionId === 'education' && data.education.length > 0) {
                    const isFirstPageOfSection = !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
                    return (
                        <div key={sectionId} id={`section-${sectionId}`} className="mb-6">
                            {isFirstPageOfSection && (
                                <div id={`section-title-${sectionId}`}>
                                    <h2 className={`text-sm font-bold uppercase tracking-widest mb-2 pb-1 border-b-2 ${theme.border}`}>
                                        Education
                                    </h2>
                                </div>
                            )}
                            {data.education.map((edu) => (
                                <div key={edu.id} id={`item-${edu.id}`} className="mt-4 break-inside-avoid">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-base text-gray-900">{edu.school}</h3>
                                        <span className="text-sm text-gray-600">{edu.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{edu.degree}</p>
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionId === 'skills' && data.skills.length > 0) {
                    const isFirstPageOfSection = !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
                    return (
                        <div key={sectionId} id={`section-${sectionId}`} className="mb-6 break-inside-avoid">
                            {isFirstPageOfSection && (
                                <div id={`section-title-${sectionId}`}>
                                    <h2 className={`text-sm font-bold uppercase tracking-widest mb-2 pb-1 border-b-2 ${theme.border}`}>
                                        Skills
                                    </h2>
                                </div>
                            )}
                            <p className="text-sm text-gray-700 leading-relaxed mt-3">
                                {data.skills.join(', ')}
                            </p>
                        </div>
                    );
                }

                if (isCustom && sectionData && sectionData.items.length > 0) {
                    return (
                        <div key={sectionId} id={`section-${sectionId}`} className="mb-6">
                            {(!data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex) && (
                                <div id={`section-title-${sectionId}`}>
                                    <h2 className={`text-sm font-bold uppercase tracking-widest mb-2 pb-1 border-b-2 ${theme.border}`}>
                                        {sectionData.title}
                                    </h2>
                                </div>
                            )}
                            {sectionData.items.map((item) => (
                                <div key={item.id} id={`item-${item.id}`} className="mt-4 break-inside-avoid">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-base text-gray-900">{item.title}</h3>
                                        {item.date && <span className="text-sm text-gray-600">{item.date}</span>}
                                    </div>
                                    {item.subtitle && <p className="text-sm font-medium text-gray-700 mb-1">{item.subtitle}</p>}
                                    {item.description && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>}
                                </div>
                            ))}
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
};

export default LayoutAts;
