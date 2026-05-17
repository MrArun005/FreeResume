// Audit endpoints — both score the resume and surface actionable fixes.
//
//   POST /api/analyze-resume — formal ATS analysis with critical issues +
//                              improvements + keyword coverage.
//   POST /api/roast-resume   — same idea, snarky tone. Recruiter-as-roaster.

import { Router } from 'express';
import { generateWithFallback } from '../lib/gemini.js';
import { extractJson, sendError } from '../lib/utils.js';
import { INFER_CONTEXT_PREAMBLE, deriveResumeContext } from '../lib/prompts.js';
import { SCHEMA_ANALYZE, SCHEMA_ROAST } from '../lib/schemas.js';

const router = Router();

router.post('/analyze-resume', async (req, res) => {
    try {
        const { resumeData } = req.body;
        if (!resumeData) return res.status(400).json({ error: 'No resume data provided' });

        const prompt = `
        Act as an expert ATS (Applicant Tracking System) scanner and Resume Coach. Be strict — no grade inflation.

        ${INFER_CONTEXT_PREAMBLE}

        ${deriveResumeContext(resumeData)}

        Resume Data: ${JSON.stringify(resumeData)}

        Provide a strict, detailed analysis in the following JSON format (NO markdown):
        {
            "score": number (0-100, where 85+ means truly ATS-ready, 60-84 means parseable but missing role-relevant keywords, <60 means structural issues),
            "summary": "string (one-paragraph overview anchored to inferred target role and seniority)",
            "criticalIssues": [
                { "id": "string", "text": "string (specific structural or content problem)", "section": "string", "fix": { "type": "replace-text|append-bullet|add-keywords|normalize-skills|add-section|none", "target": "string (dot-path)", "value": "string" } }
            ],
            "improvements": [
                { "id": "string", "text": "string (concrete change with a 'before → after' shape where useful)", "section": "string", "fix": { "type": "...", "target": "string", "value": "string" } }
            ],
            "keywordsFound": ["string (keywords already present that map to the inferred target role)"],
            "missingKeywords": ["string (specific high-value keywords for the inferred target role, not generic terms)"]
        }

        CRITICAL — every issue and improvement MUST include a "fix" object the application can apply with one click:
        - "replace-text" — value is the new full text. target is a dot-path like "personal.summary" or "experience.0.bullets.2" (zero-indexed).
        - "append-bullet" — value is the new bullet text. target is a dot-path like "experience.0.bullets" (the array, no index).
        - "add-keywords" — value is a comma-separated list of skills to add. target is always "skills".
        - "normalize-skills" — re-buckets the existing skills using the taxonomy. target is "skills", value is "".
        - "add-section" — value is the section id ("projects", "certifications", etc). target is "sectionOrder".
        - "none" — use only when no automated fix is possible (e.g. advice that requires human judgment). target and value should be "".

        Examples of well-formed fixes:
        - Bullet lacks a metric: { type:"replace-text", target:"experience.0.bullets.1", value:"Reduced API latency 40% by introducing Redis caching across the order-service" }
        - Missing keywords for backend role: { type:"add-keywords", target:"skills", value:"AWS, Kafka, Redis" }
        - All skills dumped into one bucket: { type:"normalize-skills", target:"skills", value:"" }
        - Summary too short: { type:"replace-text", target:"personal.summary", value:"<full rewritten summary>" }

        For "before → after" improvements, always use replace-text with the AFTER text. The fix's value must be production-ready content the user can paste straight in — no placeholders, no "[YOUR METRIC HERE]".
        `;

        const textResponse = await generateWithFallback(prompt, SCHEMA_ANALYZE);
        const analysis = extractJson(textResponse);
        res.json(analysis);
    } catch (error) {
        console.error('Error analyzing resume:', error);
        sendError(res, 500, 'Failed to analyze resume', error.message);
    }
});

router.post('/roast-resume', async (req, res) => {
    try {
        const { resumeData } = req.body;
        if (!resumeData) return res.status(400).json({ error: 'No resume data provided' });

        const prompt = `
        Act as a ruthless, witty, and sarcastic Senior Recruiter who has seen thousands of terrible resumes. Your job is to "roast" the following resume.

        ${INFER_CONTEXT_PREAMBLE}

        ${deriveResumeContext(resumeData)}

        Resume Data: ${JSON.stringify(resumeData)}

        Provide the output in the following JSON format (NO markdown):
        {
            "score": number (0-100, rate hireability for the inferred target role — strictly but fairly),
            "oneLiner": "string (a short, biting headline that calls out the inferred target role)",
            "roast": "string (a paragraph-long savage critique calibrated to inferred industry and seniority — a junior gets different roasts than a principal)",
            "burns": ["string (3-4 short, witty jabs about specific lines or sections, quoting where useful — burns are jokes, no fix needed)"],
            "redFlags": [
                { "text": "string (the issue that would get this rejected)", "fix": { "type": "replace-text|append-bullet|add-keywords|normalize-skills|add-section|none", "target": "string (dot-path)", "value": "string" } }
            ]
        }

        Be funny but constructive. The roast and burns should quote specific lines from the resume — not generic jokes. Burns can be sarcastic; red flags must be grounded in real content (e.g. an actual bullet that says "Responsible for…" or a real skills section that's just one mega-bucket).

        Each red flag MUST include a "fix" the application can apply with one click:
        - "replace-text" — value is the new full text. target is a dot-path like "personal.summary" or "experience.0.bullets.2" (zero-indexed).
        - "append-bullet" — value is the new bullet text. target is "experience.0.bullets" or similar.
        - "add-keywords" — value is comma-separated skills to add. target is "skills".
        - "normalize-skills" — re-buckets existing skills. target is "skills", value is "".
        - "add-section" — value is the section id. target is "sectionOrder".
        - "none" — only when the issue truly can't be auto-fixed (e.g. "your job history has a 3-year gap"). target and value should be "".

        For "rewrite this bullet" red flags, always emit replace-text with the production-ready AFTER text in value — no placeholders.
        `;

        const textResponse = await generateWithFallback(prompt, SCHEMA_ROAST);
        const roastData = extractJson(textResponse);
        res.json(roastData);
    } catch (error) {
        console.error('Error roasting resume:', error);
        sendError(res, 500, 'Failed to roast resume', error.message);
    }
});

export default router;
