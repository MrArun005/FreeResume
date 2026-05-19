// JD-driven endpoints — all take a job description (or URL) plus the
// candidate's resume and produce something tailored to that role.
//
//   POST /api/match-job             — score + tailoring advice
//   POST /api/generate-cover-letter — full cover letter body text
//   POST /api/tailor-resume         — rewrites the resume to the JD (URL → scrape)

import { Router } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { generateWithFallback } from '../lib/gemini.js';
import { extractJson, sendError } from '../lib/utils.js';
import { INFER_CONTEXT_PREAMBLE, deriveResumeContext } from '../lib/prompts.js';
import { SCHEMA_MATCH, SCHEMA_RERANK } from '../lib/schemas.js';
import { runGemini } from '../lib/queues.js';
import { makeKey, memoize } from '../lib/cache.js';

const router = Router();

router.post('/match-job', async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body;
        if (!resumeData || !jobDescription)
            return res.status(400).json({ error: 'Missing resume data or job description' });

        const prompt = `
        Act as an expert Recruiter and ATS. Compare the following Resume against the Job Description (JD).

        Resume: ${JSON.stringify(resumeData)}

        Job Description:
        "${jobDescription}"

        Provide a detailed match analysis in JSON format (NO markdown):
        {
            "score": number (0-100),
            "matchSummary": "string (1-2 sentences on overall fit)",
            "missingKeywords": ["string (critical skills in JD missing from Resume)"],
            "tailoringAdvice": ["string (specific actionable tips to improve match)"]
        }
        `;

        // Same (resume, JD) → same answer. Cache for an hour so a user
        // re-clicking Analyze or two users on the same public JD share
        // one model call.
        const cacheKey = makeKey('match-job', resumeData, jobDescription);
        const matchAnalysis = await memoize(cacheKey, async () => {
            const textResponse = await runGemini(() =>
                generateWithFallback(prompt, SCHEMA_MATCH, 'match-job')
            );
            return extractJson(textResponse);
        });
        res.json(matchAnalysis);
    } catch (error) {
        console.error('Error matching job:', error);
        sendError(res, 500, 'Failed to match job', error.message);
    }
});

// Cover-letter body generator.
//
// Optional `tone` ('professional' | 'enthusiastic' | 'concise'). Defaults
// to 'professional' when missing or unrecognized so callers that pre-date
// this param keep working.
router.post('/generate-cover-letter', async (req, res) => {
    try {
        const { resumeData, jobDescription, tone } = req.body;
        if (!resumeData || !jobDescription)
            return res.status(400).json({ error: 'Missing resume data or job description' });

        const TONE_BRIEFS = {
            professional: 'Confident, polished, and warm. Conservative phrasing. Default for most roles.',
            enthusiastic:
                'Energetic and personal. Show genuine excitement for the role and company. Still grounded in concrete experience — no fluff.',
            concise:
                'Tight and direct. Three short paragraphs maximum. No filler. Every sentence carries weight.',
        };
        const toneKey = TONE_BRIEFS[tone] ? tone : 'professional';
        const toneBrief = TONE_BRIEFS[toneKey];

        const prompt = `
        Act as a professional career coach. Write a compelling cover letter for the candidate based on their Resume and the target Job Description.

        ${INFER_CONTEXT_PREAMBLE}

        ${deriveResumeContext(resumeData)}

        Tone: ${toneKey} — ${toneBrief}

        Resume: ${JSON.stringify(resumeData)}

        Job Description:
        "${jobDescription}"

        Requirements:
        - 3–4 paragraphs (use the "concise" tone for the shorter 3-paragraph version).
        - Open with a hook that names the role and one credibility signal (years + specialty, or a relevant standout).
        - Middle paragraphs connect 2–3 specific achievements from the resume to JD requirements — quote real bullet content where it lands cleanly. DO NOT fabricate metrics.
        - Close with a forward-looking line + a low-friction call to action.
        - No salutation block ("Dear Hiring Manager,"), no signature line, no contact info — the PDF template adds those.
        - Separate paragraphs with a SINGLE blank line.
        - Return ONLY the body paragraphs as plain text (no markdown, no "Here is your cover letter", no quotes).
        `;

        // Cache cover letters per (resume, JD, tone). Same trio → same
        // output; user almost always tweaks the JD slightly between calls
        // so cache hits are real but not dominant. TTL is short (15 min)
        // because a candidate retrying often wants a fresh take.
        const cacheKey = makeKey('cover-letter', resumeData, jobDescription, toneKey);
        const coverLetter = await memoize(
            cacheKey,
            async () => {
                const out = await runGemini(() => generateWithFallback(prompt, null, 'cover-letter'));
                return out.trim();
            },
            15 * 60 * 1000
        );
        res.json({ coverLetter, tone: toneKey });
    } catch (error) {
        console.error('Error generating cover letter:', error);
        sendError(res, 500, 'Failed to generate cover letter', error.message);
    }
});

