import React from 'react';
import { sectionStyle } from '../../utils/sectionStyles';
import { Mail, Phone, MapPin, Link as LinkIcon, Calendar, Building, GraduationCap } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';

const LayoutCreative = ({ data, theme, pageIndex, isMeasurement }) => {
    const { personal, sectionOrder, customSections } = data;

    // Helper to check if a section should be rendered on this page
    // For simplicity in this layout, we'll assume single-page or flow naturally
    // But we need to respect the 'sectionOrder' passed in props which might be paginated
    // However, this layout has a sidebar. Pagination with sidebars is tricky.
    // We will render the sidebar fully on the first page, and main content flows.

    const isFirstPage = pageIndex === 0;

    // Helper to check if a section is for the sidebar
    const isSidebarSection = (sectionId) => {
        if (sectionId === 'skills' || sectionId === 'education') return true;
        const cs = customSections.find((s) => s.id === sectionId);
        if (cs) {
            const title = cs.title.toLowerCase();
            return ['language', 'interest', 'award', 'certification', 'skill', 'education'].some((kw) =>
                title.includes(kw)
            );
        }
        return false;
    };

    const sidebarSectionIds = sectionOrder.filter((id) => isSidebarSection(id));
    const mainSectionIds = sectionOrder.filter((id) => !isSidebarSection(id));

    return (
        <div
            className={`flex bg-white text-gray-800 font-sans w-full max-w-full ${isMeasurement ? 'h-auto overflow-visible' : 'h-[297mm] overflow-hidden'}`}
        >
            {/* Sidebar - Left Side */}
            <div
                className={`w-1/3 ${theme.primary} text-white p-8 flex flex-col gap-8 flex-shrink-0 min-h-full`}
            >
                {isFirstPage && (
                    /* Contact Info - Page 1 Only */
                    <div className="flex flex-col gap-4 text-sm opacity-90 mb-8">
                        {personal.email && (
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="flex-shrink-0" />{' '}
                                <span className="break-all">{personal.email}</span>
                            </div>
                        )}
                        {personal.phone && (
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="flex-shrink-0" /> <span>{personal.phone}</span>
                            </div>
                        )}
                        {personal.location && (
                            <div className="flex items-center gap-3">
                                <MapPin size={16} className="flex-shrink-0" />{' '}
                                <span>{personal.location}</span>
                            </div>
                        )}
                        {(personal.socials || []).map((s) => (
                            <div key={s.id} className="flex items-center gap-3">
                                <LinkIcon size={16} className="flex-shrink-0" />{' '}
                                <a href={s.url} className="hover:underline break-all text-white">
                                    {s.network}
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                {/* Render Sidebar Sections (Education, Skills, Custom) */}
                {sidebarSectionIds.map((sectionId) => {
                    if (sectionId === 'education' && data.education && data.education.length > 0) {
                        return (
                            <div
                                key="education"
                                id="section-education"
                                style={sectionStyle(data, 'education')}
                                className="mb-8"
                            >
                                <h3
                                    id="section-title-education"
                                    className="text-lg font-bold uppercase tracking-wider border-b border-white/30 pb-2 mb-4 flex items-center gap-2"
                                >
                                    <GraduationCap size={18} /> Education
                                </h3>
                                <div className="flex flex-col gap-6">
                                    {data.education.map((edu) => (
                                        <div key={edu.id} id={`item-${edu.id}`}>
                                            <div className="font-bold text-lg leading-tight">
                                                {edu.school}
                                            </div>
                                            <div className="text-white/80 text-sm mb-1">{edu.date}</div>
                                            <div className="font-medium">{edu.degree}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    if (sectionId === 'skills' && data.skills && data.skills.length > 0) {
                        return (
                            <div key="skills" className="mb-8">
                                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-white/30 pb-2 mb-4">
                                    Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.skills.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-white/30 rounded-full text-sm font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    // Custom Sidebar Section
                    const cs = customSections.find((s) => s.id === sectionId);
                    if (cs && cs.items.length > 0) {
                        return (
                            <div key={sectionId} className="mb-8">
                                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-white/30 pb-2 mb-4">
                                    {cs.title}
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {cs.items.map((item) => (
                                        <div key={item.id} id={`item-${item.id}`}>
                                            <div className="font-bold text-md">{item.title}</div>
                                            {item.subtitle && (
                                                <div className="text-white/80 text-sm">{item.subtitle}</div>
                                            )}
                                            {item.date && (
                                                <div className="text-white/60 text-xs italic">
                                                    {item.date}
                                                </div>
                                            )}
                                            {item.description && (
                                                <div className="text-sm mt-1 opacity-90">
                                                    {item.description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>

            {/* Main Content - Right Side */}
            <div className="flex-1 p-8 flex flex-col gap-6">
                {isFirstPage && (
                    <div className="mb-4">
                        <h1
                            className={`text-5xl font-extrabold ${theme.text} mb-2 uppercase tracking-tight leading-none`}
                        >
                            {personal.fullName || 'Your Name'}
                        </h1>
                        <p className={`text-2xl font-medium ${theme.primary} opacity-90`}>
                            {personal.title || 'Professional Title'}
                        </p>
                    </div>
                )}

                {mainSectionIds.map((sectionId) => {
                    const isCustom = !['summary', 'experience'].includes(sectionId);
                    const sectionData = isCustom ? customSections.find((s) => s.id === sectionId) : null;

                    if (sectionId === 'summary' && personal.summary) {
                        return (
                            <div key={sectionId} className="mb-2">
                                <h3
                                    className={`text-xl font-bold uppercase tracking-wider ${theme.text} border-b-2 ${theme.border} pb-2 mb-4`}
                                >
                                    Profile
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-lg">{personal.summary}</p>
                            </div>
                        );
                    }

                    if (sectionId === 'experience' && data.experience.length > 0) {
                        const isFirstPageOfSection =
                            !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
                        return (
                            <div
                                key={sectionId}
                                id="section-experience"
                                style={sectionStyle(data, 'experience')}
                            >
                                {isFirstPageOfSection && (
                                    <h3
                                        id="section-title-experience"
                                        className={`text-xl font-bold uppercase tracking-wider ${theme.text} border-b-2 ${theme.border} pb-2 mb-6`}
                                    >
                                        Experience
                                    </h3>
                                )}
                                <div className="flex flex-col gap-0 border-l-2 border-gray-200 ml-3 pl-8 relative">
                                    {data.experience.map((exp) => (
                                        <div
                                            key={exp.id}
                                            id={`item-${exp.id}`}
                                            className="mb-8 relative break-inside-avoid"
                                        >
                                            {/* Timeline Dot */}
                                            <div
                                                className={`absolute -left-[41px] top-1.5 w-5 h-5 rounded-full border-4 border-white ${theme.primary} shadow-sm`}
                                            />

                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                                                <h4 className="text-xl font-bold text-gray-900">
                                                    {exp.role}
                                                </h4>
                                                <div
                                                    className={`text-sm font-bold ${theme.primary} bg-opacity-10 px-3 py-1 rounded-full bg-gray-100`}
                                                >
                                                    {exp.date}
                                                </div>
                                            </div>
                                            <div className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <Building size={16} className="text-gray-400" />
                                                {exp.company}
                                                {exp.location && (
                                                    <span className="text-gray-400 font-normal text-sm">
                                                        • {exp.location}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                                                {exp.bullets && exp.bullets.length > 0 && (
                                                    <ul className="list-disc list-outside ml-5 space-y-1">
                                                        {exp.bullets.map((bullet, i) => (
                                                            <li
                                                                key={i}
                                                                className="text-sm text-gray-700 leading-relaxed"
                                                            >
                                                                {bullet}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    if (isCustom && sectionData && sectionData.items.length > 0) {
                        return (
                            <div key={sectionId}>
                                <h3
                                    className={`text-xl font-bold uppercase tracking-wider ${theme.text} border-b-2 ${theme.border} pb-2 mb-4`}
                                >
                                    {sectionData.title}
                                </h3>
                                <div className="flex flex-col gap-6">
                                    {sectionData.items.map((item) => (
                                        <div key={item.id}>
                                            <div className="flex justify-between items-baseline font-bold text-gray-900 text-lg">
                                                <span>{item.title}</span>
                                                <span className="text-sm text-gray-500 font-normal">
                                                    {item.date}
                                                </span>
                                            </div>
                                            {item.subtitle && (
                                                <div className="text-md font-medium text-gray-700 mb-1">
                                                    {item.subtitle}
                                                </div>
                                            )}
                                            {item.description && (
                                                <p className="text-gray-600 whitespace-pre-line">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default LayoutCreative;
