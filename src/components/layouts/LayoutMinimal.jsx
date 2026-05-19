import { sectionStyle } from '../../utils/sectionStyles';
import { Link as LinkIcon } from 'lucide-react';

const LayoutMinimal = ({ data, theme, pageIndex, isMeasurement }) => {
    // ... (rest of file)

    {
        (data.personal.socials || []).map((social) => (
            <span key={social.id} className="font-medium text-gray-800 flex items-center gap-1">
                <LinkIcon size={12} />
                <a href={social.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {social.network}
                </a>
            </span>
        ));
    }
    // Helper to render each section type
    const renderSection = (sectionId) => {
        if (sectionId === 'summary') {
            return (
                <div
                    key="summary"
                    id={`section-summary`}
                    style={sectionStyle(data, 'summary')}
                    className="grid grid-cols-12 gap-4"
                >
                    <div className="col-span-3">
                        <h3 className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>About</h3>
                    </div>
                    <div className="col-span-9">
                        <p className="text-sm text-gray-600 leading-relaxed">{data.personal.summary}</p>
                    </div>
                </div>
            );
        }

        if (sectionId === 'experience') {
            const isFirstPageOfSection =
                !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
            return (
                <div
                    key="experience"
                    id="section-experience"
                    style={sectionStyle(data, 'experience')}
                    className="grid grid-cols-12 gap-4"
                >
                    <div className="col-span-3">
                        {isFirstPageOfSection && (
                            <h3
                                id="section-title-experience"
                                className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}
                            >
                                Experience
                            </h3>
                        )}
                    </div>
                    <div className="col-span-9 space-y-6">
                        {data.experience.map((exp) => (
                            <div key={exp.id} id={`item-${exp.id}`}>
                                <div className="break-inside-avoid">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-sm text-gray-900">{exp.company}</h4>
                                        <span className="text-xs text-gray-400">{exp.date}</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 mb-2">{exp.role}</p>
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
                </div>
            );
        }

        if (sectionId === 'education') {
            const isFirstPageOfSection =
                !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
            return (
                <div
                    key="education"
                    id="section-education"
                    style={sectionStyle(data, 'education')}
                    className="grid grid-cols-12 gap-4"
                >
                    <div className="col-span-3">
                        {isFirstPageOfSection && (
                            <h3
                                id="section-title-education"
                                className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}
                            >
                                Education
                            </h3>
                        )}
                    </div>
                    <div className="col-span-9 space-y-4">
                        {data.education.map((edu) => (
                            <div key={edu.id} id={`item-${edu.id}`} className="break-inside-avoid">
                                <h4 className="font-bold text-sm text-gray-900">{edu.school}</h4>
                                <p className="text-sm text-gray-600">{edu.degree}</p>
                                <span className="text-xs text-gray-400">{edu.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (sectionId === 'skills') {
            return (
                <div
                    key="skills"
                    id={`section-skills`}
                    style={sectionStyle(data, 'skills')}
                    className="grid grid-cols-12 gap-4"
                >
                    <div className="col-span-3">
                        <h3 className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>
                            Skills
                        </h3>
                    </div>
                    <div className="col-span-9">
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill, i) => (
                                <span key={i} className="text-xs font-medium text-gray-600">
                                    {skill}
                                    {i < data.skills.length - 1 ? ',' : ''}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Custom sections
        const customSection = data.customSections?.find((s) => s.id === sectionId);
        if (customSection && customSection.items.length > 0) {
            return (
                <div
                    key={sectionId}
                    id={`section-${sectionId}`}
                    style={sectionStyle(data, sectionId)}
                    className="grid grid-cols-12 gap-4"
                >
                    <div className="col-span-3">
                        {(!data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex) && (
                            <h3
                                id={`section-title-${sectionId}`}
                                className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}
                            >
                                {customSection.title}
                            </h3>
                        )}
                    </div>
                    <div className="col-span-9 space-y-6">
                        {customSection.items.map((item) => (
                            <div key={item.id} id={`item-${item.id}`}>
                                <div className="break-inside-avoid">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                                        {item.date && (
                                            <span className="text-xs text-gray-400">{item.date}</span>
                                        )}
                                    </div>
                                    {item.subtitle && (
                                        <p className="text-xs font-medium text-gray-500 mb-2">
                                            {item.subtitle}
                                        </p>
                                    )}
                                </div>
                                {item.description && (
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
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
    };

    return (
        <div
            className={`w-full p-[20mm] bg-white ${isMeasurement ? 'h-auto overflow-visible' : 'h-[var(--page-height)] overflow-hidden'} ${theme.font}`}
        >
            {pageIndex === 0 && (
                <header id="section-personal" className="mb-12">
                    <h1 className="text-3xl font-light tracking-tight mb-4">{data.personal.fullName}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                        <span>{data.personal.email}</span>
                        <span>{data.personal.phone}</span>
                        <span>{data.personal.location}</span>
                        {(data.personal.socials || []).map((social) => (
                            <span key={social.id} className="font-medium text-gray-800">
                                {social.network}: {social.username}
                            </span>
                        ))}
                    </div>
                </header>
            )}

            <div className="grid grid-cols-1 gap-10">
                {data.sectionOrder?.map((sectionId) => renderSection(sectionId))}
            </div>
        </div>
    );
};

export default LayoutMinimal;
