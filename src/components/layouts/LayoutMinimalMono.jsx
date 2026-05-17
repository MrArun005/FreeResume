// LayoutMinimalMono — extreme minimalism, zero decoration.
// Pure black on white, tight spacing, no rules or accents. Section heads are
// tiny tracked uppercase labels. Maximum ATS score because there's almost
// nothing for the parser to misread.

const TEXT = '#0F172A';
const MUTED = '#475569';

const SectionTitle = ({ title }) => (
    <h2
        className="text-[10px] font-bold uppercase mt-5 mb-2"
        style={{ color: TEXT, letterSpacing: '0.14em', pageBreakAfter: 'avoid' }}
    >
        {title}
    </h2>
);

const Bullet = ({ children }) => (
    <li
        className="text-[10px] leading-[1.45]"
        style={{ color: TEXT, paddingLeft: 10, textIndent: -10, marginBottom: 1 }}
    >
        <span>–&nbsp;</span>
        {children}
    </li>
);

const LayoutMinimalMono = ({ data, pageIndex, isMeasurement }) => {
    const { personal, experience, education, skills, customSections } = data;
    const shouldRenderTitle = (sectionId) =>
        !data.sectionStartPage || data.sectionStartPage[sectionId] === pageIndex;

    const renderContactLine = () => {
        const parts = [];
        if (personal.phone) parts.push(personal.phone);
        if (personal.email) parts.push(personal.email);
        if (personal.location) parts.push(personal.location);
        (personal.socials || []).forEach((s) => {
            if (s.url) parts.push(s.url.replace(/^https?:\/\//, ''));
        });
        return parts.join('  |  ');
    };

    const renderSection = (sectionId) => {
        if (sectionId === 'summary' && personal.summary) {
            return (
                <section key="summary" id={`section-${sectionId}`} className="break-inside-avoid">
                    {shouldRenderTitle(sectionId) && (
                        <div id={`section-title-${sectionId}`}>
                            <SectionTitle title="Summary" />
                        </div>
                    )}
                    <p className="text-[10px] leading-[1.5]" style={{ color: TEXT }}>
                        {personal.summary}
                    </p>
                </section>
            );
        }

        if (sectionId === 'experience' && experience.length > 0) {
            return (
                <section key="experience" id={`section-${sectionId}`}>
                    {shouldRenderTitle(sectionId) && (
                        <div id={`section-title-${sectionId}`}>
                            <SectionTitle title="Experience" />
                        </div>
                    )}
                    <div className="space-y-2.5">
                        {experience.map((exp) => (
                            <div key={exp.id} id={`item-${exp.id}`} className="break-inside-avoid">
                                <div className="flex items-baseline justify-between gap-4">
                                    <div className="text-[10.5px] flex-1 min-w-0" style={{ color: TEXT }}>
                                        <span className="font-bold">{exp.role || 'Role'}</span>
                                        {exp.company && <span> — {exp.company}</span>}
                                    </div>
                                    {exp.date && (
                                        <div
                                            className="text-[10px] shrink-0 whitespace-nowrap"
                                            style={{ color: MUTED }}
                                        >
                                            {exp.date}
                                        </div>
                                    )}
                                </div>
                                {exp.location && (
                                    <div className="text-[9.5px]" style={{ color: MUTED }}>
                                        {exp.location}
                                    </div>
                                )}
                                {exp.bullets?.length > 0 && (
                                    <ul className="list-none p-0 m-0 mt-1">
                                        {exp.bullets.map((b, i) => (
                                            <Bullet key={i}>{b}</Bullet>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            );
        }

        if (sectionId === 'education' && education.length > 0) {
            return (
                <section key="education" id={`section-${sectionId}`}>
                    {shouldRenderTitle(sectionId) && (
                        <div id={`section-title-${sectionId}`}>
                            <SectionTitle title="Education" />
                        </div>
                    )}
                    <div className="space-y-1.5">
                        {education.map((edu) => (
                            <div key={edu.id} id={`item-${edu.id}`} className="break-inside-avoid">
                                <div className="flex items-baseline justify-between gap-4">
                                    <div className="text-[10.5px] flex-1 min-w-0" style={{ color: TEXT }}>
                                        <span className="font-bold">{edu.school || 'School'}</span>
                                        {edu.degree && <span> — {edu.degree}</span>}
                                    </div>
                                    {edu.date && (
                                        <div
                                            className="text-[10px] shrink-0 whitespace-nowrap"
                                            style={{ color: MUTED }}
                                        >
                                            {edu.date}
                                        </div>
                                    )}
                                </div>
                                {edu.gpa && (
                                    <div className="text-[9.5px]" style={{ color: MUTED }}>
                                        GPA {edu.gpa}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            );
        }

        if (sectionId === 'skills' && skills.length > 0) {
            return (
                <section key="skills" id={`section-${sectionId}`} className="break-inside-avoid">
                    {shouldRenderTitle(sectionId) && (
                        <div id={`section-title-${sectionId}`}>
                            <SectionTitle title="Skills" />
                        </div>
                    )}
                    <div className="space-y-0.5">
                        {skills.map((skill, i) => {
                            const idx = typeof skill === 'string' ? skill.indexOf(':') : -1;
                            if (idx > 0) {
                                const label = skill.slice(0, idx);
                                const items = skill.slice(idx + 1).trim();
                                return (
                                    <div
                                        key={i}
                                        className="text-[10px] leading-[1.5]"
                                        style={{ color: TEXT }}
                                    >
                                        <span className="font-bold">{label}.</span> {items}
                                    </div>
                                );
                            }
                            return (
                                <span key={i} className="text-[10px]" style={{ color: TEXT }}>
                                    {skill}
                                    {i < skills.length - 1 ? ', ' : ''}
                                </span>
                            );
                        })}
                    </div>
                </section>
            );
        }

        const custom = customSections?.find((s) => s.id === sectionId);
        if (custom && custom.items?.length > 0) {
            return (
                <section key={custom.id} id={`section-${sectionId}`}>
                    {shouldRenderTitle(sectionId) && (
                        <div id={`section-title-${sectionId}`}>
                            <SectionTitle title={custom.title} />
                        </div>
                    )}
                    <div className="space-y-2.5">
                        {custom.items.map((item) => (
                            <div key={item.id} id={`item-${item.id}`} className="break-inside-avoid">
                                <div className="flex items-baseline justify-between gap-4">
                                    <div
                                        className="text-[10.5px] font-bold flex-1 min-w-0"
                                        style={{ color: TEXT }}
                                    >
                                        {item.title}
                                        {item.subtitle && (
                                            <span className="font-normal"> — {item.subtitle}</span>
                                        )}
                                    </div>
                                    {item.date && (
                                        <div
                                            className="text-[10px] shrink-0 whitespace-nowrap"
                                            style={{ color: MUTED }}
                                        >
                                            {item.date}
                                        </div>
                                    )}
                                </div>
                                {item.bullets?.length > 0 && (
                                    <ul className="list-none p-0 m-0 mt-1">
                                        {item.bullets.map((b, i) => (
                                            <Bullet key={i}>{b}</Bullet>
                                        ))}
                                    </ul>
                                )}
                                {item.description && !item.bullets?.length && (
                                    <p
                                        className="text-[10px] leading-[1.5] mt-1 whitespace-pre-line"
                                        style={{ color: TEXT }}
                                    >
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            );
        }

        return null;
    };

    return (
        <div
            className={`${isMeasurement ? 'h-auto overflow-visible' : 'h-[297mm] overflow-hidden'} w-full bg-white font-clean`}
            style={{ padding: '14mm 16mm', color: TEXT }}
        >
            {pageIndex === 0 && (
                <div id="section-personal" className="mb-2">
                    <h1 className="text-[22px] font-bold leading-tight" style={{ color: TEXT }}>
                        {personal.fullName || 'Your Name'}
                    </h1>
                    {personal.title && (
                        <div className="text-[11px] mt-0.5" style={{ color: MUTED }}>
                            {personal.title}
                        </div>
                    )}
                    <div className="text-[9.5px] mt-1.5" style={{ color: TEXT }}>
                        {renderContactLine()}
                    </div>
                </div>
            )}

            {(data.sectionOrder || ['summary', 'experience', 'education', 'skills']).map(renderSection)}
        </div>
    );
};

export default LayoutMinimalMono;
