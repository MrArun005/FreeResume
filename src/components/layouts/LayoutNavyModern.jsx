// LayoutNavyModern — corporate-consultant aesthetic.
// Inter sans-serif, navy (#0F2C5E) accent on name + section headings, left-
// aligned, modern light-navy chips for skills. Recruiter-friendly for BigCo,
// finance, consulting, and product roles.

const NAVY = '#0F2C5E';
const TEXT = '#0F172A';
const MUTED = '#475569';
const CHIP_BG = '#E0EAFC';
const RULE = '#CBD5E1';

const SectionTitle = ({ title }) => (
    <div className="mt-5 mb-2" style={{ pageBreakAfter: 'avoid' }}>
        <h2
            className="text-[11px] font-bold uppercase"
            style={{ color: NAVY, letterSpacing: '0.08em' }}
        >
            {title}
        </h2>
        <div style={{ height: 2, width: 28, background: NAVY, marginTop: 4 }} />
    </div>
);

const Bullet = ({ children }) => (
    <li
        className="text-[10.5px] leading-[1.5]"
        style={{ color: TEXT, paddingLeft: 12, textIndent: -12, marginBottom: 2 }}
    >
        <span style={{ color: NAVY }}>▸&nbsp;&nbsp;</span>{children}
    </li>
);

const LayoutNavyModern = ({ data, pageIndex, isMeasurement }) => {
    const { personal, experience, education, skills, customSections } = data;
    const shouldRenderTitle = (sectionId) =>
        !data.sectionStartPage || data.sectionStartPage[sectionId] === pageIndex;

    const renderContact = () => {
        const parts = [];
        if (personal.phone) parts.push(personal.phone);
        if (personal.email) parts.push(personal.email);
        if (personal.location) parts.push(personal.location);
        (personal.socials || []).forEach((s) => {
            if (s.url) parts.push(s.url.replace(/^https?:\/\//, ''));
        });
        return (
            <div className="flex flex-wrap items-center gap-x-2 text-[10.5px]" style={{ color: TEXT }}>
                {parts.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-2">
                        {p}
                        {i < parts.length - 1 && <span style={{ color: RULE }}>·</span>}
                    </span>
                ))}
            </div>
        );
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
                    <p className="text-[11px] leading-[1.55]" style={{ color: TEXT }}>{personal.summary}</p>
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
                                        <span className="font-bold" style={{ color: NAVY }}>{exp.role || 'Role'}</span>
                                        {exp.company && <span style={{ color: TEXT }}> · {exp.company}</span>}
                                        {exp.location && <span style={{ color: MUTED }}> · {exp.location}</span>}
                                    </div>
                                    {exp.date && <div className="text-[10.5px] shrink-0 whitespace-nowrap" style={{ color: MUTED }}>{exp.date}</div>}
                                </div>
                                {exp.bullets?.length > 0 && (
                                    <ul className="list-none p-0 m-0 mt-1.5">
                                        {exp.bullets.map((b, i) => <Bullet key={i}>{b}</Bullet>)}
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
                                        <span className="font-bold" style={{ color: NAVY }}>{edu.school || 'School'}</span>
                                        {edu.location && <span style={{ color: MUTED }}> · {edu.location}</span>}
                                    </div>
                                    {edu.date && <div className="text-[10.5px] shrink-0 whitespace-nowrap" style={{ color: MUTED }}>{edu.date}</div>}
                                </div>
                                {edu.degree && <div className="text-[10.5px]" style={{ color: TEXT }}>{edu.degree}{edu.gpa && ` · GPA ${edu.gpa}`}</div>}
                            </div>
                        ))}
                    </div>
                </section>
            );
        }

        if (sectionId === 'skills' && skills.length > 0) {
            // Render category strings ("Languages: Python, SQL") as a label + chip cluster.
            // Plain strings render as a chip.
            return (
                <section key="skills" id={`section-${sectionId}`} className="break-inside-avoid">
                    {shouldRenderTitle(sectionId) && (
                        <div id={`section-title-${sectionId}`}>
                            <SectionTitle title="Skills" />
                        </div>
                    )}
                    <div className="space-y-2">
                        {skills.map((skill, i) => {
                            const idx = typeof skill === 'string' ? skill.indexOf(':') : -1;
                            if (idx > 0) {
                                const label = skill.slice(0, idx);
                                const items = skill.slice(idx + 1).split(',').map((x) => x.trim()).filter(Boolean);
                                return (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="text-[10.5px] font-bold w-32 shrink-0 pt-1" style={{ color: NAVY }}>{label}</div>
                                        <div className="flex flex-wrap gap-1">
                                            {items.map((it, j) => (
                                                <span
                                                    key={j}
                                                    className="text-[10px] px-2 py-0.5 rounded"
                                                    style={{ background: CHIP_BG, color: NAVY }}
                                                >
                                                    {it}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <span
                                    key={i}
                                    className="inline-block text-[10px] px-2 py-0.5 rounded mr-1"
                                    style={{ background: CHIP_BG, color: NAVY }}
                                >
                                    {skill}
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
                    <div className="space-y-3">
                        {custom.items.map((item) => (
                            <div key={item.id} id={`item-${item.id}`} className="break-inside-avoid">
                                <div className="flex items-baseline justify-between gap-4">
                                    <div className="text-[11px] font-bold flex-1 min-w-0" style={{ color: NAVY }}>
                                        {item.title}{item.subtitle && <span className="font-normal" style={{ color: TEXT }}> · {item.subtitle}</span>}
                                    </div>
                                    {item.date && <div className="text-[10.5px] shrink-0 whitespace-nowrap" style={{ color: MUTED }}>{item.date}</div>}
                                </div>
                                {item.bullets?.length > 0 && (
                                    <ul className="list-none p-0 m-0 mt-1.5">
                                        {item.bullets.map((b, i) => <Bullet key={i}>{b}</Bullet>)}
                                    </ul>
                                )}
                                {item.description && !item.bullets?.length && (
                                    <p className="text-[10.5px] leading-[1.55] mt-1 whitespace-pre-line" style={{ color: TEXT }}>{item.description}</p>
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
                <div id="section-personal" className="mb-3 pb-3" style={{ borderBottom: `1px solid ${RULE}` }}>
                    <h1
                        className="text-[28px] font-bold leading-tight tracking-tight"
                        style={{ color: NAVY }}
                    >
                        {personal.fullName || 'Your Name'}
                    </h1>
                    {personal.title && (
                        <div className="text-[13px] mt-0.5 mb-2" style={{ color: MUTED }}>{personal.title}</div>
                    )}
                    {renderContact()}
                </div>
            )}

            {(data.sectionOrder || ['summary', 'experience', 'education', 'skills']).map(renderSection)}
        </div>
    );
};

export default LayoutNavyModern;
