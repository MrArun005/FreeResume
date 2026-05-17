import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';

// Use the PDF-standard Helvetica family — no network fetch, no font registration to fail.
// Renders identically across all viewers and ATS parsers.
//
// `safeText` decomposes Unicode ligatures (ﬀ, ﬁ, ﬂ, ﬃ, ﬄ) and other characters
// that aren't in Helvetica's glyph table — without this, words like "efficiency"
// render as "e ciency" because the ﬃ codepoint draws as the .notdef box.
// Also strips zero-width and non-printable characters that sometimes get pasted
// into contact fields from messaging apps.
const safeText = (input) => {
    if (input == null) return '';
    return String(input)
        .replace(/ﬀ/g, 'ff')
        .replace(/ﬁ/g, 'fi')
        .replace(/ﬂ/g, 'fl')
        .replace(/ﬃ/g, 'ffi')
        .replace(/ﬄ/g, 'ffl')
        // Strip zero-width, BOM, and bidi marks (pasted from chat apps)
        .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
        // Convert non-breaking space (U+00A0) to regular space
        .replace(/\u00A0/g, ' ')
        .trim();
};

// ---- shared style helpers -----------------------------------------------

const baseStyles = StyleSheet.create({
    page: {
        padding: 44,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#0f172a',
        lineHeight: 1.45,
    },
    headerName: { fontSize: 22, fontWeight: 700, letterSpacing: 0.2, marginBottom: 2 },
    headerTitle: { fontSize: 11, color: '#475569', marginBottom: 8 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 3, fontSize: 9, color: '#475569' },
    contactSeparator: { color: '#cbd5e1' },

    section: { marginTop: 14 },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        color: '#0f172a',
        borderBottomWidth: 0.75,
        borderBottomColor: '#cbd5e1',
        paddingBottom: 3,
        marginBottom: 8,
    },

    item: { marginBottom: 10 },
    // Flex constraints prevent role title from running into the date column.
    // - itemTitle takes remaining space and wraps; gets right-padding so it
    //   never butts up against the meta column.
    // - itemMeta never shrinks and aligns to the right.
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 },
    itemTitle: { fontSize: 10.5, fontWeight: 700, color: '#0f172a', flex: 1, paddingRight: 8 },
    itemSubtitle: { fontSize: 10, color: '#334155', marginBottom: 3 },
    itemMeta: { fontSize: 9, color: '#64748b', flexShrink: 0, textAlign: 'right' },
    bodyText: { fontSize: 10, color: '#1e293b', lineHeight: 1.55 },

    bulletRow: { flexDirection: 'row', marginBottom: 2 },
    bulletDot: { width: 10, fontSize: 10, color: '#475569' },
    bulletText: { flex: 1, fontSize: 10, color: '#1e293b', lineHeight: 1.5 },

    skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    skillChip: {
        fontSize: 9,
        paddingTop: 2,
        paddingBottom: 2,
        paddingHorizontal: 6,
        backgroundColor: '#f1f5f9',
        color: '#0f172a',
        borderRadius: 3,
    },

    link: { color: '#0f766e', textDecoration: 'none' },
});

// ---- Google-style variant (subtle brand accents) ------------------------

const googleStyles = StyleSheet.create({
    headerName: { fontSize: 24, fontWeight: 700, color: '#202124', marginBottom: 1 },
    headerTitle: { fontSize: 11, color: '#5f6368', marginBottom: 10 },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.4,
        color: '#202124',
        textTransform: 'none',
        borderBottomWidth: 0,
        marginBottom: 2,
    },
    sectionRule: {
        height: 0.75,
        backgroundColor: '#4285F4',
        width: 24,
        marginBottom: 8,
    },
    accent: { color: '#1a73e8' },
});

// ---- Bold Recruit variant (red accent, recruiter-scan optimized) -----------

