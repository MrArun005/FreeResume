import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

const LayoutModernGrid = ({ data, theme, pageIndex, isMeasurement }) => {
    return (
        <div
            className={`w-full flex flex-col bg-white ${isMeasurement ? 'h-auto overflow-visible' : 'h-[297mm] overflow-hidden'} ${theme.font}`}
        >
            {pageIndex === 0 && (
                <div
                    id="section-personal"
                    className={`${theme.primary} p-10 text-white flex justify-between items-end`}
                >
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{data.personal.fullName}</h1>
                        <p className="opacity-80 text-lg">{data.personal.title}</p>
                    </div>
                    <div className="text-right text-xs opacity-80 space-y-1">
                        <p>{data.personal.email}</p>
                        <p>{data.personal.phone}</p>
                        <p>{data.personal.location}</p>
                        {(data.personal.socials || []).map((social) => (
                            <p key={social.id}>{social.username}</p>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-1 p-10 flex gap-8">
                {/* Left Column - Summary, Experience, Custom Sections */}
                <div className="space-y-8 flex-1 min-w-0">
                    {data.sectionOrder
                        ?.filter((id) => !['education', 'skills'].includes(id))
                        .map((sectionId) => {
                            if (sectionId === 'summary' && data.personal.summary) {
                                return (
                                    <div
                                        key="summary"
                                        id="section-summary"
                                        className={`${theme.accent} p-6 rounded-lg`}
                                    >
                                        <h3 className={`font-bold text-lg mb-3 ${theme.text}`}>Summary</h3>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {data.personal.summary}
                                        </p>
                                    </div>
                                );
                            }

                            if (sectionId === 'experience' && data.experience.length > 0) {
                                const isFirstPageOfSection =
                                    !data.sectionStartPage ||
                                    data.sectionStartPage[sectionId] === data.pageIndex;
                                return (
                                    <div key="experience" id="section-experience">
                                        {isFirstPageOfSection && (
                                            <h3
                                                id="section-title-experience"
                                                className={`font-bold text-lg mb-4 border-b-2 ${theme.border} pb-2`}
                                            >
                                                Experience
                                            </h3>
                                        )}
                                        {data.experience.map((exp) => (
                                            <div
                                                key={exp.id}
                                                id={`item-${exp.id}`}
                                                className="mb-5 last:mb-0"
                                            >
                                                <div className="break-inside-avoid">
                                                    <h4 className="font-bold">{exp.role}</h4>
                                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                                        <span>{exp.company}</span>
                                                        <span>{exp.date}</span>
                                                    </div>
                                                </div>
                                                {exp.bullets && exp.bullets.length > 0 && (
                                                    <ul className="list-disc list-outside ml-4 space-y-1 text-xs">
                                                        {exp.bullets.map((bullet, i) => (
                                                            <li
                                                                key={i}
                                                                className="text-gray-700 leading-relaxed"
                                                            >
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

                            // Custom sections in left column
                            const customSection = data.customSections?.find((s) => s.id === sectionId);
                            if (customSection && customSection.items.length > 0) {
                                return (
                                    <div key={sectionId} id={`section-${sectionId}`}>
                                        <h3
                                            className={`font-bold text-lg mb-4 border-b-2 ${theme.border} pb-2`}
                                        >
                                            {customSection.title}
                                        </h3>
                                        {customSection.items.map((item) => (
                                            <div
                                                key={item.id}
                                                id={`item-${item.id}`}
                                                className="mb-5 last:mb-0"
                                            >
                                                <div className="break-inside-avoid">
                                                    <h4 className="font-bold">{item.title}</h4>
                                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                                        {item.subtitle && <span>{item.subtitle}</span>}
                                                        {item.date && <span>{item.date}</span>}
                                                    </div>
                                                </div>
                                                {item.description && (
                                                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
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

                {/* Right Column - Education, Skills */}
                <div className="space-y-8 flex-1 min-w-0">
                    {data.sectionOrder
                        ?.filter((id) => ['education', 'skills'].includes(id))
                        .map((sectionId) => {
                            if (sectionId === 'education' && data.education.length > 0) {
                                const isFirstPageOfSection =
                                    !data.sectionStartPage ||
                                    data.sectionStartPage[sectionId] === data.pageIndex;
                                return (
                                    <div key="education" id="section-education">
                                        {isFirstPageOfSection && (
                                            <h3
                                                id="section-title-education"
                                                className={`font-bold text-lg mb-4 border-b-2 ${theme.border} pb-2`}
                                            >
                                                Education
                                            </h3>
                                        )}
                                        {data.education.map((edu) => (
                                            <div
                                                key={edu.id}
                                                id={`item-${edu.id}`}
                                                className="mb-4 break-inside-avoid"
                                            >
                                                <h4 className="font-bold">{edu.school}</h4>
                                                <p className={`text-sm ${theme.text}`}>{edu.degree}</p>
                                                <p className="text-xs text-gray-400">{edu.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }

                            if (sectionId === 'skills' && data.skills.length > 0) {
                                return (
                                    <div key="skills" id="section-skills">
                                        <h3
                                            className={`font-bold text-lg mb-4 border-b-2 ${theme.border} pb-2`}
                                        >
                                            Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {data.skills.map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-xs font-semibold px-3 py-1 border ${theme.border} rounded-full ${theme.text}`}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })}
                </div>
            </div>
        </div>
    );
};

export default LayoutModernGrid;
