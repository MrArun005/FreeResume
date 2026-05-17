import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

const SectionHeading = ({ title, theme }) => (
    <div className="mb-2 border-b border-gray-300 pb-1">
        <h2 className={`text-md font-bold uppercase tracking-widest ${theme.text}`}>{title}</h2>
    </div>
);

const LayoutDeedy = ({ data, theme, pageIndex, isMeasurement }) => {
    const { personal, experience, education, skills, customSections } = data;

    return (
        <div
            className={`p-0 ${isMeasurement ? 'h-auto overflow-visible' : 'h-[297mm] overflow-hidden'} font-sans text-gray-800 bg-white relative box-border flex`}
        >
            {/* Left Column */}
            <div className="w-1/3 bg-white p-8 border-r border-gray-100 h-full">
                {/* Header (Left) */}
                {pageIndex === 0 && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold uppercase leading-tight mb-2">
                            {personal.fullName}
                        </h1>
                        <p className="text-sm font-medium text-gray-500 mb-4">{personal.title}</p>

                        <div className="text-xs space-y-1 text-gray-600">
                            {personal.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={12} />{' '}
                                    <a href={`mailto:${personal.email}`} className="hover:underline">
                                        {personal.email}
                                    </a>
                                </div>
                            )}
                            {personal.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={12} /> <span>{personal.phone}</span>
                                </div>
                            )}
                            {personal.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} /> <span>{personal.location}</span>
                                </div>
                            )}
                            {(personal.socials || []).map((social) => (
                                <div key={social.id} className="flex items-center gap-2">
                                    <Globe size={12} />{' '}
                                    <a
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline"
                                    >
                                        {social.network}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Left Column Content */}
                <div className="space-y-6">
                    {education.length > 0 && (
                        <div id="section-education">
                            {(!data.sectionStartPage ||
                                data.sectionStartPage['education'] === data.pageIndex) && (
                                <div id="section-title-education">
                                    <SectionHeading title="Education" theme={theme} />
                                </div>
                            )}
                            {education.map((edu) => (
                                <div key={edu.id} id={`item-${edu.id}`} className="mb-3">
                                    <div className="font-bold text-sm">{edu.school}</div>
                                    <div className="text-xs text-gray-500 italic mb-1">{edu.degree}</div>
                                    <div className="text-xs text-gray-400">{edu.date}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {skills.length > 0 && (
                        <div id="section-skills">
                            {(!data.sectionStartPage ||
                                data.sectionStartPage['skills'] === data.pageIndex) && (
                                <div id="section-title-skills">
                                    <SectionHeading title="Skills" theme={theme} />
                                </div>
                            )}
                            <div className="text-sm">
                                {skills.map((skill, i) => (
                                    <div key={i} className="mb-1">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column */}
            <div className="w-2/3 p-8 h-full">
                {/* Right Column Content */}
                <div className="space-y-6">
                    {experience.length > 0 && (
                        <div id="section-experience">
                            {(!data.sectionStartPage ||
                                data.sectionStartPage['experience'] === data.pageIndex) && (
                                <div id="section-title-experience">
                                    <SectionHeading title="Experience" theme={theme} />
                                </div>
                            )}
                            {experience.map((exp) => (
                                <div key={exp.id} id={`item-${exp.id}`} className="mb-4">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900">{exp.company}</h3>
                                        <span className="text-xs text-gray-500">{exp.date}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-700 mb-1">{exp.role}</div>
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
                    )}

                    {customSections.map((section) => (
                        <div key={section.id} id={`section-${section.id}`}>
                            {(!data.sectionStartPage ||
                                data.sectionStartPage[section.id] === data.pageIndex) && (
                                <div id={`section-title-${section.id}`}>
                                    <SectionHeading title={section.title} theme={theme} />
                                </div>
                            )}
                            {section.items.map((item) => (
                                <div key={item.id} id={`item-${item.id}`} className="mb-4">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                                        <span className="text-xs text-gray-500">{item.date}</span>
                                    </div>
                                    {item.subtitle && (
                                        <div className="text-sm font-medium text-gray-700 mb-1">
                                            {item.subtitle}
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LayoutDeedy;
