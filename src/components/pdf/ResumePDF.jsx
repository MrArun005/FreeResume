import { Page, Text, View, Document, StyleSheet, Link, Font } from '@react-pdf/renderer';

// Register Inter for clean, ATS-friendly typography.
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0pL7.woff2', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1xL7.woff2', fontWeight: 700 },
    ],
});

// ---- shared style helpers -----------------------------------------------

const baseStyles = StyleSheet.create({
    page: {
        padding: 44,
        fontFamily: 'Inter',
        fontSize: 10,
        color: '#0f172a',
        lineHeight: 1.45,
    },
    headerName: { fontSize: 22, fontWeight: 700, letterSpacing: 0.2, marginBottom: 2 },
    headerTitle: { fontSize: 11, color: '#475569', marginBottom: 8, fontWeight: 500 },
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
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1 },
    itemTitle: { fontSize: 10.5, fontWeight: 700, color: '#0f172a' },
    itemSubtitle: { fontSize: 10, color: '#334155', fontWeight: 500, marginBottom: 3 },
    itemMeta: { fontSize: 9, color: '#64748b' },
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
        fontWeight: 600,
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
    const items = [];
    if (personal.email) items.push({ key: 'email', node: <Link key="email" src={`mailto:${personal.email}`} style={baseStyles.link}>{personal.email}</Link> });
    if (personal.phone) items.push({ key: 'phone', node: <Text key="phone">{personal.phone}</Text> });
    if (personal.location) items.push({ key: 'loc', node: <Text key="loc">{personal.location}</Text> });
    (personal.socials || []).forEach((s) => {
        if (s.url) items.push({ key: s.id, node: <Link key={s.id} src={s.url} style={baseStyles.link}>{s.network}</Link> });
    });

    return (
        <View style={baseStyles.contactRow}>
            {items.map((item, i) => (
                <View key={item.key} style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    {item.node}
                    {i < items.length - 1 && <Text style={baseStyles.contactSeparator}>  ·  </Text>}
                </View>
            ))}
        </View>
    );
};

// ---- main document ------------------------------------------------------

const ResumePDF = ({ data, variant = 'standard', includeCoverLetter = false }) => {
    if (!data || !data.personal) return null;

    const isGoogle = variant === 'google';
    const hasCoverLetter = includeCoverLetter && data.coverLetter && (data.coverLetter.title || data.coverLetter.body);

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

export default ResumePDF;