const BOLD_RED = '#DC2626';
const boldRecruitStyles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#0F172A',
        lineHeight: 1.45,
    },
    headerName: { fontSize: 26, fontWeight: 700, color: BOLD_RED, marginBottom: 4 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', fontSize: 9.5, color: '#0F172A', marginBottom: 6 },
    headerRule: { height: 1, backgroundColor: '#CBD5E1', marginBottom: 4 },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        color: BOLD_RED,
        marginTop: 10,
        marginBottom: 2,
    },
    sectionRule: { height: 0.75, backgroundColor: '#CBD5E1', marginBottom: 6 },
    itemRoleLine: { fontSize: 10.5, color: '#0F172A' },
    bulletRow: { flexDirection: 'row', marginBottom: 1, marginLeft: 8 },
    bulletDash: { width: 8, fontSize: 10, color: '#0F172A' },
});

// ---- helpers ------------------------------------------------------------

const renderBullets = (bullets) => (
    <View>
        {bullets.map((b, i) => (
            <View key={i} style={baseStyles.bulletRow} wrap={false}>
                <Text style={baseStyles.bulletDot}>•</Text>
                <Text style={baseStyles.bulletText}>{b}</Text>
            </View>
        ))}
    </View>
);

const ContactRow = ({ personal }) => {
    // Build a flat list of nodes so flexWrap can break naturally between
    // entries without leaving a bullet separator stranded at the start of a
    // wrapped line. Each entry is rendered as a single non-wrapping flex group.
    const items = [];
    if (personal.email) items.push({ key: 'email', node: <Link src={`mailto:${personal.email}`} style={baseStyles.link}>{personal.email}</Link> });
    if (personal.phone) items.push({ key: 'phone', node: <Text>{personal.phone}</Text> });
    if (personal.location) items.push({ key: 'loc', node: <Text>{personal.location}</Text> });
    (personal.socials || []).forEach((s) => {
        if (s.url) items.push({ key: s.id, node: <Link src={s.url} style={baseStyles.link}>{s.network}</Link> });
    });

    return (
        <View style={baseStyles.contactRow}>
            {items.map((item, i) => (
                <View
                    key={item.key}
                    style={{ flexDirection: 'row', alignItems: 'baseline', marginRight: i < items.length - 1 ? 8 : 0 }}
                    wrap={false}
                >
                    {item.node}
                    {i < items.length - 1 && <Text style={[baseStyles.contactSeparator, { marginLeft: 8 }]}>·</Text>}
                </View>
            ))}
        </View>
    );
};

// ---- main document ------------------------------------------------------

