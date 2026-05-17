// LayoutBoldRecruit — recruiter-scan optimized.
// Red accent name + section headings, inline "|"-separated contact row,
// en-dash bullets with hanging indent, numbered projects, right-aligned dates.

import React from 'react';
import { Phone, Mail, MapPin, Linkedin } from 'lucide-react';

const ACCENT = '#DC2626'; // red-600
const TEXT = '#0F172A';
const MUTED = '#475569';
const RULE = '#CBD5E1';

const SectionTitle = ({ title }) => (
    <div className="mt-5 mb-2" style={{ pageBreakAfter: 'avoid' }}>
        <h2
            className="text-[13px] font-bold tracking-wide uppercase leading-tight"
            style={{ color: ACCENT, letterSpacing: '0.04em' }}
        >
            {title}
        </h2>
        <div style={{ height: 1, background: RULE, marginTop: 4 }} />
    </div>
);

// Hanging-indent bulleted line. The en-dash sits in the left gutter so wrapped
// lines align under the bullet text, not under the bullet character. The
// padding/indent values are tuned so the dash + space lands flush with the
// gutter and wrapped lines start clearly past the dash.
const Bullet = ({ children }) => (
    <li
        className="text-[10.5px] leading-[1.55]"
        style={{
            color: TEXT,
            paddingLeft: 16,
            textIndent: -16,
            marginBottom: 2,
        }}
    >
        <span style={{ color: TEXT }}>– </span>
        {children}
    </li>
);

const ContactItem = ({ icon: Icon, color, label, href }) => {
    const content = (
        <span className="inline-flex items-center gap-1 text-[10.5px]" style={{ color: TEXT }}>
            <Icon size={11} style={{ color }} /> {label}
        </span>
    );
    return href ? (
        <a href={href} className="hover:underline">
            {content}
        </a>
    ) : (
        content
    );
};

