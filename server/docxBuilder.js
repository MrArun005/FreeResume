// Resume → DOCX builder.
//
// Two layers here:
//   1. STRUCTURE — real Word styles (Heading 1/2, bullet lists, hanging
//      indent on bullets). ATS scanners and Word both parse this cleanly.
//   2. THEME — colors, fonts, name treatment, section-title rule color, and
//      bullet character pulled from a per-template config so the .docx
//      visually echoes the on-screen template (Bold Recruit reds, Navy
//      Modern navy, Executive Serif Georgia, etc).
//
// We don't try to mirror the HTML layout pixel-for-pixel (DOCX is flow-
// based; no absolute positioning). The goal is "recognizably the same
// template" not "screenshot of the preview".

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

// ── Theme config ─────────────────────────────────────────────────────────
// Keys match the `layout` field on each template definition in
// src/constants/layouts.js. Any unknown id falls through to STANDARD.
const THEMES = {
    standard: {
        accent: '0F172A', // slate-900
        accentRule: 'CBD5E1', // slate-300
        muted: '475569',
        font: 'Calibri',
        bulletChar: '•',
        nameUppercase: true,
        nameCentered: false,
        nameBold: true,
        sectionRule: true,
    },
    google: {
        accent: '1A73E8',
        accentRule: '1A73E8',
        muted: '5F6368',
        font: 'Calibri',
        bulletChar: '•',
        nameUppercase: false,
        nameCentered: false,
        nameBold: true,
        // Google template colors role/school in accent — we mirror by
        // coloring item headers via itemHeaderAccent flag.
        itemHeaderAccent: true,
        sectionRule: false, // Google uses a short underbar rendered as a colored short rule per heading
    },
    'bold-recruit': {
        accent: 'DC2626',
        accentRule: 'CBD5E1',
        muted: '475569',
        font: 'Calibri',
        bulletChar: '–',
        nameUppercase: false,
        nameCentered: false,
        nameBold: true,
        nameAccent: true, // name itself is colored
        sectionRule: true,
    },
    'navy-modern': {
        accent: '0F2C5E',
        accentRule: '0F2C5E',
        muted: '475569',
        font: 'Calibri',
        bulletChar: '▸',
        nameUppercase: true,
        nameCentered: false,
        nameBold: true,
        nameAccent: true,
        itemHeaderAccent: true,
        sectionRule: true,
    },
    'executive-serif': {
        accent: '0F172A',
        accentRule: '0F172A',
        muted: '475569',
        font: 'Georgia',
        bulletChar: '–',
        nameUppercase: true,
        nameCentered: true,
        nameBold: true,
        sectionRule: true,
    },
    'minimal-mono': {
        accent: '0F172A',
        accentRule: 'CBD5E1',
        muted: '475569',
        font: 'Consolas',
        bulletChar: '·',
        nameUppercase: true,
        nameCentered: false,
        nameBold: true,
        sectionRule: false, // mono template is very flat — no rule
    },
};

// Convert resume-CSS pixels into DOCX's half-point unit. DOCX expresses
// font sizes as half-points (a `size: 20` means 10pt). Web px → pt is
// roughly 0.75 (at 96 DPI), so px × 1.5 ≈ DOCX half-points.
const pxToDocxSize = (px) => Math.round(px * 1.5);

// Build a theme bundle for the active template, injecting size knobs
// from the user's typography prefs. The five size slots (name, heading,
// subheading, body, bullet) are what the paragraph builders read; the
// caller never has to know about half-points or px conversion.
//
// Name scales 1.5× the heading so the candidate's name still dominates
// the page even if the user picks a small heading size. Subheading sits
// at 0.85× heading — the role/title strip just below the name.
const resolveTheme = (templateId, typography = {}) => {
    const base = THEMES[templateId] || THEMES.standard;
    const headingPx = typography.headingPx ?? 22;
    const bodyPx = typography.bodyPx ?? 14;
    const bulletPx = typography.bulletPx ?? 13;
    return {
        ...base,
        sizes: {
            name: pxToDocxSize(headingPx * 1.5),
            heading: pxToDocxSize(headingPx),
            subheading: pxToDocxSize(headingPx * 0.85),
            body: pxToDocxSize(bodyPx),
            bullet: pxToDocxSize(bulletPx),
        },
    };
};

// ── Text helpers ─────────────────────────────────────────────────────────
const t = (v) => (v == null ? '' : String(v)).trim();

// Run factory — defaults size + color from theme but accepts overrides.
const run = (text, theme, opts = {}) =>
    new TextRun({
        text: t(text),
        size: opts.size ?? 20,
        color: opts.color ?? '0F172A',
        bold: opts.bold,
        italics: opts.italics,
        font: opts.font ?? theme.font,
    });