router.post('/tailor-resume', async (req, res) => {
    try {
        const { resumeData, jobUrl } = req.body;
        if (!resumeData || !jobUrl) return res.status(400).json({ error: 'Missing resume data or job URL' });

        console.log(`Fetching job description from: ${jobUrl}`);

        // 1. Scrape the JD.
        let jobDescription = '';
        try {
            const { data } = await axios.get(jobUrl, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            });
            const $ = cheerio.load(data);
            $('script, style, nav, header, footer, .nav, .menu').remove();
            jobDescription = $('main, article, .job-description, #job-description, body')
                .text()
                .replace(/\s+/g, ' ')
                .trim();
            if (jobDescription.length > 20000) jobDescription = jobDescription.substring(0, 20000);
        } catch (scrapeError) {
            console.error('Scraping failed:', scrapeError.message);
            return res.status(400).json({
                error: 'Failed to fetch job details from URL. Please paste the description manually.',
            });
        }

        if (jobDescription.length < 100) {
            return res.status(400).json({
                error: 'Could not extract meaningful content from the URL. Please paste the description manually.',
            });
        }

        // 2. AI tailoring.
        const prompt = `
        Act as an expert Resume Writer. Tailor the following Resume to match the Job Description provided.

        Job Description (Extracted):
        "${jobDescription.substring(0, 5000)}..."

        Resume (JSON):
        ${JSON.stringify(resumeData)}

        Instructions:
        1. **Summary:** Rewrite the professional summary to highlight experience relevant to this specific job.
        2. **Skills:** Reorder and add relevant skills from the JD (only if the candidate likely has them based on experience).
        3. **Experience:** Rewrite bullet points to emphasize achievements that match the JD's requirements. Use strong action verbs.
        4. **Keywords:** Naturally integrate keywords from the JD.
        5. **Structure:** Keep the exact same JSON structure as the input resume.

        Return ONLY the valid JSON object of the tailored resume.
        `;

        // Cache tailored output for the JD URL + resume pair. Resumes
        // rarely change between clicks; users frequently click "Tailor"
        // again after reading results, so this is a high-hit cache.
        const cacheKey = makeKey('tailor-resume', resumeData, jobUrl);
        const tailoredResume = await memoize(cacheKey, async () => {
            const textResponse = await runGemini(() => generateWithFallback(prompt, null, 'tailor-resume'));
            return extractJson(textResponse);
        });
        res.json({ tailoredResume, jobDescription });
    } catch (error) {
        console.error('Error tailoring resume:', error);
        sendError(res, 500, 'Failed to tailor resume', error.message);
    }
});

// Non-destructive JD tailoring. Unlike /tailor-resume (which rewrites every
// bullet — destroys the candidate's voice), this endpoint preserves the
// exact wording the user wrote. It only scores each bullet against the JD,
// returns a suggested reorder, and surfaces missing keywords. The client
// applies a reorder atomically; the user's words never go through the model.
//
// This is the differentiating feature vs. other resume builders: every
// competitor's "AI tailor" button does a full rewrite, flattening voice
// and creating ATS-friendly slop. This keeps the human in the driver's seat.
router.post('/rerank-bullets', async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body;
        if (!resumeData || !jobDescription)
            return res.status(400).json({ error: 'Missing resume data or job description' });

        // Strip the resume down to what the model needs to score — keeps
        // tokens low and prevents the model from picking up unrelated noise
        // (cover letters, custom sections it shouldn't reorder, etc.).
        const compact = {
            personal: { title: resumeData.personal?.title, summary: resumeData.personal?.summary },
            skills: resumeData.skills || [],
            experience: (resumeData.experience || []).map((exp) => ({
                id: exp.id,
                role: exp.role,
                company: exp.company,
                date: exp.date,
                bullets: exp.bullets || [],
            })),
        };

        const prompt = `
You are an expert technical recruiter. Score how well each EXPERIENCE BULLET in the resume matches the Job Description.

YOUR JOB: rank bullets, surface missing keywords. DO NOT rewrite anything. The candidate's exact wording must be preserved.

For each experience block, return a suggestedOrder = an array of bullet indices (0-based, referring to the input bullets array) in the order they should appear. Lift the most JD-relevant bullets to the top, sink the least relevant. ALL original indices must appear in suggestedOrder exactly once.

For each bullet, return a relevance score from -20 (off-topic for this role) to +20 (directly matches a key JD requirement). Add a one-line rationale referring to specific JD terms.

For missing keywords, focus on must-haves the JD explicitly requires but the resume does not mention. Mark each as "must-have" or "nice-to-have".

Resume (compact):
${JSON.stringify(compact)}

Job Description:
"""
${jobDescription}
"""

Return strict JSON:
{
  "currentScore": 0-100,                              // raw match today
  "potentialScore": 0-100,                            // achievable after applying reorder + adding missing must-haves
  "summary": "string (1 sentence, no fluff)",
  "missingKeywords": [{"keyword":"...","importance":"must-have|nice-to-have","rationale":"..."}],
  "experienceRerank": [
    {
      "experienceId": <number, matching input exp.id>,
      "suggestedOrder": [<bullet indices>],
      "bulletScores": [{"index": <n>, "relevance": -20..20, "rationale": "..."}]
    }
  ]
}
        `;

        // Cache rerank output. The non-destructive contract makes this
        // particularly cache-friendly: same (resume, JD) → same order.
        const cacheKey = makeKey('rerank-bullets', compact, jobDescription);
        const parsed = await memoize(cacheKey, async () => {
            const textResponse = await runGemini(() =>
                generateWithFallback(prompt, SCHEMA_RERANK, 'rerank-bullets')
            );
            return extractJson(textResponse);
        });
        res.json(parsed);
    } catch (error) {
        console.error('Error reranking bullets:', error);
        sendError(res, 500, 'Failed to rerank bullets', error.message);
    }
});

export default router;
