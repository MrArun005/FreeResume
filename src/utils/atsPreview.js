// ATS Preview — render the resume the way an applicant-tracking system
// actually parses it: plain text, no styles, no layout. Greenhouse, Lever,
// Workday, Taleo all run PDF → text extraction and then regex-/ML-tag the
// sections. What you see here is the closest mortal approximation of what
// their bot sees BEFORE its parser fingerprints sections.
//
// Why this matters: most "ATS-friendly" resume tools just promise it. We
// show the user the raw extracted form alongside the rendered version so
// they can audit which fields the bot can actually read. If a section
// header is missing in this view, no recruiter search will surface it.
//
// Renderer is intentionally minimal. Real ATSes have varying parsers, but
// they ALL agree on these conventions:
//   - Name on the first line.
//   - Contact info on a single line, separated by | or ·.
//   - Section headers ALL CAPS or Title Case on their own line.
//   - Each role: title, company, dates on consecutive lines (varies by ATS).
//   - Bullets prefixed with - or • (most strip the symbol entirely).
//   - Skills as a comma-separated list.

function joinContact(personal = {}) {
    const parts = [];
    if (personal.email) parts.push(personal.email);
    if (personal.phone) parts.push(personal.phone);
    if (personal.location) parts.push(personal.location);
    (personal.socials || []).forEach((s) => {
        if (s.url) parts.push(`${s.network || 'Link'}: ${s.url}`);
    });
    return parts.join(' | ');
}

function renderHeader(personal = {}) {
    const name = (personal.fullName || personal.name || '').toUpperCase().trim() || 'YOUR NAME';
    const title = personal.title?.trim();
    const contact = joinContact(personal);
    const lines = [name];
    if (title) lines.push(title);
    if (contact) lines.push(contact);
    return lines.join('\n');
}

function renderSummary(personal = {}) {
    if (!personal.summary?.trim()) return null;
    return ['SUMMARY', personal.summary.trim()].join('\n');
}

function renderExperience(experience = []) {
    if (!experience.length) return null;
    const lines = ['EXPERIENCE'];
    for (const exp of experience) {
        // Headline line varies by ATS preference. Title | Company | Dates is
        // the most universally-parsable order.
        const head = [exp.role, exp.company, exp.date].filter(Boolean).join(' | ');
        if (head) lines.push(head);
        if (exp.location) lines.push(exp.location);
        (exp.bullets || []).forEach((b) => {
            const trimmed = (b || '').trim();
            if (trimmed) lines.push(`- ${trimmed}`);
        });
        lines.push('');
    }
    // Drop trailing blank line.
    while (lines[lines.length - 1] === '') lines.pop();
    return lines.join('\n');
}

function renderEducation(education = []) {
    if (!education.length) return null;
    const lines = ['EDUCATION'];
    for (const edu of education) {
        const head = [edu.degree, edu.school, edu.date].filter(Boolean).join(' | ');
        if (head) lines.push(head);
        if (edu.location) lines.push(edu.location);
        lines.push('');
    }
    while (lines[lines.length - 1] === '') lines.pop();
    return lines.join('\n');
}

function renderSkills(skills = []) {
    if (!skills.length) return null;
    // Skills may be already-bucketed strings ("Languages: JS, TS, Python") or
    // flat tokens. Join them as a single comma-separated list with the
    // bucket prefixes preserved — both forms are ATS-readable.
    return ['SKILLS', skills.join(' • ')].join('\n');
}

function renderCustomSection(section) {
    if (!section?.items?.length) return null;
    const lines = [(section.title || 'Section').toUpperCase()];
    for (const item of section.items) {
        const head = [item.title, item.subtitle, item.date].filter(Boolean).join(' | ');
        if (head) lines.push(head);
        if (item.description) lines.push(item.description.trim());
        lines.push('');
    }
    while (lines[lines.length - 1] === '') lines.pop();
    return lines.join('\n');
}

// Returns the full plain-text rendering with rough red flags for parser
// hostility. Caller can split on '\n\n' to render section-by-section.
export function renderAtsText(resume) {
    if (!resume) return '';
    const sections = [
        renderHeader(resume.personal),
        renderSummary(resume.personal),
        renderExperience(resume.experience),
        renderEducation(resume.education),
        renderSkills(resume.skills),
    ];
    for (const cs of resume.customSections || []) {
        sections.push(renderCustomSection(cs));
    }
    return sections.filter(Boolean).join('\n\n');
}

