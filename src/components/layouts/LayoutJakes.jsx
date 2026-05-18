import React from 'react';
import { sectionStyle } from '../../utils/sectionStyles';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

const LayoutJakes = ({ data, theme, pageIndex, isMeasurement }) => {
    const { personal, experience, education, skills, customSections, sectionOrder } = data;

    return (
        <div
            className={`p-10 ${isMeasurement ? 'h-auto overflow-visible' : 'h-[297mm] overflow-hidden'} font-serif text-gray-900 bg-white relative box-border`}
        >
            {/* Header */}
            {pageIndex === 0 && (
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-normal uppercase tracking-wide mb-1">{personal.fullName}</h1>
                    <div className="flex justify-center items-center gap-3 text-sm">
                        {personal.phone && <span>{personal.phone}</span>}
                        {personal.email && (
                            <a href={`mailto:${personal.email}`} className="hover:underline">
                                {personal.email}
                            </a>
                        )}
                        {personal.socials &&
                            personal.socials.map((social) => (
                                <a
                                    key={social.id}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                >
                                    {social.network}
                                </a>
                            ))}
                    </div>
                </div>
            )}

            {/* Sections */}
            <div className="space-y-4">
                {sectionOrder.map((sectionId) => {
                    const isCustom = !['summary', 'experience', 'education', 'skills'].includes(sectionId);
                    const sectionData = isCustom ? customSections.find((s) => s.id === sectionId) : null;

                    // Helper for Section Heading
                    const SectionHeading = ({ title }) => (
                        <div className={`border-b ${theme.border} mb-2`}>
                            <h2 className="text-lg font-bold uppercase tracking-wide">{title}</h2>
                        </div>
                    );

                    if (sectionId === 'education' && education.length > 0) {
                        const isFirstPageOfSection =
                            !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
                        return (
                            <div
                                key={sectionId}
                                id={`section-${sectionId}`}
                                style={sectionStyle(data, sectionId)}
                            >
                                {isFirstPageOfSection && (
                                    <div id={`section-title-${sectionId}`}>
                                        <SectionHeading title="Education" />
                                    </div>
                                )}
                                {education.map((edu) => (
                                    <div
                                        key={edu.id}
                                        id={`item-${edu.id}`}
                                        className="mb-2 break-inside-avoid"
                                    >
                                        <div className="flex justify-between font-bold">
                                            <span>{edu.school}</span>
                                            {edu.location && <span>{edu.location}</span>}
                                        </div>
                                        <div className="flex justify-between text-sm italic">
                                            <span>{edu.degree}</span>
                                            <span>{edu.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    }

                    if (sectionId === 'experience' && experience.length > 0) {
                        const isFirstPageOfSection =
                            !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
                        return (
                            <div
                                key={sectionId}
                                id={`section-${sectionId}`}
                                style={sectionStyle(data, sectionId)}
                            >
                                {isFirstPageOfSection && (
                                    <div id={`section-title-${sectionId}`}>
                                        <SectionHeading title="Experience" />
                                    </div>
                                )}
                                {experience.map((exp) => (
                                    <div
                                        key={exp.id}
                                        id={`item-${exp.id}`}
                                        className="mb-3 break-inside-avoid"
                                    >
                                        <div className="flex justify-between font-bold">
                                            <span>{exp.company}</span>
                                            <span>{exp.date}</span>
                                        </div>
                                        <div className="flex justify-between text-sm italic mb-1">
                                            <span>{exp.role}</span>
                                            {exp.location && <span>{exp.location}</span>}
                                        </div>
                                        {exp.bullets && exp.bullets.length > 0 && (
                                            <ul className="list-disc list-outside ml-5 space-y-1">
                                                {exp.bullets.map((bullet, i) => (
                                                    <li key={i} className="text-sm leading-snug">
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

                    if (sectionId === 'skills' && skills.length > 0) {
                        const isFirstPageOfSection =
                            !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
                        return (
                            <div
                                key={sectionId}
                                id={`section-${sectionId}`}
                                style={sectionStyle(data, sectionId)}
                                className="break-inside-avoid"
                            >
                                {isFirstPageOfSection && (
                                    <div id={`section-title-${sectionId}`}>
                                        <SectionHeading title="Skills" />
                                    </div>
                                )}
                                <div className="text-sm">
                                    {skills.some((s) => typeof s === 'string' && s.includes(':')) ? (
                                        // Categorized skills ("Languages: Python, SQL") — render
                                        // each category on its own line with the label bolded so
                                        // ATS picks up the structure and humans can scan it.
                                        skills.map((entry, i) => {
                                            const idx = entry.indexOf(':');
                                            if (idx > 0) {
                                                return (
                                                    <div key={i}>
                                                        <span className="font-bold">
                                                            {entry.slice(0, idx)}:
                                                        </span>
                                                        {entry.slice(idx + 1)}
                                                    </div>
                                                );
                                            }
                                            return <div key={i}>{entry}</div>;
                                        })
                                    ) : (
                                        // Plain comma-joined list when no categories present.
                                        <span>{skills.join(', ')}</span>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    if (isCustom && sectionData && sectionData.items.length > 0) {
                        return (
                            <div
                                key={sectionId}
                                id={`section-${sectionId}`}
                                style={sectionStyle(data, sectionId)}
                            >
                                {(!data.sectionStartPage ||
                                    data.sectionStartPage[sectionId] === data.pageIndex) && (
                                    <div id={`section-title-${sectionId}`}>
                                        <SectionHeading title={sectionData.title} />
                                    </div>
                                )}
                                {sectionData.items.map((item) => (
                                    <div
                                        key={item.id}
                                        id={`item-${item.id}`}
                                        className="mb-2 break-inside-avoid"
                                    >
                                        <div className="flex justify-between font-bold">
                                            <span>{item.title}</span>
                                            <span>{item.date}</span>
                                        </div>
                                        {item.subtitle && (
                                            <div className="text-sm italic">{item.subtitle}</div>
                                        )}
                                        {item.description && (
                                            <p className="text-sm whitespace-pre-line leading-snug">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
};

export default LayoutJakes;
