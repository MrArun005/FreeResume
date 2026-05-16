```javascript
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: '15mm',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    pageContainer: {
        border: '2pt solid #E5E7EB',
        padding: '15mm',
        height: '100%',
    },
    header: {
        textAlign: 'center',
        borderBottom: '2px solid #E5E7EB',
        paddingBottom: 24,
        marginBottom: 24,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1F2937',
    },
    title: {
        fontSize: 16,
        marginBottom: 16,
        color: '#6B7280',
    },
    contactInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        fontSize: 11,
        color: '#6B7280',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 12,
        paddingBottom: 4,
        borderBottom: '2px solid #3B82F6',
        color: '#3B82F6',
    },
    summaryText: {
        fontSize: 11,
        lineHeight: 1.6,
        color: '#374151',
    },
    experienceItem: {
        marginBottom: 16,
    },
    experienceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    role: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    date: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: 'medium',
    },
    company: {
        fontSize: 11,
        fontStyle: 'italic',
        color: '#3B82F6',
        marginBottom: 4,
    },
    description: {
        fontSize: 10,
        lineHeight: 1.5,
        color: '#4B5563',
    },
    bottomRow: {
        flexDirection: 'row',
        gap: 32,
    },
    column: {
        flex: 1,
    },
    educationItem: {
        marginBottom: 12,
    },
    school: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    degree: {
        fontSize: 10,
        color: '#374151',
    },
    eduDate: {
        fontSize: 10,
        color: '#6B7280',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillTag: {
        fontSize: 9,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontWeight: 'medium',
    },
});

const PdfClassic = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.pageContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{data.personal.fullName}</Text>
                    <Text style={styles.title}>{data.personal.title}</Text>
                    <View style={styles.contactInfo}>
                        {data.personal.email && <Text>{data.personal.email}</Text>}
                        {data.personal.phone && <Text>| {data.personal.phone}</Text>}
                        {data.personal.location && <Text>| {data.personal.location}</Text>}
                    </View>
                </View>

                {/* Professional Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Summary</Text>
                    <Text style={styles.summaryText}>{data.personal.summary}</Text>
                </View>

                {/* Experience */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    {data.experience.map((exp, index) => (
                        <View key={exp.id || index} style={styles.experienceItem} wrap={false}>
                            <View style={styles.experienceHeader}>
                                <Text style={styles.role}>{exp.role}</Text>
                                <Text style={styles.date}>{exp.date}</Text>
                            </View>
                            <Text style={styles.company}>{exp.company}</Text>
                            {exp.bullets && exp.bullets.length > 0 ? (
                                <View style={{ marginLeft: 8 }}>
                                    {exp.bullets.map((bullet, i) => (
                                        <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                            <Text style={{ fontSize: 10, marginRight: 4 }}>•</Text>
                                            <Text style={styles.description}>{bullet}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.description}>{exp.description}</Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* Education & Skills */}
                <View style={styles.bottomRow}>
                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {data.education.map((edu, index) => (
                            <View key={edu.id || index} style={styles.educationItem} wrap={false}>
                                <Text style={styles.school}>{edu.school}</Text>
                                <Text style={styles.degree}>{edu.degree}</Text>
                                <Text style={styles.eduDate}>{edu.date}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsContainer}>
                            {data.skills.map((skill, index) => (
                                <Text key={index} style={styles.skillTag}>
                                    {skill}
                                </Text>
                            ))}
                        </View>
                    </View>
                </View>
            </View>
        </Page>
    </Document>
);

export default PdfClassic;
```
