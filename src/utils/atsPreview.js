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
