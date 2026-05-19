// Bullet-quality analyzer. Two heuristics that recruiters consistently flag:
//   1. Weak verbs ("worked on", "helped with") — replace with strong action verbs.
//   2. No quantification — bullets without numbers feel vague and unprovable.
//
// Local-only: no AI call, no network. Runs on every keystroke; designed to be
// cheap enough that the cost doesn't show up in input latency.

// Map of weak verb phrase → suggested strong alternatives. Lowercase keys,
// matched with a word-boundary regex. Phrases longer than one word are
// matched first so "worked on" wins over a bare "worked".
const WEAK_VERB_SUGGESTIONS = {
    'responsible for': ['Led', 'Owned', 'Drove'],
    'duties included': ['Led', 'Owned', 'Delivered'],
    'in charge of': ['Led', 'Owned', 'Directed'],
    'worked on': ['Built', 'Shipped', 'Engineered'],
    'helped with': ['Drove', 'Accelerated', 'Co-led'],
    'helped to': ['Drove', 'Accelerated', 'Co-led'],
    'assisted with': ['Co-led', 'Partnered on', 'Drove'],
    'involved in': ['Led', 'Drove', 'Shipped'],
    'participated in': ['Led', 'Drove', 'Contributed to'],
    'collaborated on': ['Co-led', 'Partnered on', 'Drove'],
    'tasked with': ['Led', 'Owned', 'Drove'],
    'worked with': ['Partnered with', 'Collaborated with', 'Led with'],
    did: ['Executed', 'Delivered', 'Shipped'],
    made: ['Built', 'Engineered', 'Crafted'],
    used: ['Leveraged', 'Applied', 'Deployed'],
    helped: ['Drove', 'Enabled', 'Accelerated'],
    assisted: ['Co-led', 'Drove', 'Partnered on'],
    handled: ['Owned', 'Managed', 'Directed'],
};

// Order phrases by length DESC so multi-word phrases match before single words.
const PHRASES_BY_LENGTH = Object.keys(WEAK_VERB_SUGGESTIONS).sort((a, b) => b.length - a.length);

// Matches numbers, percentages, currency, time periods, multipliers.
// 5, 5%, 5x, $5, $5k, $5M, 5 hours, 5 days, 5 weeks, 5 months, 5 years, 1k, 1M
const METRIC_REGEX =
    /\b(?:\$\s?[\d,]+(?:\.\d+)?\s?[kmb]?|\d+(?:\.\d+)?\s?[%x]|\d+(?:\.\d+)?\s?(?:hours?|hrs?|days?|weeks?|months?|years?|yrs?|mins?|seconds?|secs?|min)|\d+(?:\.\d+)?\s?[kmb]\b|\b\d+(?:,\d{3})*(?:\.\d+)?\b)/i;

// Returns { weakVerbs: [{ phrase, suggestions }], hasMetric: boolean }.
// weakVerbs is deduped — if the same phrase appears twice we only report once
// (we just want to nudge the user, not pile on).
export function analyzeBullet(text) {
    const empty = { weakVerbs: [], hasMetric: false, isEmpty: true };
    if (!text || !text.trim()) return empty;

    const lower = text.toLowerCase();
    const seen = new Set();
    const weakVerbs = [];

    for (const phrase of PHRASES_BY_LENGTH) {
        if (seen.has(phrase)) continue;
        // Word boundary on both sides so "worked" doesn't match "networked".
        const re = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'i');
        if (re.test(lower)) {
            weakVerbs.push({
                phrase,
                suggestions: WEAK_VERB_SUGGESTIONS[phrase],
            });
            seen.add(phrase);
        }
    }

    return {
        weakVerbs,
        hasMetric: METRIC_REGEX.test(text),
        isEmpty: false,
    };
}
