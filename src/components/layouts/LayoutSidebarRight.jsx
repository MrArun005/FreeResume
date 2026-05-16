import { Link as LinkIcon } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';

const LayoutSidebarRight = ({ data, theme, pageIndex, isMeasurement }) => {
    // ... (rest of file)

    {
        (data.personal.socials || []).map(social => (
            <p key={social.id} className="text-sm mb-1 flex items-center justify-end gap-2">
                <a href={social.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{social.network}</a>
                <LinkIcon size={14} />
            </p>
        ))
    }
    // Helper to render main content sections
    const renderMainSection = (sectionId) => {
        if (sectionId === 'summary') {
            return (
                <div key="summary" id={`section-summary`} className="mb-8">
                    <SectionTitle title="Summary" theme={theme} />
                    <p className="text-sm leading-relaxed text-gray-600">{data.personal.summary}</p>
                </div>
            );
        }

        if (sectionId === 'experience' && data.experience.length > 0) {
            const isFirstPageOfSection = !data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex;
            return (
                <div key="experience" id="section-experience" className="mb-10">
                    {isFirstPageOfSection && (
                        <SectionTitle id="section-title-experience" title="Experience" theme={theme} />
                    )}
                    {data.experience.map((exp) => (
                        <div key={exp.id} id={`item-${exp.id}`} className="mb-6 break-inside-avoid">
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-lg">{exp.role}</h4>
                                <span className="text-sm text-gray-500">{exp.date}</span>
                            </div>
                            <div className="text-sm font-semibold text-gray-700 mb-2">{exp.company}</div>
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

        // Custom sections in main area
        const customSection = data.customSections?.find(s => s.id === sectionId);
        if (customSection && customSection.items.length > 0) {
            return (
                <div key={sectionId} id={`section-${sectionId}`} className="mb-8">
                    {(!data.sectionStartPage || data.sectionStartPage[sectionId] === data.pageIndex) && (
                        <h3 id={`section-title-${sectionId}`} className={`text-lg font-bold uppercase tracking-widest mb-6 ${theme.text}`}>{customSection.title}</h3>
                    )}
                    {customSection.items.map((item) => (
                        <div key={item.id} id={`item-${item.id}`} className="mb-6 border-l-2 border-gray-200 pl-4 relative">
                            <div className="break-inside-avoid">
                                <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${theme.primary}`}></div>
                                <h4 className="font-bold text-md">{item.title}</h4>
                                <div className="flex justify-between text-sm mb-2">
                                    {item.subtitle && <span className={`${theme.text} font-medium`}>{item.subtitle}</span>}
                                    {item.date && <span className="text-gray-400 italic">{item.date}</span>}
                                </div>
                            </div>
                            {item.description && <p className="text-sm text-gray-600 whitespace-pre-line">{item.description}</p>}
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <div className={`w-full flex bg-white ${isMeasurement ? 'h-auto overflow-visible' : 'h-[297mm] overflow-hidden'} ${theme.font}`}>
            {/* Dynamic Main Content */}
            <div className="flex-[2] p-8 text-gray-800 flex flex-col min-w-0">
                {pageIndex === 0 && (
                    <header id="section-personal" className="mb-8">
                        <h1 className={`text-4xl font-bold ${theme.text} mb-2`}>{data.personal.fullName.split(' ')[0]} <span className="font-light text-gray-400">{data.personal.fullName.split(' ').slice(1).join(' ')}</span></h1>
                        <p className="text-lg tracking-wider text-gray-600 uppercase">{data.personal.title}</p>
                    </header>
                )}

                {data.sectionOrder?.filter(id => !['education', 'skills'].includes(id)).map(sectionId => renderMainSection(sectionId))}
            </div>

            {/* Fixed Sidebar */}
            <div className={`flex-[1] ${theme.accent} p-8 border-l ${theme.border} border-opacity-20 min-w-0 min-h-full`}>
                {pageIndex === 0 && (
                    <div id="section-contact" className="mb-10 text-right">
                        <SectionTitle title="Contact" theme={theme} className="text-right" />
                        <p className="text-sm font-bold mb-1">{data.personal.email}</p>
                        <p className="text-sm mb-1">{data.personal.phone}</p>
                        <p className="text-sm mb-1">{data.personal.location}</p>
                        {(data.personal.socials || []).map(social => (
                            <p key={social.id} className="text-sm mb-1">
                                <span className="font-bold opacity-70">{social.network}:</span> {social.username}
                            </p>
                        ))}
                    </div>
                )}
                {data.education && data.education.length > 0 && (
                    <div id="section-education" className="mb-10 text-right">
                        <SectionTitle id="section-title-education" title="Education" theme={theme} className="text-right" />
                        {data.education.map((edu) => (
                            <div key={edu.id} id={`item-${edu.id}`} className="mb-3 text-sm break-inside-avoid">
                                <div className="font-bold">{edu.degree}</div>
                                <div className="text-white/80 text-xs">{edu.school}</div>
                                <div className="text-white/60 text-xs italic">{edu.date}</div>
                            </div>
                        ))}
                    </div>
                )}
                {data.skills && data.skills.length > 0 && (
                    <div id="section-skills" className="text-right">
                        <h3 className="text-xs uppercase tracking-widest font-bold border-b border-white/30 pb-2 mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2 justify-end">
                            {data.skills.map((skill, i) => (
                                <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">{skill}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LayoutSidebarRight;