// Best-effort tenure math. ATS engines parse "Jan 2021 - Present" style strings
// into start/end dates and sum months across roles. We mimic that with a
// regex-and-Date-parse pipeline so the user sees the YoE the bot will compute.
const MONTH_TOKENS = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
};

function parseDatePart(raw) {
    if (!raw) return null;
    const s = raw.trim().toLowerCase();
    if (!s || s === 'present' || s === 'current' || s === 'now') return new Date();
    // "Jan 2021", "January 2021", "01/2021", "2021"
    const monthYear = s.match(/([a-z]+)[ .\-/]*([0-9]{4})/);
    if (monthYear && MONTH_TOKENS[monthYear[1]] !== undefined) {
        return new Date(parseInt(monthYear[2], 10), MONTH_TOKENS[monthYear[1]], 1);
    }
    const numMonthYear = s.match(/(\d{1,2})[ .\-/]+(\d{4})/);
    if (numMonthYear) {
        const m = Math.max(0, Math.min(11, parseInt(numMonthYear[1], 10) - 1));
        return new Date(parseInt(numMonthYear[2], 10), m, 1);
    }
    const yearOnly = s.match(/(\d{4})/);
    if (yearOnly) return new Date(parseInt(yearOnly[1], 10), 0, 1);
    return null;
}

