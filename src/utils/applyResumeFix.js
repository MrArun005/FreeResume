import { forceCategorize, categorizeSkill } from './skillTaxonomy';

// Walk a dot/bracket-style path into a nested object/array and return the
// parent + last key so the caller can write to it. Supports `personal.summary`
// and `experience.0.bullets.2`.
function locateParent(root, path) {
    if (!path) return null;
    const parts = path.split('.').filter(Boolean);
    if (parts.length === 0) return null;
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
        const key = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i];
        if (cur == null) return null;
        cur = cur[key];
    }
    const lastRaw = parts[parts.length - 1];
    const lastKey = /^\d+$/.test(lastRaw) ? Number(lastRaw) : lastRaw;
    return { parent: cur, key: lastKey };
}

// Deep-clone via JSON. The resume is plain JSON-serializable data so this is
// safe and avoids accidental shared references after a mutation.
const clone = (x) => JSON.parse(JSON.stringify(x));

// Take a comma-separated keyword string and merge each keyword into the
// resume's category-structured skills list, using the taxonomy to route. If
// a category doesn't exist yet, it's appended at the end.
function mergeKeywordsIntoSkills(skills, keywordsCsv) {
    const keywords = (keywordsCsv || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    if (keywords.length === 0) return skills;

    const next = Array.isArray(skills) ? [...skills] : [];

    const lcEq = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();
    const findCategoryIdx = (label) =>
        next.findIndex((s) => typeof s === 'string' && s.includes(':') && lcEq(s.split(':')[0], label));

    for (const kw of keywords) {
        const category = categorizeSkill(kw) || 'Other';
        const idx = findCategoryIdx(category);
        if (idx >= 0) {
            const [labelPart, rest] = next[idx].split(/:(.+)/);
            const existing = (rest || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            if (!existing.some((e) => lcEq(e, kw))) existing.push(kw);
            next[idx] = `${labelPart}: ${existing.join(', ')}`;
        } else {
            next.push(`${category}: ${kw}`);
        }
    }
    return next;
}

// Apply a single fix descriptor returned by the AI to a resume object. Pure:
// returns a new resume. Unknown / no-op fix types return the input unchanged.
//
// Supported fix shapes:
//   { type: 'replace-text', target: 'personal.summary', value: '...' }
//   { type: 'append-bullet', target: 'experience.0.bullets', value: '...' }
//   { type: 'add-keywords', target: 'skills', value: 'AWS, Docker, Kubernetes' }
//   { type: 'normalize-skills', target: 'skills' }   // re-bucket using taxonomy
//   { type: 'add-section', target: 'sectionOrder', value: 'projects' }
//   { type: 'none' }                                  // nothing to do
export function applyResumeFix(resume, fix) {
    if (!resume || !fix || !fix.type || fix.type === 'none') return resume;
    const next = clone(resume);

    switch (fix.type) {
        case 'replace-text': {
            const loc = locateParent(next, fix.target);
            if (!loc || loc.parent == null) return resume;
            loc.parent[loc.key] = fix.value ?? '';
            return next;
        }
        case 'append-bullet': {
            const loc = locateParent(next, fix.target);
            if (!loc || !Array.isArray(loc.parent?.[loc.key])) return resume;
            if (typeof fix.value === 'string' && fix.value.trim()) {
                loc.parent[loc.key].push(fix.value.trim());
            }
            return next;
        }
        case 'add-keywords': {
            next.skills = mergeKeywordsIntoSkills(next.skills || [], fix.value || '');
            return next;
        }
        case 'normalize-skills': {
            next.skills = forceCategorize(next.skills || []);
            return next;
        }
        case 'add-section': {
            const id = (fix.value || '').trim();
            if (!id) return resume;
            if (!Array.isArray(next.sectionOrder)) next.sectionOrder = [];
            if (!next.sectionOrder.includes(id)) next.sectionOrder.push(id);
            return next;
        }
        default:
            return resume;
    }
}

// Quick check the modal can call to decide whether to render an Apply button.
export function isApplicableFix(fix) {
    if (!fix || !fix.type || fix.type === 'none') return false;
    return ['replace-text', 'append-bullet', 'add-keywords', 'normalize-skills', 'add-section'].includes(
        fix.type
    );
}