const ResumePDF = ({ data, variant = 'standard', includeCoverLetter = false }) => {
    if (!data || !data.personal) return null;

    const isGoogle = variant === 'google';
    const isBoldRecruit = variant === 'bold-recruit';
    const hasCoverLetter = includeCoverLetter && data.coverLetter && (data.coverLetter.title || data.coverLetter.body);

    // Bold Recruit gets its own document path — header style, section titles,
    // bullet glyph, and contact row are all visually different enough that
    // branching inside the standard renderers would be uglier than a separate
    // page builder.
    if (isBoldRecruit) {
        return <BoldRecruitDocument data={data} />;
    }

    const SectionTitle = ({ children }) => (
        isGoogle ? (
            <View>
                <Text style={googleStyles.sectionTitle}>{children}</Text>
                <View style={googleStyles.sectionRule} />
            </View>
        ) : (
            <Text style={baseStyles.sectionTitle}>{children}</Text>
        )
    );

    const renderSection = (sectionId) => {
        if (sectionId === 'summary' && data.personal.summary) {
            return (
                <View key="summary" style={baseStyles.section} wrap={false}>
                    <SectionTitle>Summary</SectionTitle>
                    <Text style={baseStyles.bodyText}>{data.personal.summary}</Text>
                </View>
            );
        }

        if (sectionId === 'experience' && data.experience?.length > 0) {
            return (
                <View key="experience" style={baseStyles.section}>
                    <SectionTitle>Experience</SectionTitle>
                    {data.experience.map((exp) => (
                        <View key={exp.id} style={baseStyles.item} wrap={false}>
                            <View style={baseStyles.itemHeader}>
                                <Text style={[baseStyles.itemTitle, isGoogle && googleStyles.accent]}>{exp.role || 'Role'}</Text>
                                <Text style={baseStyles.itemMeta}>{exp.date}</Text>
                            </View>
                            <Text style={baseStyles.itemSubtitle}>
                                {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                            </Text>
                            {exp.bullets?.length > 0 ? renderBullets(exp.bullets) : (exp.description && <Text style={baseStyles.bodyText}>{exp.description}</Text>)}
                        </View>
                    ))}
                </View>
            );
        }

        if (sectionId === 'education' && data.education?.length > 0) {
            return (
                <View key="education" style={baseStyles.section}>
                    <SectionTitle>Education</SectionTitle>
                    {data.education.map((edu) => (
                        <View key={edu.id} style={baseStyles.item} wrap={false}>
                            <View style={baseStyles.itemHeader}>
                                <Text style={[baseStyles.itemTitle, isGoogle && googleStyles.accent]}>{edu.school || 'School'}</Text>
                                <Text style={baseStyles.itemMeta}>{edu.date}</Text>
                            </View>
                            <Text style={baseStyles.itemSubtitle}>{edu.degree}{edu.location ? ` · ${edu.location}` : ''}</Text>
                        </View>
                    ))}
                </View>
            );
        }

        if (sectionId === 'skills' && data.skills?.length > 0) {
            return (
                <View key="skills" style={baseStyles.section} wrap={false}>
                    <SectionTitle>Skills</SectionTitle>
                    <View style={baseStyles.skillsContainer}>
                        {data.skills.map((s, i) => (
                            <Text key={i} style={baseStyles.skillChip}>{s}</Text>
                        ))}
                    </View>
                </View>
            );
        }

        const customSection = (data.customSections || []).find((s) => s.id === sectionId);
        if (customSection && customSection.items?.length > 0) {
            return (
                <View key={customSection.id} style={baseStyles.section}>
                    <SectionTitle>{customSection.title}</SectionTitle>
                    {customSection.items.map((item) => (
                        <View key={item.id} style={baseStyles.item} wrap={false}>
                            <View style={baseStyles.itemHeader}>
                                <Text style={[baseStyles.itemTitle, isGoogle && googleStyles.accent]}>{item.title}</Text>
                                {item.date && <Text style={baseStyles.itemMeta}>{item.date}</Text>}
                            </View>
                            {item.subtitle && <Text style={baseStyles.itemSubtitle}>{item.subtitle}</Text>}
                            {item.bullets?.length > 0
                                ? renderBullets(item.bullets)
                                : (item.description && <Text style={baseStyles.bodyText}>{item.description}</Text>)
                            }
                        </View>
                    ))}
                </View>
            );
        }

        return null;
    };

    return (
        <Document title={`${data.personal.fullName || 'Resume'} — Resume`} author={data.personal.fullName}>
            {hasCoverLetter && (
                <Page size="A4" style={baseStyles.page}>
                    <Text style={baseStyles.headerName}>{data.personal.fullName || 'Your Name'}</Text>
                    {data.personal.title && <Text style={baseStyles.headerTitle}>{data.personal.title}</Text>}
                    <ContactRow personal={data.personal} />
                    <View style={{ marginTop: 20 }}>
                        {data.coverLetter.title && (
                            <Text style={[baseStyles.headerName, { fontSize: 14, textAlign: 'center', marginBottom: 14 }]}>{data.coverLetter.title}</Text>
                        )}
                        {data.coverLetter.body && <Text style={baseStyles.bodyText}>{data.coverLetter.body}</Text>}
                        {data.coverLetter.bullets?.length > 0 && (
                            <View style={{ marginTop: 10 }}>{renderBullets(data.coverLetter.bullets)}</View>
                        )}
                        <Text style={[baseStyles.bodyText, { marginTop: 24 }]}>Sincerely,</Text>
                        <Text style={[baseStyles.itemTitle, { marginTop: 4 }]}>{data.personal.fullName}</Text>
                    </View>
                </Page>
            )}

            <Page size="A4" style={baseStyles.page}>
                {/* Header */}
                {isGoogle ? (
                    <View style={{ marginBottom: 14 }}>
                        <Text style={googleStyles.headerName}>{data.personal.fullName || 'Your Name'}</Text>
                        {data.personal.title && <Text style={googleStyles.headerTitle}>{data.personal.title}</Text>}
                        <ContactRow personal={data.personal} />
                    </View>
                ) : (
                    <View style={{ marginBottom: 14 }}>
                        <Text style={baseStyles.headerName}>{data.personal.fullName || 'Your Name'}</Text>
                        {data.personal.title && <Text style={baseStyles.headerTitle}>{data.personal.title}</Text>}
                        <ContactRow personal={data.personal} />
                    </View>
                )}

                {(data.sectionOrder || ['summary', 'experience', 'education', 'skills']).map(renderSection)}
            </Page>
        </Document>
    );
};

// ---- Bold Recruit document --------------------------------------------------

const renderBoldBullets = (bullets) => (
    <View>
        {bullets.map((b, i) => (
            <View key={i} style={boldRecruitStyles.bulletRow} wrap={false}>
                <Text style={boldRecruitStyles.bulletDash}>–</Text>
                <Text style={{ flex: 1, fontSize: 10, color: '#0F172A', lineHeight: 1.5 }}>{safeText(b)}</Text>
            </View>
        ))}
    </View>
);

const BoldRecruitContactRow = ({ personal }) => {
    const items = [];
    const phone = safeText(personal.phone);
    const email = safeText(personal.email);
    const location = safeText(personal.location);
    if (phone) items.push(<Text key="p">{phone}</Text>);
    if (email) items.push(<Link key="e" src={`mailto:${email}`} style={{ color: '#0F172A', textDecoration: 'none' }}>{email}</Link>);
    if (location) items.push(<Text key="l">{location}</Text>);
    (personal.socials || []).forEach((s) => {
        const url = safeText(s.url);
        if (url) {
            const label = url.replace(/^https?:\/\//, '');
            items.push(<Link key={s.id} src={url.startsWith('http') ? url : `https://${url}`} style={{ color: '#0F172A', textDecoration: 'none' }}>{label}</Link>);
        }
    });

    return (
        <View style={boldRecruitStyles.contactRow}>
            {items.map((node, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }} wrap={false}>
                    {node}
                    {i < items.length - 1 && (
                        <Text style={{ marginHorizontal: 6, color: '#CBD5E1' }}>|</Text>
                    )}
                </View>
            ))}
        </View>
    );
};