function parseDateRange(dateStr) {
    if (!dateStr) return { start: null, end: null, months: 0 };
    const parts = String(dateStr)
        .split(/[-–—]|to/i)
        .map((p) => p.trim())
        .filter(Boolean);
    const start = parseDatePart(parts[0]);
    const end = parts.length > 1 ? parseDatePart(parts[1]) : start;
    if (!start || !end) return { start, end, months: 0 };
    const months = Math.max(
        0,
        (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    );
    return { start, end, months };
}

function formatYoE(totalMonths) {
    if (!totalMonths) return '0 years';
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (years === 0) return `${months} mo`;
    if (months === 0) return `${years} yr${years === 1 ? '' : 's'}`;
    return `${years} yr${years === 1 ? '' : 's'} ${months} mo`;
}

// Returns the structured field tree that an ATS would store in its database
// after parsing a resume PDF. This is what recruiter searches actually hit —
// not your styled layout, not the raw text dump, but these tagged fields.
export function parseAtsFields(resume) {
    if (!resume) return null;
    const p = resume.personal || {};
    const experience = resume.experience || [];
    const education = resume.education || [];

    const rangedExperience = experience.map((e) => ({
        ...e,
        ...parseDateRange(e.date),
    }));
    const totalMonths = rangedExperience.reduce((sum, e) => sum + (e.months || 0), 0);
    const mostRecent = rangedExperience
        .filter((e) => e.start)
        .sort((a, b) => (b.end?.getTime() || 0) - (a.end?.getTime() || 0))[0];

    return {
        candidate: {
            name: p.fullName?.trim() || p.name?.trim() || null,
            title: p.title?.trim() || null,
            email: p.email?.trim() || null,
            phone: p.phone?.trim() || null,
            location: p.location?.trim() || null,
            links: (p.socials || [])
                .filter((s) => s.url)
                .map((s) => ({ network: s.network || 'Link', url: s.url })),
        },
        derived: {
            totalYoE: formatYoE(totalMonths),
            totalMonths,
            currentTitle: mostRecent?.role || null,
            currentCompany: mostRecent?.company || null,
            roleCount: experience.length,
            educationCount: education.length,
        },
        experience: rangedExperience.map((e) => ({
            title: e.role || null,
            company: e.company || null,
            location: e.location || null,
            rawDate: e.date || null,
            startISO: e.start ? e.start.toISOString().slice(0, 7) : null,
            endISO: e.end ? e.end.toISOString().slice(0, 7) : null,
            months: e.months,
            tenure: formatYoE(e.months || 0),
            bulletCount: (e.bullets || []).length,
        })),
        education: education.map((edu) => ({
            degree: edu.degree || null,
            school: edu.school || null,
            location: edu.location || null,
            date: edu.date || null,
        })),
        skills: resume.skills || [],
    };
}

// Build an alphabetized keyword index — what a recruiter search would actually
// hit. We tokenize from skills + experience bullets + role titles, normalize,
// and dedupe. ATS keyword searches are typically case-insensitive substring or
// stemmed-match against this kind of index.
const KEYWORD_STOPWORDS = new Set([
    'the',
    'and',
    'with',
    'for',
    'from',
    'into',
    'over',
    'that',
    'this',
    'have',
    'has',
    'was',
    'were',
    'are',
    'will',
    'been',
    'being',
    'their',
    'them',
    'they',
    'across',
    'using',
    'used',
    'via',
    'led',
    'team',
    'work',
    'worked',
    'built',
    'shipped',
    'while',
    'than',
    'then',
    'when',
    'which',
    'what',
    'who',
    'how',
    'why',
    'where',
    'about',
    'also',
    'after',
    'before',
    'between',
    'such',
    'each',
    'every',
    'some',
    'most',
    'more',
    'less',
    'first',
    'last',
    'new',
    'old',
    'next',
    'within',
    'without',
    'including',
    'include',
]);

export function buildKeywordIndex(resume) {
    if (!resume) return [];
    const tokens = new Map(); // lower -> { original, count }

    const ingest = (raw) => {
        if (!raw) return;
        // Capture multi-word skill phrases AND single tokens. We treat anything
        // joined by spaces in a skills entry as a phrase; bullet text is split.
        String(raw)
            .split(/[\n,;|•·]+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((phrase) => {
                // Single tokens from inside the phrase
                phrase
                    .replace(/[()[\]{}.!?"]/g, '')
                    .split(/\s+/)
                    .forEach((word) => {
                        const lower = word.toLowerCase();
                        if (lower.length < 2) return;
                        if (KEYWORD_STOPWORDS.has(lower)) return;
                        if (/^\d+%?$/.test(lower)) return;
                        const prev = tokens.get(lower);
                        if (prev) prev.count++;
                        else tokens.set(lower, { original: word, count: 1 });
                    });
            });
    };

    (resume.skills || []).forEach(ingest);
    (resume.experience || []).forEach((e) => {
        ingest(e.role);
        ingest(e.company);
        (e.bullets || []).forEach(ingest);
    });
    (resume.education || []).forEach((edu) => {
        ingest(edu.degree);
        ingest(edu.school);
    });

    return [...tokens.values()].sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.original.toLowerCase().localeCompare(b.original.toLowerCase());
    });
}

// Surface a few signals an ATS parser would flag. Used to render a small
// "what the bot will struggle with" panel alongside the plain-text view.
export function diagnoseAts(resume) {
    const issues = [];
    if (!resume) return issues;
    const p = resume.personal || {};
    if (!p.fullName?.trim()) {
        issues.push({
            severity: 'error',
            text: 'No name set — the parser will leave the candidate field blank.',
        });
    }
    if (!p.email?.trim()) {
        issues.push({ severity: 'error', text: 'No email — most ATSes reject submissions without one.' });
    }
    if (!p.phone?.trim()) {
        issues.push({ severity: 'warn', text: 'No phone — recruiters and ATSes both like having it.' });
    }
    const experienceCount = (resume.experience || []).length;
    if (experienceCount === 0) {
        issues.push({ severity: 'error', text: 'No experience entries — the bot has nothing to score.' });
    } else {
        const missingDates = (resume.experience || []).filter((e) => !e.date?.trim()).length;
        if (missingDates) {
            issues.push({
                severity: 'warn',
                text: `${missingDates} experience entr${missingDates === 1 ? 'y' : 'ies'} missing dates — tenure won't compute.`,
            });
        }
        const missingCompanies = (resume.experience || []).filter((e) => !e.company?.trim()).length;
        if (missingCompanies) {
            issues.push({
                severity: 'warn',
                text: `${missingCompanies} experience entr${missingCompanies === 1 ? 'y' : 'ies'} missing company name.`,
            });
        }
    }
    if (!(resume.skills || []).length) {
        issues.push({
            severity: 'warn',
            text: 'No skills section — keyword matching becomes much harder for the bot.',
        });
    }
    return issues;
}
