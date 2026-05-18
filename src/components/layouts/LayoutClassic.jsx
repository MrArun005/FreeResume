import React from 'react';
import { sectionStyle } from '../../utils/sectionStyles';
import SectionTitle from '../ui/SectionTitle';
import { Mail, Phone, MapPin, Link as LinkIcon } from 'lucide-react';

const LayoutClassic = ({ data, theme, pageIndex, isMeasurement }) => {
    return (
        <div
            className={`p-10 ${isMeasurement ? 'h-auto overflow-visible' : 'h-[297mm] overflow-hidden'} font-sans text-gray-800 relative box-border`}
        >
            {/* Header - Only on first page */}
            {pageIndex === 0 && (
                <div
                    id="section-personal"
                    className={`border-b-2 ${theme.border} pb-6 mb-6 flex justify-between items-start`}
                >
                    <div>
                        <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">
                            {data.personal.fullName}
                        </h1>
                        <p className="text-sm font-medium text-gray-600 mb-2">{data.personal.title}</p>
                        {data.personal.email && (
                            <a
                                href={`mailto:${data.personal.email}`}
                                className="flex items-center gap-2 text-gray-800 hover:text-blue-600 hover:underline print:text-blue-600 print:underline"
                            >
                                <Mail size={14} /> {data.personal.email}
                            </a>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-1 text-sm">
                        {data.personal.phone && (
                            <a
                                href={`tel:${data.personal.phone}`}
                                className="flex items-center gap-2 text-gray-800 hover:text-blue-600 hover:underline print:text-blue-600 print:underline"
                            >
                                {data.personal.phone} <Phone size={14} />
                            </a>
                        )}
                        {data.personal.location && (
                            <div className="flex items-center gap-2">
                                {data.personal.location} <MapPin size={14} />
                            </div>
                        )}
                        {(data.personal.socials || []).map((social) => {
                            const url = social.url.startsWith('http') ? social.url : `https://${social.url}`;
                            return (
                                <a
                                    key={social.id}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 font-bold text-xs text-blue-600 hover:underline print:text-blue-600 print:underline"
                                >
                                    {social.network} <LinkIcon size={14} />
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Dynamic Sections */}
            {data.sectionOrder.map((sectionId) => {
                const isCustom = !['summary', 'experience', 'education', 'skills'].includes(sectionId);
                const sectionData = isCustom ? data.customSections.find((s) => s.id === sectionId) : null;

                if (sectionId === 'summary' && data.personal.summary) {
                    return (
                        <div
                            key={sectionId}
                            id={`section-${sectionId}`}
                            style={sectionStyle(data, sectionId)}
                            className="mb-6 break-inside-avoid"
                        >
                            <div id={`section-title-${sectionId}`}>
                                <SectionTitle title="Professional Summary" theme={theme} />
                            </div>
                            <p className="text-sm leading-relaxed">{data.personal.summary}</p>
                        </div>
                    );
                }

                if (sectionId === 'experience' && data.experience.length > 0) {
                    // Check if this is the first page for this section
                    const isFirstPageOfSection =
                        !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;

                    return (
                        <div
                            key={sectionId}
                            id={`section-${sectionId}`}
                            style={sectionStyle(data, sectionId)}
                            className="mb-6"
                        >
                            {isFirstPageOfSection && (
                                <div id={`section-title-${sectionId}`}>
                                    <SectionTitle title="Experience" theme={theme} />
                                </div>
                            )}
                            {data.experience.map((exp) => (
                                <div key={exp.id} id={`item-${exp.id}`} className="mb-4">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg">{exp.company}</h3>
                                        <span className="text-sm text-gray-500">{exp.date}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {exp.role}
                                        </span>
                                        <span className="text-xs text-gray-400">{exp.location}</span>
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

                if (sectionId === 'education' && data.education.length > 0) {
                    const isFirstPageOfSection =
                        !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;

                    return (
                        <div
                            key={sectionId}
                            id={`section-${sectionId}`}
                            style={sectionStyle(data, sectionId)}
                            className="mb-6"
                        >
                            {isFirstPageOfSection && (
                                <div id={`section-title-${sectionId}`}>
                                    <SectionTitle title="Education" theme={theme} />
                                </div>
                            )}
                            {data.education.map((edu) => (
                                <div key={edu.id} id={`item-${edu.id}`} className="mb-3 break-inside-avoid">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold">{edu.school}</h3>
                                        <span className="text-sm text-gray-500">{edu.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{edu.degree}</p>
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionId === 'skills' && data.skills.length > 0) {
                    return (
                        <div
                            key={sectionId}
                            id={`section-${sectionId}`}
                            style={sectionStyle(data, sectionId)}
                            className="mb-6 break-inside-avoid"
                        >
                            <div id={`section-title-${sectionId}`}>
                                <SectionTitle title="Skills" theme={theme} />
                            </div>
                            <div className="flex flex-wrap gap-2 w-full">
                                {data.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className={`text-xs px-2 py-1 rounded bg-gray-100 font-medium break-inside-avoid`}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                }

                if (isCustom && sectionData && sectionData.items.length > 0) {
                    const isFirstPageOfSection =
                        !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;

                    return (
                        <div
                            key={sectionId}
                            id={`section-${sectionId}`}
                            style={sectionStyle(data, sectionId)}
                            className="mb-6"
                        >
                            {isFirstPageOfSection && (
                                <div id={`section-title-${sectionId}`}>
                                    <SectionTitle title={sectionData.title} theme={theme} />
                                </div>
                            )}
                            {sectionData.items.map((item) => (
                                <div key={item.id} id={`item-${item.id}`} className="mb-4 break-inside-avoid">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-md">{item.title}</h3>
                                        <span className="text-sm text-gray-500">{item.date}</span>
                                    </div>
                                    {item.subtitle && (
                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                            {item.subtitle}
                                        </p>
                                    )}
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
            })}
        </div>
    );
};

export default LayoutClassic;
