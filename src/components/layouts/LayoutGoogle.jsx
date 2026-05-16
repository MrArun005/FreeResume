// LayoutGoogle — "Google internal" style: modern sans-serif, Google brand accent.
// Clean single-column, ATS-friendly, subtle blue rule under section titles.

const TEXT = '#202124';        // Google text gray-900
const MUTED = '#5f6368';       // Google gray-600
const BORDER = '#dadce0';      // Google gray-300
const ACCENT = '#1a73e8';      // Google blue 600
const ACCENT_BG = '#e8f0fe';   // Google blue 50

const SectionTitle = ({ title }) => (
    <div className="mt-5 mb-2">
        <h2 className="text-[11px] font-semibold tracking-[0.04em] uppercase" style={{ color: TEXT }}>{title}</h2>
        <div className="h-[2px] w-6 mt-1" style={{ backgroundColor: ACCENT }} />
    </div>
);

const LayoutGoogle = ({ data, pageIndex }) => {
    const { personal, experience, education, skills, customSections } = data;

    const shouldRenderTitle = (sectionId) => {
        return !data.sectionStartPage || data.sectionStartPage[sectionId] === pageIndex;
    };

    const renderContact = () => {
        const items = [];
        if (personal.email) items.push({ key: 'email', label: personal.email, href: `mailto:${personal.email}` });
        if (personal.phone) items.push({ key: 'phone', label: personal.phone });
        if (personal.location) items.push({ key: 'loc', label: personal.location });
        (personal.socials || []).forEach((s) => {
            if (s.url) items.push({ key: s.id, label: s.network, href: s.url });
        });

        return (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]" style={{ color: MUTED }}>
                {items.map((item, i) => (
                    <span key={item.key} className="inline-flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-[1px]" style={{ backgroundColor: ACCENT }} />
                        {item.href ? (
                            <a href={item.href} className="hover:underline">{item.label}</a>
                        ) : (
                            <span>{item.label}</span>
                        )}
                        {i < items.length - 1 && <span className="ml-3" style={{ color: BORDER }}>·</span>}
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
                                <div className="flex justify-between items-baseline gap-3">
                                    <div className="text-[12px] font-semibold" style={{ color: ACCENT }}>{exp.role || 'Role'}</div>
                                    <div className="text-[10px]" style={{ color: MUTED }}>{exp.date}</div>
                                </div>
                                <div className="text-[10.5px] font-medium mt-0.5" style={{ color: TEXT }}>
                                    {exp.company}{exp.location && ` · ${exp.location}`}
                                </div>
                                {exp.bullets?.length > 0 && (
                                    <ul className="mt-1.5 space-y-1">
                                        {exp.bullets.map((b, i) => (
                                            <li key={i} className="flex gap-2 text-[10.5px] leading-[1.55]" style={{ color: TEXT }}>
                                                <span className="select-none" style={{ color: MUTED }}>•</span>
                                                <span>{b}</span>
                                            </li>
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
                    <div className="space-y-2.5">
                        {education.map((edu) => (
                            <div key={edu.id} id={`item-${edu.id}`} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline gap-3">
                                    <div className="text-[12px] font-semibold" style={{ color: ACCENT }}>{edu.school || 'School'}</div>
                                    <div className="text-[10px]" style={{ color: MUTED }}>{edu.date}</div>
                                </div>
                                <div className="text-[10.5px] mt-0.5" style={{ color: TEXT }}>
                                    {edu.degree}{edu.location && ` · ${edu.location}`}
                                </div>
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
                    <div className="flex flex-wrap gap-1.5">
                        {skills.map((s, i) => (
                            <span
                                key={i}
                                className="text-[10px] px-2 py-[2px] rounded-[3px]"
                                style={{ backgroundColor: ACCENT_BG, color: ACCENT }}
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                </section>
            );
        }

        const customSection = customSections?.find((s) => s.id === sectionId);
        if (customSection && customSection.items?.length > 0) {
            return (
                <section key={customSection.id} id={`section-${sectionId}`}>
                    {shouldRenderTitle(sectionId) && (
                        <div id={`section-title-${sectionId}`}>
                            <SectionTitle title={customSection.title} />
                        </div>
                    )}
                    <div className="space-y-3">
                        {customSection.items.map((item) => (
                            <div key={item.id} id={`item-${item.id}`} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline gap-3">
                                    <div className="text-[12px] font-semibold" style={{ color: ACCENT }}>{item.title}</div>
                                    {item.date && <div className="text-[10px]" style={{ color: MUTED }}>{item.date}</div>}
                                </div>
                                {item.subtitle && (
                                    <div className="text-[10.5px] font-medium mt-0.5" style={{ color: TEXT }}>{item.subtitle}</div>
                                )}
                                {item.description && (
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
            className="h-[297mm] w-full bg-white overflow-hidden font-clean"
            style={{ padding: '14mm 16mm', color: TEXT }}
        >
            {/* Header */}
            {pageIndex === 0 && (
                <div id="section-personal" className="mb-4 pb-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <h1 className="text-[26px] font-semibold tracking-tight leading-tight" style={{ color: TEXT }}>
                        {personal.fullName || 'Your Name'}
                    </h1>
                    {personal.title && (
                        <div className="text-[12px] mt-0.5 mb-2" style={{ color: MUTED }}>{personal.title}</div>
                    )}
                    {renderContact()}
                </div>
            )}

            {(data.sectionOrder || ['summary', 'experience', 'education', 'skills']).map(renderSection)}
        </div>
    );
};

export default LayoutGoogle;