const LayoutBoldRecruit = ({ data, pageIndex, isMeasurement }) => {
    const { personal, experience, education, skills, customSections } = data;

    const shouldRenderTitle = (sectionId) =>
        !data.sectionStartPage || data.sectionStartPage[sectionId] === pageIndex;

    // Group experience bullets in a way the rendered list keeps a tight, scan-friendly feel.
    const renderExperience = (sectionId) => (
        <section key={sectionId} id={`section-${sectionId}`}>
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
                                <span className="font-bold">{exp.role || 'Role'}</span>
                                {exp.company && <span>, {exp.company}</span>}
                                {exp.location && <span> | {exp.location}</span>}
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
                        {exp.bullets?.length > 0 && (
                            <ul className="mt-1.5 list-none p-0 m-0">
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

    const renderEducation = (sectionId) => (
        <section key={sectionId} id={`section-${sectionId}`}>
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
                                {edu.degree && <span className="font-medium">{edu.degree}</span>}
                                {edu.school && <span> - {edu.school}</span>}
                                {edu.location && <span> | {edu.location}</span>}
                                {edu.date && <span> | {edu.date}</span>}
                            </div>
                            {edu.gpa && (
                                <div
                                    className="text-[10.5px] shrink-0 whitespace-nowrap"
                                    style={{ color: TEXT }}
                                >
                                    GPA: {edu.gpa}
                                </div>
                            )}
                        </div>
                        {edu.coursework && (
                            <div className="text-[10.5px] mt-0.5" style={{ color: TEXT }}>
                                <span className="font-medium">Relevant Coursework:</span> {edu.coursework}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );

    // Skills as bold-label bullets:  – **Languages:** Python, SQL, JavaScript
    // We split a skill on the first ":" to bold the label portion. Plain skills
    // without a colon still render as a simple line item.
    const renderSkills = (sectionId) => (
        <section key={sectionId} id={`section-${sectionId}`} className="break-inside-avoid">
            {shouldRenderTitle(sectionId) && (
                <div id={`section-title-${sectionId}`}>
                    <SectionTitle title="Skills" />
                </div>
            )}
            <ul className="list-none p-0 m-0">
                {skills.map((skill, i) => {
                    const colonIdx = typeof skill === 'string' ? skill.indexOf(':') : -1;
                    if (colonIdx > 0) {
                        const label = skill.slice(0, colonIdx);
                        const rest = skill.slice(colonIdx + 1).trim();
                        return (
                            <Bullet key={i}>
                                <span className="font-bold">{label}:</span> {rest}
                            </Bullet>
                        );
                    }
                    return <Bullet key={i}>{skill}</Bullet>;
                })}
            </ul>
        </section>
    );

    const renderCustom = (section) => {
        const isProjects = /project/i.test(section.title);
        return (
            <section key={section.id} id={`section-${section.id}`}>
                {shouldRenderTitle(section.id) && (
                    <div id={`section-title-${section.id}`}>
                        <SectionTitle title={section.title} />
                    </div>
                )}
                <div className="space-y-3">
                    {section.items.map((item, idx) => (
                        <div key={item.id} id={`item-${item.id}`} className="break-inside-avoid">
                            <div className="flex items-baseline justify-between gap-4">
                                <div className="text-[11px] flex-1 min-w-0" style={{ color: TEXT }}>
                                    {isProjects && <span className="font-bold">{idx + 1}. </span>}
                                    {item.title && <span className="font-bold">{item.title}</span>}
                                    {item.subtitle && <span className="font-medium"> - {item.subtitle}</span>}
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
                                <ul className="mt-1.5 list-none p-0 m-0">
                                    {item.bullets.map((b, i) => (
                                        <Bullet key={i}>{b}</Bullet>
                                    ))}
                                </ul>
                            )}
                            {item.description && !item.bullets?.length && (
                                <p
                                    className="text-[10.5px] leading-[1.55] mt-1 whitespace-pre-line"
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
                    <p className="text-[11px] leading-[1.55]" style={{ color: TEXT }}>
                        {personal.summary}
                    </p>
                </section>
            );
        }
        if (sectionId === 'experience' && experience.length > 0) return renderExperience(sectionId);
        if (sectionId === 'education' && education.length > 0) return renderEducation(sectionId);
        if (sectionId === 'skills' && skills.length > 0) return renderSkills(sectionId);

        const custom = customSections?.find((s) => s.id === sectionId);
        if (custom && custom.items?.length > 0) return renderCustom(custom);
        return null;
    };

    return (
        <div
            className={`${isMeasurement ? 'h-auto overflow-visible' : 'h-[297mm] overflow-hidden'} w-full bg-white font-clean`}
            style={{ padding: '14mm 16mm', color: TEXT }}
        >
            {/* Header — only on page 1 */}
            {pageIndex === 0 && (
                <div id="section-personal" className="mb-2">
                    <h1
                        className="text-[28px] font-extrabold leading-tight tracking-tight"
                        style={{ color: ACCENT, marginBottom: 4 }}
                    >
                        {personal.fullName || 'Your Name'}
                    </h1>
                    <div
                        className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px]"
                        style={{ color: TEXT }}
                    >
                        {personal.phone && (
                            <>
                                <ContactItem
                                    icon={Phone}
                                    color={TEXT}
                                    label={personal.phone}
                                    href={`tel:${personal.phone}`}
                                />
                                <span style={{ color: RULE }}>|</span>
                            </>
                        )}
                        {personal.email && (
                            <>
                                <ContactItem
                                    icon={Mail}
                                    color={TEXT}
                                    label={personal.email}
                                    href={`mailto:${personal.email}`}
                                />
                                <span style={{ color: RULE }}>|</span>
                            </>
                        )}
                        {personal.location && (
                            <>
                                <ContactItem icon={MapPin} color="#16A34A" label={personal.location} />
                                {(personal.socials || []).length > 0 && (
                                    <span style={{ color: RULE }}>|</span>
                                )}
                            </>
                        )}
                        {(personal.socials || []).map((s, i, arr) => {
                            const url = s.url?.startsWith('http') ? s.url : `https://${s.url}`;
                            return (
                                <React.Fragment key={s.id}>
                                    <ContactItem
                                        icon={Linkedin}
                                        color="#2563EB"
                                        label={s.url?.replace(/^https?:\/\//, '') || s.network}
                                        href={url}
                                    />
                                    {i < arr.length - 1 && <span style={{ color: RULE }}>|</span>}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div style={{ height: 1, background: RULE, marginTop: 8 }} />
                </div>
            )}

            {(data.sectionOrder || ['summary', 'skills', 'experience', 'education']).map(renderSection)}
        </div>
    );
};

export default LayoutBoldRecruit;