// ── Header ───────────────────────────────────────────────────────────────
function buildHeader(personal = {}, theme) {
    const blocks = [];
    const alignment = theme.nameCentered ? AlignmentType.CENTER : AlignmentType.LEFT;
    const nameColor = theme.nameAccent ? theme.accent : '0F172A';

    if (t(personal.fullName)) {
        let nameText = t(personal.fullName);
        if (theme.nameUppercase) nameText = nameText.toUpperCase();
        blocks.push(
            new Paragraph({
                alignment,
                spacing: { after: 60 },
                children: [
                    run(nameText, theme, { size: theme.sizes.name, bold: theme.nameBold, color: nameColor }),
                ],
            })
        );
    }

    if (t(personal.title)) {
        blocks.push(
            new Paragraph({
                alignment,
                spacing: { after: 80 },
                children: [
                    run(personal.title, theme, {
                        size: theme.sizes.subheading,
                        italics: true,
                        color: theme.muted,
                    }),
                ],
            })
        );
    }

    const contactBits = [];
    if (t(personal.email)) contactBits.push(t(personal.email));
    if (t(personal.phone)) contactBits.push(t(personal.phone));
    if (t(personal.location)) contactBits.push(t(personal.location));
    if (t(personal.website)) contactBits.push(t(personal.website));
    if (t(personal.linkedin)) contactBits.push(t(personal.linkedin));
    if (t(personal.github)) contactBits.push(t(personal.github));
    for (const s of personal.socials || []) {
        const label = t(s.url) || t(s.network);
        if (label) contactBits.push(label.replace(/^https?:\/\//, ''));
    }

    if (contactBits.length) {
        blocks.push(
            new Paragraph({
                alignment,
                spacing: { after: 160 },
                border: theme.sectionRule
                    ? { bottom: { color: theme.accentRule, style: BorderStyle.SINGLE, size: 6 } }
                    : undefined,
                children: [
                    run(contactBits.join(' | '), theme, { size: theme.sizes.body, color: theme.muted }),
                ],
            })
        );
    }

    return blocks;
}

// ── Section title ────────────────────────────────────────────────────────
function sectionTitle(text, theme) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
        border: theme.sectionRule
            ? { bottom: { color: theme.accentRule, style: BorderStyle.SINGLE, size: 6 } }
            : undefined,
        children: [
            run(t(text).toUpperCase(), theme, {
                bold: true,
                size: theme.sizes.heading,
                color: theme.accent,
            }),
        ],
    });
}

// ── Body atoms ───────────────────────────────────────────────────────────
function bullet(text, theme) {
    return new Paragraph({
        numbering: { reference: `bullets-${theme.bulletKey}`, level: 0 },
        spacing: { after: 40 },
        children: [run(text, theme, { size: theme.sizes.bullet })],
    });
}

function body(text, theme, opts = {}) {
    return new Paragraph({
        spacing: { after: opts.after ?? 80 },
        children: [run(text, theme, { size: theme.sizes.body, ...opts })],
    });
}

// Item header — bold role/title on the left, italic right-tabbed date on
// the right. itemHeaderAccent themes color the role/title in the accent.
function itemHeaderLine({ left, right, theme }) {
    const children = [];
    for (const part of left) {
        children.push(
            new TextRun({
                text: part.text,
                bold: part.bold,
                italics: part.italics,
                size: theme.sizes.body,
                color: part.bold && theme.itemHeaderAccent ? theme.accent : '0F172A',
                font: theme.font,
            })
        );
    }
    if (right) {
        children.push(new TextRun({ text: '\t', size: theme.sizes.body, font: theme.font }));
        children.push(
            new TextRun({
                text: t(right),
                italics: true,
                size: theme.sizes.body,
                color: theme.muted,
                font: theme.font,
            })
        );
    }
    return new Paragraph({
        spacing: { before: 80, after: 20 },
        tabStops: [{ type: 'right', position: 9000 }],
        children,
    });
}

// ── Section builders ─────────────────────────────────────────────────────
function buildSummary(resume, theme) {
    if (!t(resume.personal?.summary)) return [];
    return [sectionTitle('Summary', theme), body(resume.personal.summary, theme)];
}

function buildExperience(resume, theme) {
    const list = resume.experience || [];
    if (!list.length) return [];
    const blocks = [sectionTitle('Experience', theme)];
    for (const exp of list) {
        const left = [];
        if (t(exp.role)) left.push({ text: t(exp.role), bold: true });
        if (t(exp.company)) left.push({ text: `${left.length ? ', ' : ''}${t(exp.company)}`, bold: false });
        if (t(exp.location)) left.push({ text: ` | ${t(exp.location)}`, italics: true });
        if (left.length) blocks.push(itemHeaderLine({ left, right: exp.date, theme }));
        for (const b of exp.bullets || []) {
            if (t(b)) blocks.push(bullet(b, theme));
        }
    }
    return blocks;
}

function buildEducation(resume, theme) {
    const list = resume.education || [];
    if (!list.length) return [];
    const blocks = [sectionTitle('Education', theme)];
    for (const edu of list) {
        const left = [];
        if (t(edu.degree)) left.push({ text: t(edu.degree), bold: true });
        if (t(edu.school)) left.push({ text: `${left.length ? ' — ' : ''}${t(edu.school)}` });
        if (t(edu.location)) left.push({ text: ` | ${t(edu.location)}`, italics: true });
        if (left.length) blocks.push(itemHeaderLine({ left, right: edu.date, theme }));
        if (t(edu.gpa)) blocks.push(body(`GPA: ${t(edu.gpa)}`, theme, { after: 40 }));
        if (t(edu.coursework))
            blocks.push(body(`Relevant Coursework: ${t(edu.coursework)}`, theme, { after: 40 }));
    }
    return blocks;
}

