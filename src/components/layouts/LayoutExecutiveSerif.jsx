// LayoutExecutiveSerif — classical professional template.
// Georgia serif, pure black-and-white, centered all-caps name, full-width
// underlined section headings. Targets law/finance/consulting recruiters where
// "modern" reads as "young & inexperienced".

const TEXT = '#0F172A';
const MUTED = '#475569';
const RULE = '#0F172A';

const SectionTitle = ({ title }) => (
    <div className="mt-5 mb-3" style={{ pageBreakAfter: 'avoid' }}>
        <h2 className="text-[12px] font-bold uppercase" style={{ color: TEXT, letterSpacing: '0.10em' }}>
            {title}
        </h2>
        <div style={{ height: 1, background: RULE, marginTop: 4 }} />
    </div>
);

const Bullet = ({ children }) => (
    <li
        className="text-[10.5px] leading-[1.5]"
        style={{ color: TEXT, paddingLeft: 14, textIndent: -14, marginBottom: 2 }}
    >
        <span>•&nbsp;&nbsp;</span>
        {children}
    </li>
);

const LayoutExecutiveSerif = ({ data, pageIndex, isMeasurement }) => {
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
        return parts.join(' • ');
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
                    <p className="text-[11px] leading-[1.55] text-justify" style={{ color: TEXT }}>
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
                    <div className="space-y-3">
                        {experience.map((exp) => (
                            <div key={exp.id} id={`item-${exp.id}`} className="break-inside-avoid">
                                <div className="flex items-baseline justify-between gap-4">
                                    <div className="text-[11.5px] flex-1 min-w-0" style={{ color: TEXT }}>
                                        <span className="font-bold">{exp.company || 'Company'}</span>
                                        {exp.location && <span>, {exp.location}</span>}
                                    </div>
                                    {exp.date && (
                                        <div
                                            className="text-[10.5px] shrink-0 whitespace-nowrap"
                                            style={{ color: MUTED }}
                                        >
                                            {exp.date}
                                        </div>
                                    )}
                                </div>
                                {exp.role && (
                                    <div className="text-[11px] italic mb-1" style={{ color: TEXT }}>
                                        {exp.role}
                                    </div>
                                )}
                                {exp.bullets?.length > 0 && (
                                    <ul className="list-none p-0 m-0">
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
                    <div className="space-y-2">
                        {education.map((edu) => (
                            <div key={edu.id} id={`item-${edu.id}`} className="break-inside-avoid">
                                <div className="flex items-baseline justify-between gap-4">
                                    <div className="text-[11px] flex-1 min-w-0" style={{ color: TEXT }}>
                                        <span className="font-bold">{edu.school || 'School'}</span>
                                        {edu.location && <span>, {edu.location}</span>}
                                    </div>
                                    {edu.date && (
                                        <div
                                            className="text-[10.5px] shrink-0 whitespace-nowrap"
                                            style={{ color: MUTED }}
                                        >
                                            {edu.date}
                                        </div>
                                    )}
                                </div>
                                {edu.degree && (
                                    <div className="text-[11px] italic" style={{ color: TEXT }}>
                                        {edu.degree}
                                    </div>
                                )}
                                {edu.gpa && (
                                    <div className="text-[10.5px]" style={{ color: TEXT }}>
                                        GPA: {edu.gpa}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            );
        }

        if (sectionId === 'skills' && skills.length > 0) {
            const flat = skills.flatMap((s) => {
                const idx = typeof s === 'string' ? s.indexOf(':') : -1;
                return idx > 0
                    ? s
                          .slice(idx + 1)
                          .split(',')
                          .map((x) => x.trim())
                          .filter(Boolean)
                    : [s];
            });
            return (
                <section key="skills" id={`section-${sectionId}`} className="break-inside-avoid">
                    {shouldRenderTitle(sectionId) && (
                        <div id={`section-title-${sectionId}`}>
                            <SectionTitle title="Skills" />
                        </div>
                    )}
                    <p className="text-[11px] leading-[1.6]" style={{ color: TEXT }}>
                        {flat.join(' • ')}
                    </p>
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
                    <div className="space-y-3">
                        {custom.items.map((item) => (
                            <div key={item.id} id={`item-${item.id}`} className="break-inside-avoid">
                                <div className="flex items-baseline justify-between gap-4">
                                    <div
                                        className="text-[11px] font-bold flex-1 min-w-0"
                                        style={{ color: TEXT }}
                                    >
                                        {item.title}
                                        {item.subtitle && (
                                            <span className="font-normal italic">, {item.subtitle}</span>
                                        )}
                                    </div>
                                    {item.date && (
                                        <div
                                            className="text-[10.5px] shrink-0 whitespace-nowrap"
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
                                        className="text-[11px] leading-[1.55] mt-1 whitespace-pre-line"
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
            className={`${isMeasurement ? 'h-auto overflow-visible' : 'h-[297mm] overflow-hidden'} w-full bg-white`}
            style={{
                padding: '18mm 20mm',
                color: TEXT,
                fontFamily: 'Georgia, "Times New Roman", Times, serif',
            }}
        >
            {pageIndex === 0 && (
                <div id="section-personal" className="text-center mb-4">
                    <h1
                        className="text-[26px]"
                        style={{
                            fontWeight: 400,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            marginBottom: 6,
                        }}
                    >
                        {personal.fullName || 'Your Name'}
                    </h1>
                    {personal.title && (
                        <div className="text-[12px] italic mb-2" style={{ color: MUTED }}>
                            {personal.title}
                        </div>
                    )}
                    <div className="text-[10.5px]" style={{ color: TEXT }}>
                        {renderContactLine()}
                    </div>
                    <div style={{ height: 1, background: RULE, marginTop: 10 }} />
                </div>
            )}

            {(data.sectionOrder || ['summary', 'experience', 'education', 'skills']).map(renderSection)}
        </div>
    );
};

export default LayoutExecutiveSerif;
