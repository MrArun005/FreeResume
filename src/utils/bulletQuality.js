// Bullet-quality analyzer. Heuristics that recruiters consistently flag:
//   1. Weak verbs ("worked on", "helped with") — replace with strong action verbs.
//   2. No quantification — bullets without numbers feel vague and unprovable.
//   3. Personal pronouns ("I", "my", "we") — resume convention is to drop them;
//      "I built X" reads as filler vs. "Built X".
//   4. Filler intensifiers ("very", "really", "actually", "basically") — adjective
//      smoke that doesn't make a claim provable.
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

// First-person pronouns. Resume convention is to drop them — the bullet's
// owner is implicit from context. "I built X" vs "Built X" is the
// difference between casual writing and resume voice.
const PRONOUN_REGEX = /\b(I|I'm|I've|I'd|I'll|my|me|we|our|us|we've|we're)\b/i;

// Filler intensifiers — adjective smoke that hides the absence of evidence.
// "Very fast", "really efficient" don't quantify; a number does.
const FILLER_WORDS = new Set([
    'very',
    'really',
    'actually',
    'basically',
    'literally',
    'truly',
    'somewhat',
    'quite',
    'pretty',
    'fairly',
    'rather',
    'just',
    'simply',
]);

const FILLER_REGEX = new RegExp(`\\b(${[...FILLER_WORDS].join('|')})\\b`, 'i');

// Returns { weakVerbs, hasMetric, hasPronoun, hasFiller, isEmpty }.
// weakVerbs is deduped — if the same phrase appears twice we only report once
// (we just want to nudge the user, not pile on).
export function analyzeBullet(text) {
    const empty = {
        weakVerbs: [],
        hasMetric: false,
        hasPronoun: false,
        hasFiller: false,
        isEmpty: true,
    };
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
        hasPronoun: PRONOUN_REGEX.test(text),
        hasFiller: FILLER_REGEX.test(text),
        isEmpty: false,
    };
}

// Analyze a whole experience's bullets together for *cross-bullet* signals.
// Right now: tense drift — present-tense for prior roles is a classic flag.
// We detect by counting past-tense verb endings ("-ed" lemmas) vs. present-
// tense -s endings *in the first word of each bullet* (the action verb).
// Heuristic, not perfect, but catches the common "Built X" mixed with
// "Builds Y" in the same role.
const PAST_TENSE_ENDING = /ed$/i;
const PRESENT_THIRD_PERSON = /s$/i;

const PRESENT_EXCEPTIONS = new Set([
    'lead',
    'led',
    'build',
    'built',
    'ship',
    'shipped',
    'own',
    'owned',
    'run',
    'ran',
    'drive',
    'drove',
]);

export function analyzeExperienceBullets(bullets) {
    if (!Array.isArray(bullets) || bullets.length < 2) {
        return { tenseDrift: false, pastCount: 0, presentCount: 0 };
    }
    let pastCount = 0;
    let presentCount = 0;
    for (const b of bullets) {
        const first = (b || '').trim().split(/\s+/)[0]?.toLowerCase();
        if (!first || PRESENT_EXCEPTIONS.has(first)) continue;
        if (PAST_TENSE_ENDING.test(first)) pastCount++;
        else if (PRESENT_THIRD_PERSON.test(first) && first.length > 3) presentCount++;
    }
    // Drift = significant mix of both. Both >= 1 with neither dominating
    // by more than 4× is suspicious for a single role.
    const tenseDrift = pastCount >= 1 && presentCount >= 1;
    return { tenseDrift, pastCount, presentCount };
}