const BoldRecruitSectionTitle = ({ children }) => (
    <View>
        <Text style={boldRecruitStyles.sectionTitle}>{safeText(children)}</Text>
        <View style={boldRecruitStyles.sectionRule} />
    </View>
);

const BoldRecruitDocument = ({ data }) => {
    const renderSection = (sectionId) => {
        if (sectionId === 'summary' && data.personal.summary) {
            return (
                <View key="summary" wrap={false}>
                    <BoldRecruitSectionTitle>Summary</BoldRecruitSectionTitle>
                    <Text style={{ fontSize: 10, color: '#0F172A', lineHeight: 1.5 }}>{safeText(data.personal.summary)}</Text>
                </View>
            );
        }

        if (sectionId === 'skills' && data.skills?.length > 0) {
            return (
                <View key="skills" wrap={false}>
                    <BoldRecruitSectionTitle>Skills</BoldRecruitSectionTitle>
                    {data.skills.map((skill, i) => {
                        const colonIdx = typeof skill === 'string' ? skill.indexOf(':') : -1;
                        return (
                            <View key={i} style={boldRecruitStyles.bulletRow} wrap={false}>
                                <Text style={boldRecruitStyles.bulletDash}>–</Text>
                                <Text style={{ flex: 1, fontSize: 10, color: '#0F172A', lineHeight: 1.45 }}>
                                    {colonIdx > 0 ? (
                                        <>
                                            <Text style={{ fontWeight: 700 }}>{safeText(skill.slice(0, colonIdx))}:</Text>
                                            <Text> {safeText(skill.slice(colonIdx + 1))}</Text>
                                        </>
                                    ) : (
                                        safeText(skill)
                                    )}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            );
        }

        if (sectionId === 'experience' && data.experience?.length > 0) {
            return (
                <View key="experience">
                    <BoldRecruitSectionTitle>Experience</BoldRecruitSectionTitle>
                    {data.experience.map((exp) => (
                        <View key={exp.id} style={{ marginBottom: 6 }} wrap={false}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Text style={[boldRecruitStyles.itemRoleLine, { flex: 1, paddingRight: 8 }]}>
                                    <Text style={{ fontWeight: 700 }}>{safeText(exp.role) || 'Role'}</Text>
                                    {exp.company ? <Text>, {safeText(exp.company)}</Text> : null}
                                    {exp.location ? <Text> | {safeText(exp.location)}</Text> : null}
                                </Text>
                                {exp.date && <Text style={{ fontSize: 9.5, color: '#475569', flexShrink: 0 }}>{safeText(exp.date)}</Text>}
                            </View>
                            {exp.bullets?.length > 0 && renderBoldBullets(exp.bullets)}
                        </View>
                    ))}
                </View>
            );
        }

        if (sectionId === 'education' && data.education?.length > 0) {
            return (
                <View key="education">
                    <BoldRecruitSectionTitle>Education</BoldRecruitSectionTitle>
                    {data.education.map((edu) => (
                        <View key={edu.id} style={{ marginBottom: 4 }} wrap={false}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Text style={[boldRecruitStyles.itemRoleLine, { flex: 1, paddingRight: 8 }]}>
                                    {edu.degree && <Text style={{ fontWeight: 600 }}>{safeText(edu.degree)}</Text>}
                                    {edu.school && <Text> - {safeText(edu.school)}</Text>}
                                    {edu.date && <Text> | {safeText(edu.date)}</Text>}
                                </Text>
                                {edu.gpa && <Text style={{ fontSize: 10, color: '#0F172A', flexShrink: 0 }}>GPA: {safeText(edu.gpa)}</Text>}
                            </View>
                            {edu.coursework && (
                                <Text style={{ fontSize: 10, color: '#0F172A', marginTop: 1 }}>
                                    <Text style={{ fontWeight: 600 }}>Relevant Coursework:</Text> {safeText(edu.coursework)}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            );
        }

        const customSection = (data.customSections || []).find((s) => s.id === sectionId);
        if (customSection && customSection.items?.length > 0) {
            const isProjects = /project/i.test(customSection.title);
            return (
                <View key={customSection.id}>
                    <BoldRecruitSectionTitle>{customSection.title}</BoldRecruitSectionTitle>
                    {customSection.items.map((item, idx) => (
                        <View key={item.id} style={{ marginBottom: 6 }} wrap={false}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Text style={[boldRecruitStyles.itemRoleLine, { flex: 1, paddingRight: 8 }]}>
                                    {isProjects && <Text style={{ fontWeight: 700 }}>{idx + 1}. </Text>}
                                    {item.title && <Text style={{ fontWeight: 700 }}>{safeText(item.title)}</Text>}
                                    {item.subtitle && <Text> - {safeText(item.subtitle)}</Text>}
                                </Text>
                                {item.date && <Text style={{ fontSize: 9.5, color: '#475569', flexShrink: 0 }}>{safeText(item.date)}</Text>}
                            </View>
                            {item.bullets?.length > 0
                                ? renderBoldBullets(item.bullets)
                                : (item.description && <Text style={{ fontSize: 10, color: '#0F172A', marginTop: 1 }}>{safeText(item.description)}</Text>)
                            }
                        </View>
                    ))}
                </View>
            );
        }

        return null;
    };

    return (
        <Document title={`${safeText(data.personal.fullName) || 'Resume'} — Resume`} author={safeText(data.personal.fullName)}>
            <Page size="A4" style={boldRecruitStyles.page}>
                <Text style={boldRecruitStyles.headerName}>{safeText(data.personal.fullName) || 'Your Name'}</Text>
                <BoldRecruitContactRow personal={data.personal} />
                <View style={boldRecruitStyles.headerRule} />
                {(data.sectionOrder || ['summary', 'skills', 'experience', 'education']).map(renderSection)}
            </Page>
        </Document>
    );
};

export default ResumePDF;
