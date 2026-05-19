// Content-rewrite endpoints — both produce improved text grounded in the
// candidate's real role/seniority/industry.
//
//   POST /api/improve-text   — rewrite a single field (summary or bullet)
//   POST /api/improve-resume — rewrite the entire resume to ATS-target shape

import { Router } from 'express';
import { generateWithFallback } from '../lib/gemini.js';
import { extractJson, sendError } from '../lib/utils.js';
import { INFER_CONTEXT_PREAMBLE, deriveResumeContext } from '../lib/prompts.js';
import { runGemini } from '../lib/queues.js';
import { makeKey, memoize } from '../lib/cache.js';

const router = Router();

// 1. Improve a single piece of text (summary or bullet).
//
// Optional `resumeData` in the body lets the model anchor the rewrite to
// the candidate's actual seniority, role, and industry. Without it the
// rewrite still works but reads more generic.
router.post('/improve-text', async (req, res) => {
    try {
        const { text, type, resumeData } = req.body; // type: 'summary' | 'bullet'
        if (!text) return res.status(400).json({ error: 'No text provided' });

        const contextBlock = resumeData
            ? `\n${INFER_CONTEXT_PREAMBLE}\n\n${deriveResumeContext(resumeData)}\n`
            : '';

        const prompt =
            type === 'bullet'
                ? `Rewrite this resume bullet point to be more impactful. Use strong action verbs, ideally lead with a verb in the past tense, and quantify where the original implies a number. Match the seniority of the inferred target role. Keep it concise (one line preferred, never over 250 chars).
${contextBlock}
Return ONLY the rewritten bullet (no quotes, no leading dash). Input: "${text}"`
                : `Rewrite this professional summary to be engaging, specific, and ATS-friendly. Lead with the candidate's strongest signal (years + role + specialty). Keep it 2-4 sentences. Tone and depth should match the inferred seniority.
${contextBlock}
Return ONLY the rewritten summary (no quotes, no leading whitespace). Input: "${text}"`;

        // No cache on /improve-text — single bullet rewrites have low
        // hit rate and would inflate cache size. Still gate behind the
        // queue so a burst doesn't slam Gemini.
        const improvedText = (await runGemini(() => generateWithFallback(prompt))).trim();
        res.json({ improvedText });
    } catch (error) {
        console.error('Error improving text:', error);
        sendError(res, 500, 'Failed to improve text', error.message);
    }
});

// 2. Rewrite the entire resume so an ATS scanner scores it 80+ for the
// inferred target role. Returns the same JSON shape as the input.
router.post('/improve-resume', async (req, res) => {
    try {
        const { resumeData } = req.body;
        if (!resumeData) return res.status(400).json({ error: 'No resume data provided' });

        const prompt = `
        Act as an expert Professional Resume Writer. Your task is to IMPROVE the content of the following resume so that, after your rewrite, an ATS scanner will score it 80+ for the inferred target role.

        ${INFER_CONTEXT_PREAMBLE}

        ${deriveResumeContext(resumeData)}

        REQUIREMENTS — every output MUST satisfy these:
        1. Professional Summary
           - Rewrite to 3–4 sentences, 150–400 characters.
           - First sentence must name the target role (or closest title) and seniority signal (e.g. "Backend engineer with 3+ years building Java microservices…").
           - Mention 2–3 standout technical skills or domains from the resume.
           - No buzzword soup, no "passionate self-starter".
        2. Experience bullets
           - Every bullet starts with a strong action verb (Led, Designed, Built, Shipped, Reduced, Increased, Migrated, Automated, Refactored, Owned, Drove…). No "Responsible for", no "Worked on", no "Helped with".
           - Past tense for prior roles; present tense only for the current role.
           - Use the "Accomplished [X] as measured by [Y], by doing [Z]" pattern. If the original bullet implies a metric, surface it (latency, throughput, cost, headcount, revenue, error rate). If no metric is implied, leave numbers out — DO NOT fabricate.
           - Cap each bullet at ~200 characters.
           - Aim for 3–5 bullets per role.
        3. Skills — REBUILD this entire array
           - Drop all existing groupings; do not preserve "Technical Skills: …" or any single mega-bucket.
           - Re-bucket every skill into specific categories: Languages, Frameworks, Databases, Cloud & Big Data, DevOps & Tools, Architecture & Security, Concepts, Visualization & BI, Machine Learning, Soft Skills. Use only categories that have at least one item.
           - Each entry must be a string of the form "Category: item1, item2, item3". Aim for 3+ categories.
           - Keep the candidate's existing relevant skills; drop only the ones that clearly don't fit the inferred role.
        4. JSON structure preservation
           - Do NOT change keys, IDs, dates, company names, school names, contact info, or section ordering. Only rewrite the *values* of summary, experience.bullets, and skills.
           - Return every field the input had, even unchanged ones.
        5. DO NOT invent false information. No new jobs, no degrees the candidate doesn't have, no fabricated metrics.

        Resume Data: ${JSON.stringify(resumeData)}

        Return ONLY the improved resume JSON object (no markdown, no commentary).
        `;

        // Whole-resume rewrite is expensive — definitely cache.
        const cacheKey = makeKey('improve-resume', resumeData);
        const improvedResume = await memoize(cacheKey, async () => {
            const textResponse = await runGemini(() => generateWithFallback(prompt));
            return extractJson(textResponse);
        });
        res.json({ improvedResume });
    } catch (error) {
        console.error('Error improving resume:', error);
        sendError(res, 500, 'Failed to improve resume', error.message);
    }
});

export default router;
