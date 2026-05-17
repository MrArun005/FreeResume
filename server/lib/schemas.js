// Response schemas for Gemini JSON mode.
//
// Passing `responseMimeType: 'application/json'` + `responseSchema` to the
// model constrains output to a guaranteed-valid JSON document matching the
// shape below. Eliminates the failure mode where Gemini wraps JSON in prose
// or markdown fences. We keep `extractJson` (server/lib/utils.js) as a
// defensive fallback.
//
// Schemas are limited to OBJECT, ARRAY, STRING, NUMBER, BOOLEAN — no enums,
// no oneOf. Per Gemini SDK 0.24 / API v1beta.

import { SchemaType } from '@google/generative-ai';

// Every issue / improvement carries a `fix` descriptor that the client can
// apply with one click. Fix shapes are intentionally tiny so Gemini
// produces them reliably: { type, target, value }. The client knows how to
// interpret each type — see src/utils/applyResumeFix.js.
export const FIX_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        type: { type: SchemaType.STRING }, // replace-text | append-bullet | add-keywords | normalize-skills | add-section | none
        target: { type: SchemaType.STRING }, // dot path e.g. personal.summary, experience.0.bullets.2
        value: { type: SchemaType.STRING }, // new text, csv keywords, or '' for normalize-skills
    },
    required: ['type', 'target', 'value'],
};

export const SCHEMA_ANALYZE = {
    type: SchemaType.OBJECT,
    properties: {
        score: { type: SchemaType.NUMBER },
        summary: { type: SchemaType.STRING },
        criticalIssues: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    id: { type: SchemaType.STRING },
                    text: { type: SchemaType.STRING },
                    section: { type: SchemaType.STRING },
                    fix: FIX_SCHEMA,
                },
                required: ['id', 'text', 'fix'],
            },
        },
        improvements: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    id: { type: SchemaType.STRING },
                    text: { type: SchemaType.STRING },
                    section: { type: SchemaType.STRING },
                    fix: FIX_SCHEMA,
                },
                required: ['id', 'text', 'fix'],
            },
        },
        keywordsFound: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        missingKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    },
    required: ['score', 'summary', 'criticalIssues', 'improvements', 'keywordsFound', 'missingKeywords'],
};

export const SCHEMA_MATCH = {
    type: SchemaType.OBJECT,
    properties: {
        score: { type: SchemaType.NUMBER },
        matchSummary: { type: SchemaType.STRING },
        missingKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        tailoringAdvice: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    },
    required: ['score', 'matchSummary', 'missingKeywords', 'tailoringAdvice'],
};

export const SCHEMA_ROAST = {
    type: SchemaType.OBJECT,
    properties: {
        score: { type: SchemaType.NUMBER },
        oneLiner: { type: SchemaType.STRING },
        roast: { type: SchemaType.STRING },
        // burns are plain strings — jokes/jabs, no fix needed.
        burns: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        // Each red flag is an actionable issue. Same fix shape as analyze.
        redFlags: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    text: { type: SchemaType.STRING },
                    fix: FIX_SCHEMA,
                },
                required: ['text', 'fix'],
            },
        },
    },
    required: ['score', 'oneLiner', 'roast', 'burns', 'redFlags'],
};

// Resume-parse schema — strict enough to give the parser a target, loose
// enough that real-world resumes (some without phone, some without socials)
// still validate.
export const SCHEMA_PARSED_RESUME = {
    type: SchemaType.OBJECT,
    properties: {
        personal: {
            type: SchemaType.OBJECT,
            properties: {
                fullName: { type: SchemaType.STRING },
                email: { type: SchemaType.STRING },
                phone: { type: SchemaType.STRING },
                linkedin: { type: SchemaType.STRING },
                github: { type: SchemaType.STRING },
                website: { type: SchemaType.STRING },
                location: { type: SchemaType.STRING },
                summary: { type: SchemaType.STRING },
                title: { type: SchemaType.STRING },
            },
        },
        experience: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    id: { type: SchemaType.NUMBER },
                    role: { type: SchemaType.STRING },
                    company: { type: SchemaType.STRING },
                    date: { type: SchemaType.STRING },
                    bullets: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                },
                required: ['role', 'company'],
            },
        },
        education: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    id: { type: SchemaType.NUMBER },
                    degree: { type: SchemaType.STRING },
                    school: { type: SchemaType.STRING },
                    date: { type: SchemaType.STRING },
                },
            },
        },
        skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    },
    required: ['personal'],
};