function buildSkills(resume, theme) {
    const list = resume.skills || [];
    if (!list.length) return [];
    const blocks = [sectionTitle('Skills', theme)];
    for (const s of list) {
        if (typeof s !== 'string' || !s.trim()) continue;
        const idx = s.indexOf(':');
        if (idx > 0) {
            const label = s.slice(0, idx).trim();
            const rest = s.slice(idx + 1).trim();
            blocks.push(
                new Paragraph({
                    spacing: { after: 40 },
                    children: [
                        new TextRun({
                            text: `${label}: `,
                            bold: true,
                            size: theme.sizes.body,
                            color: theme.itemHeaderAccent ? theme.accent : '0F172A',
                            font: theme.font,
                        }),
                        new TextRun({
                            text: rest,
                            size: theme.sizes.body,
                            color: '0F172A',
                            font: theme.font,
                        }),
                    ],
                })
            );
        } else {
            blocks.push(body(s, theme, { after: 40 }));
        }
    }
    return blocks;
}

function buildCustomSection(section, theme) {
    if (!section.items?.length) return [];
    const blocks = [sectionTitle(section.title || 'Section', theme)];
    const isProjects = /project/i.test(section.title || '');
    section.items.forEach((item, idx) => {
        const left = [];
        if (isProjects) left.push({ text: `${idx + 1}. ` });
        if (t(item.title)) left.push({ text: t(item.title), bold: true });
        if (t(item.subtitle)) left.push({ text: ` — ${t(item.subtitle)}` });
        if (left.length) blocks.push(itemHeaderLine({ left, right: item.date, theme }));
        for (const b of item.bullets || []) {
            if (t(b)) blocks.push(bullet(b, theme));
        }
        if (t(item.description) && (!item.bullets || item.bullets.length === 0)) {
            blocks.push(body(item.description, theme, { after: 40 }));
        }
    });
    return blocks;
}

function buildBody(resume, theme) {
    const order = resume.sectionOrder || ['summary', 'experience', 'education', 'skills'];
    const blocks = [];
    const referenced = new Set(order);

    for (const id of order) {
        if (id === 'summary') blocks.push(...buildSummary(resume, theme));
        else if (id === 'experience') blocks.push(...buildExperience(resume, theme));
        else if (id === 'education') blocks.push(...buildEducation(resume, theme));
        else if (id === 'skills') blocks.push(...buildSkills(resume, theme));
        else {
            const sec = (resume.customSections || []).find((s) => s.id === id);
            if (sec) blocks.push(...buildCustomSection(sec, theme));
        }
    }

    // Custom sections that aren't in sectionOrder still get rendered at the end.
    for (const sec of resume.customSections || []) {
        if (!referenced.has(sec.id)) blocks.push(...buildCustomSection(sec, theme));
    }

    // Cover letter is an object ({ title, body, bullets }), not a string —
    // String(obj) is truthy so a naive `t(coverLetter)` guard passes for an
    // empty {}, then .split() crashes. Read the `body` field explicitly.
    const coverBody = t(resume.coverLetter?.body);
    if (coverBody) {
        blocks.push(sectionTitle('Cover Letter', theme));
        for (const para of coverBody.split(/\n+/)) {
            if (t(para)) blocks.push(body(para, theme));
        }
    }

    return [...buildHeader(resume.personal || {}, theme), ...blocks];
}

// ── Public entry point ───────────────────────────────────────────────────
export async function buildResumeDocx(resume, templateId = 'standard', typography = {}) {
    const theme = resolveTheme(templateId, typography);
    // The bullet numbering definition needs a unique reference per theme
    // because Word baked the bullet character into the numbering itself —
    // we can't change it per-paragraph. So we register one numbering def
    // tagged by the theme's chosen char.
    theme.bulletKey = templateId;

    const doc = new Document({
        creator: 'FreeResume',
        title: `${t(resume.personal?.fullName) || 'Resume'} — Resume`,
        styles: {
            default: {
                document: {
                    run: { font: theme.font, size: theme.sizes.body },
                    paragraph: { spacing: { line: 276 } },
                },
            },
        },
        numbering: {
            config: [
                {
                    reference: `bullets-${theme.bulletKey}`,
                    levels: [
                        {
                            level: 0,
                            format: 'bullet',
                            text: theme.bulletChar,
                            alignment: AlignmentType.LEFT,
                            style: {
                                paragraph: { indent: { left: 360, hanging: 200 } },
                                run: { color: theme.accent, font: theme.font },
                            },
                        },
                    ],
                },
            ],
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: { top: 720, bottom: 720, left: 1080, right: 1080 },
                    },
                },
                children: buildBody(resume, theme),
            },
        ],
    });

    return await Packer.toBuffer(doc);
}
