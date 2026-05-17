import express from 'express';
import cors from 'cors';
import multer from 'multer';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import axios from 'axios';

import dotenv from 'dotenv';

dotenv.config();

// Fail fast at startup so the server never silently runs with a missing key
// and only surfaces the problem on the first AI request.
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
    console.error('\n[FATAL] GEMINI_API_KEY is missing from server/.env');
    console.error('  → Create server/.env with: GEMINI_API_KEY=your_key_here');
    console.error('  → Get a key at https://aistudio.google.com/app/apikey\n');
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Wall-clock budget for any single Gemini call. Without this, a hung upstream
// call would also hang our HTTP request indefinitely. 45s comfortably covers
// the heaviest prompts (full-resume rewrites) on flash models.
const GEMINI_TIMEOUT_MS = 45_000;

// Ordered model fallback list. Each entry sits in a different free-tier quota
// pool so when one bucket is exhausted for the day, the chain marches on to
// a model that still has budget. Updated 2026-05 after seeing the older
// `gemini-2.5-flash-preview-09-2025` get retired (404) and `gemini-2.0-flash`
// hit daily free-tier exhaustion.
//
// Verified against `node list-models.js` for this API key.
const MODEL_FALLBACK_CHAIN = [
    'gemini-2.5-flash',         // current GA, primary choice
    'gemini-2.5-flash-lite',    // separate quota pool, cheaper, same quality for most tasks
    'gemini-2.0-flash-lite',    // separate quota pool, cheaper still
    'gemini-flash-latest',      // rolling alias — last resort
];

// ─── Model availability cache ─────────────────────────────────────────────
//
// We remember *why* a model is unavailable and for how long, then skip it on
// subsequent requests without paying the discovery cost again. Three cases:
//
// - Daily quota exhausted → marked unavailable until midnight Pacific (~24h)
// - Per-minute rate limit → marked unavailable for 60s
// - 404 / retired model    → marked unavailable for 24h (effectively forever
//                            until server restart re-probes)
//
// In-memory only; cleared on server restart. Acceptable: a restart costs us
// at most one wasted request per model to relearn.
const modelStateCache = new Map(); // modelName → { unavailableUntil: ms, reason: string }

const DAY_MS = 24 * 60 * 60 * 1_000;
const MINUTE_MS = 60 * 1_000;

function isModelAvailable(modelName) {
    const state = modelStateCache.get(modelName);
    if (!state) return true;
    if (Date.now() >= state.unavailableUntil) {
        modelStateCache.delete(modelName);
        return true;
    }
    return false;
}

function markModelUnavailable(modelName, durationMs, reason) {
    modelStateCache.set(modelName, {
        unavailableUntil: Date.now() + durationMs,
        reason,
    });
    const mins = Math.round(durationMs / MINUTE_MS);
    console.warn(`[Quota] ${modelName} → unavailable for ~${mins}min: ${reason}`);
}

function classifyAndMark(modelName, error) {
    const msg = error?.message || '';
    if (isDailyQuotaExhausted(error)) {
        markModelUnavailable(modelName, DAY_MS, 'daily free-tier quota exhausted');
    } else if (msg.includes('404') || msg.includes('is not found')) {
        markModelUnavailable(modelName, DAY_MS, 'model not found (likely retired)');
    } else if (msg.includes('429') || msg.toLowerCase().includes('too many requests')) {
        // Per-minute rate limit — Gemini's RetryInfo usually says 30-60s; cool
        // off for 60s and the chain falls through in the meantime.
        markModelUnavailable(modelName, MINUTE_MS, 'per-minute rate limit');
    }
}

function getAvailableModels() {
    return MODEL_FALLBACK_CHAIN.filter(isModelAvailable);
}

// One-shot startup probe: hit ListModels and prune any chain entry that the
// API doesn't actually serve `generateContent` on. Saves us from learning at
// runtime that a preview was retired.
async function probeAvailableModels() {
    try {
        const key = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (!response.ok) {
            console.warn(`[Startup] ListModels HTTP ${response.status} — will discover at runtime instead`);
            return;
        }
        const data = await response.json();
        const servable = new Set(
            (data.models || [])
                .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
                .map((m) => m.name.replace(/^models\//, ''))
        );
        for (const modelName of MODEL_FALLBACK_CHAIN) {
            if (!servable.has(modelName)) {
                markModelUnavailable(modelName, DAY_MS, 'not in ListModels response');
            }
        }
        const available = getAvailableModels();
        console.log(`[Startup] Model chain ready: ${available.join(', ') || '(none — all unavailable)'}`);
    } catch (error) {
        console.warn(`[Startup] Could not probe models: ${error.message}. Will discover at runtime.`);
    }
}

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

app.use((req, res, next) => {
    console.log(`[DEBUG] Request: ${req.method} ${req.url}`);
    console.log(`[DEBUG] Content-Length: ${req.headers['content-length']}`);
    next();
});

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to clean text
function normalizeRaw(text) {
    if (!text) return "";
    let t = text.replace(/\u00A0/g, " ");
    t = t.replace(/-\n\s*/g, "");
    t = t.replace(/[ \t]{2,}/g, " ");
    t = t.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    t = t.replace(/\n{3,}/g, "\n\n");
    return t.trim();
}

// Gemini Native PDF Parsing (No local library needed)
const MAX_RETRIES = 3;
const INITIAL_DELAY = 2000;

// Race a promise against a deadline. Used to bound each Gemini call so a
// hung upstream connection can't lock up the request handler indefinitely.
function withTimeout(promise, ms, label = 'operation') {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
        ),
    ]);
}

// True if the 429 is a *daily* quota exhaustion (per-day quota hit zero).
// In that case, exponential 2-8s backoff is pointless — the API itself tells
// us "retry in 30-60 seconds" via RetryInfo. We skip retries and let the
// fallback chain march to the next model immediately.
function isDailyQuotaExhausted(error) {
    const msg = error?.message || '';
    return (
        msg.includes('GenerateRequestsPerDayPerProjectPerModel-FreeTier') ||
        msg.includes('per day') ||
        msg.includes('per-day')
    );
}

// Classify whether an error from the Gemini SDK is worth retrying. Includes
// rate-limit (429) plus common transient network/server failures, but
// *excludes* daily-quota exhaustion (which is handled by skipping to next
// model in the fallback chain instead).
function isRetryable(error) {
    if (isDailyQuotaExhausted(error)) return false;
    const msg = (error?.message || '').toLowerCase();
    return (
        msg.includes('429') ||
        msg.includes('too many requests') ||
        msg.includes('resource exhausted') ||
        msg.includes('econnreset') ||
        msg.includes('etimedout') ||
        msg.includes('socket hang up') ||
        msg.includes('fetch failed') ||
        msg.includes('503') ||
        msg.includes('502') ||
        msg.includes('500') ||
        msg.includes('unavailable')
    );
}

async function generateContentWithRetry(model, promptOrParts) {
    let retries = 0;
    while (true) {
        try {
            const result = await withTimeout(
                model.generateContent(promptOrParts),
                GEMINI_TIMEOUT_MS,
                'Gemini generateContent'
            );
            const response = await result.response;
            return response.text();
        } catch (error) {
            // Daily quota out → don't waste 14 seconds of retries; bail
            // immediately so the outer fallback chain can try the next model.
            if (isDailyQuotaExhausted(error)) {
                console.warn(`Daily quota exhausted for this model — failing fast to next fallback`);
                throw error;
            }
            if (isRetryable(error) && retries < MAX_RETRIES) {
                const delay = INITIAL_DELAY * Math.pow(2, retries);
                console.warn(`Gemini transient error (${error.message}). Retry ${retries + 1}/${MAX_RETRIES} in ${delay}ms`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                retries++;
            } else {
                throw error;
            }
        }
    }
}

// Pull a JSON object/array out of a Gemini response. Handles the common cases
// where the model wraps output in ```json fences, prepends explanatory prose,
// or trails additional commentary after the JSON. Throws with a useful message
// if no valid JSON can be located.
function extractJson(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Empty response from Gemini');
    }

    // Strip markdown code fences if present, then try a direct parse.
    let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch { /* fall through to bracket extraction */ }

    // Locate the outermost JSON object or array by matching braces.
    const firstCurly = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    const starts = [firstCurly, firstBracket].filter((i) => i >= 0);
    if (starts.length === 0) {
        throw new Error(`No JSON found in response. Got: ${cleaned.slice(0, 200)}`);
    }
    const startIdx = Math.min(...starts);
    const openChar = cleaned[startIdx];
    const closeChar = openChar === '{' ? '}' : ']';

    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = startIdx; i < cleaned.length; i++) {
        const ch = cleaned[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\' && inString) { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === openChar) depth++;
        else if (ch === closeChar) {
            depth--;
            if (depth === 0) {
                const candidate = cleaned.slice(startIdx, i + 1);
                try { return JSON.parse(candidate); }
                catch (e) { throw new Error(`Found JSON-like block but parse failed: ${e.message}`); }
            }
        }
    }
    throw new Error('Unterminated JSON block in Gemini response');
}

// Standard error responder. Keeps the response shape consistent across
// endpoints so the frontend can rely on { error, details } being present.
function sendError(res, status, error, details) {
    res.status(status).json({
        error,
        details: details || undefined,
    });
}

// Build a compact, human-readable summary of the candidate that we prepend
// to every full-resume AI prompt. This forces Gemini to anchor its advice
// to the candidate's actual seniority, industry, and target role instead of
// drifting toward generic resume-coach platitudes.
//
// We deliberately keep this short (a few hundred tokens at most) — the full
// resumeData is still in the prompt, this is just the lens.
function deriveResumeContext(resumeData) {
    if (!resumeData) return '';
    const personal = resumeData.personal || {};
    const experience = resumeData.experience || [];
    const skills = resumeData.skills || [];
    const education = resumeData.education || [];

    const currentRole = experience[0]?.role || personal.title || 'unspecified';
    const currentCompany = experience[0]?.company || 'unspecified';
    const numRoles = experience.length;

    // Rough years-of-experience signal from the count of distinct roles
    // (good enough as a coarse hint; we don't try to parse free-text dates).
    const yoeHint = numRoles >= 5 ? '5+ years (senior signal)' :
        numRoles >= 3 ? '3-5 years (mid signal)' :
            numRoles >= 1 ? '0-3 years (entry/mid signal)' :
                'no work history listed';

    const skillSample = skills.slice(0, 12).map((s) => (typeof s === 'string' ? s : '')).filter(Boolean).join(', ');
    const educationTop = education[0] ? `${education[0].degree || ''} from ${education[0].school || 'unspecified'}`.trim() : 'unspecified';

    return [
        `Candidate snapshot (for grounding — infer target role from this):`,
        `- Title/Most recent role: ${currentRole} at ${currentCompany}`,
        `- Roles listed: ${numRoles}, ${yoeHint}`,
        `- Education: ${educationTop}`,
        skillSample ? `- Skills sample: ${skillSample}` : '',
    ].filter(Boolean).join('\n');
}

// Standard preamble that all full-resume prompts use. Asks Gemini to first
// infer the target role/seniority/industry, then tailor its output to that
// inferred target.
const INFER_CONTEXT_PREAMBLE = `Before writing your output, silently infer the following from the resume:
1. The candidate's likely target role (use most recent title + skills + experience to triangulate).
2. Seniority level: entry / mid / senior / lead / principal.
3. Industry vertical: tech / finance / healthcare / consulting / education / other.
4. Approximate years of experience.

Use these inferences to tailor every piece of advice. Keyword suggestions, score severity, tone, and depth must all match the inferred target. Do not output your inferences — just let them shape the response.`;

// ─── Response schemas for Gemini JSON mode ────────────────────────────────
//
// Passing `responseMimeType: 'application/json'` + `responseSchema` to the
// model constrains output to a guaranteed-valid JSON document matching the
// shape below. Eliminates the failure mode where Gemini wraps JSON in prose
// or markdown fences. We keep `extractJson` as a defensive fallback.
//
// Schemas are limited to OBJECT, ARRAY, STRING, NUMBER, BOOLEAN — no enums,
// no oneOf. Per SDK 0.24 / Gemini API v1beta.

// Every issue / improvement now carries a `fix` descriptor that the client
// can apply with one click. Fix shapes are intentionally tiny so Gemini
// produces them reliably: { type, target, value }. The client knows how to
// interpret each type (see src/utils/applyResumeFix.js).
const FIX_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        type: { type: SchemaType.STRING },   // replace-text | append-bullet | add-keywords | normalize-skills | add-section | none
        target: { type: SchemaType.STRING }, // dot path e.g. personal.summary, experience.0.bullets, skills
        value: { type: SchemaType.STRING },  // new text, csv keywords, or '' for normalize-skills
    },
    required: ['type', 'target', 'value'],
};

const SCHEMA_ANALYZE = {
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

const SCHEMA_MATCH = {
    type: SchemaType.OBJECT,
    properties: {
        score: { type: SchemaType.NUMBER },
        matchSummary: { type: SchemaType.STRING },
        missingKeywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        tailoringAdvice: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    },
    required: ['score', 'matchSummary', 'missingKeywords', 'tailoringAdvice'],
};

const SCHEMA_ROAST = {
    type: SchemaType.OBJECT,
    properties: {
        score: { type: SchemaType.NUMBER },
        oneLiner: { type: SchemaType.STRING },
        roast: { type: SchemaType.STRING },
        // burns stay as plain strings — these are the jokes/jabs and aren't actionable.
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

// Resume-parse schema — strict enough to give the parser a target, loose enough
// that real-world resumes (some without phone, some without socials) still validate.
const SCHEMA_PARSED_RESUME = {
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

async function parseWithGemini(fileBuffer, mimeType, textContent = null) {
    const modelsToTry = getAvailableModels();
    if (modelsToTry.length === 0) {
        const allStates = [...modelStateCache.entries()].map(([m, s]) => `${m} (${s.reason})`).join('; ');
        throw new Error(`All Gemini models currently unavailable. State: ${allStates || 'unknown'}`);
    }

    const systemPrompt = `
  You are an expert resume parser. Extract the following information from the resume provided.
  Return ONLY a valid JSON object with no markdown formatting or backticks.
  
  Structure:
  {
    "personal": {
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "linkedin": "string",
      "github": "string",
      "website": "string",
      "location": "string",
      "summary": "string (short professional summary)",
      "title": "string (current job title)"
    },
    "experience": [
      { 
        "id": number (timestamp), 
        "role": "string", 
        "company": "string", 
        "date": "string (e.g. Jan 2020 - Present)", 
        "bullets": ["string (list of accomplishments)"] 
      }
    ],
    "education": [
      { 
        "id": number (timestamp), 
        "degree": "string", 
        "school": "string", 
        "date": "string (year or range)" 
      }
    ],
    "skills": ["string"]
  }
  `;

    let parts = [];

    if (mimeType === 'application/pdf') {
        // Native PDF support
        parts = [
            { text: systemPrompt },
            {
                inlineData: {
                    mimeType: "application/pdf",
                    data: fileBuffer.toString("base64")
                }
            }
        ];
    } else {
        // Text-based (DOCX converted to text, or plain text)
        parts = [
            { text: systemPrompt },
            { text: `Resume Text:\n${textContent}` }
        ];
    }

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting to parse with model: ${modelName}`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: SCHEMA_PARSED_RESUME,
                },
            });
            const textResponse = await generateContentWithRetry(model, parts);
            return extractJson(textResponse);
        } catch (error) {
            classifyAndMark(modelName, error);
            console.warn(`Failed with model ${modelName}: ${(error.message || '').slice(0, 120)}`);
            if (modelName === modelsToTry[modelsToTry.length - 1]) throw error;
        }
    }
}


// Generate PDF with Puppeteer
app.post('/api/generate-pdf', async (req, res) => {
    let browser = null;
    try {
        const { html } = req.body;
        if (!html) return res.status(400).json({ error: 'Missing HTML content' });

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'] // Allow local file links if any
        });
        const page = await browser.newPage();

        // Important: Set viewport to match A4 size to ensure correct media queries and layout calculations
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

        // Set content and wait for network/fonts to load
        await page.setContent(html, {
            waitUntil: ['load', 'networkidle0']
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
            preferCSSPageSize: true, // Respect @page CSS
            displayHeaderFooter: false
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=resume.pdf',
            'Content-Length': pdfBuffer.length
        });
        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('PDF Generation Error:', error);
        sendError(res, 500, 'Failed to generate PDF', error.message);
    } finally {
        if (browser) await browser.close();
    }
});

// API Routes
app.post('/api/parse-resume', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let rawText = "";
        const buffer = req.file.buffer;
        let mimeType = req.file.mimetype;

        console.log(`Processing file: ${req.file.originalname} (${mimeType})`);

        if (mimeType === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
            // Ensure mimeType is correct for Gemini
            mimeType = 'application/pdf';
            // PDF is handled natively by Gemini, no local text extraction needed
            console.log("PDF detected, passing buffer to Gemini...");
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            req.file.originalname.toLowerCase().endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer });
            rawText = result.value;
        } else {
            // Fallback to text
            rawText = buffer.toString('utf-8');
        }

        rawText = normalizeRaw(rawText);
        console.log("Extracted Text Length:", rawText.length);

        // PDF is handled directly by Gemini (textContent remains null)

        const parsedData = await parseWithGemini(buffer, mimeType, rawText);
        res.json(parsedData);

    } catch (error) {
        console.error('Error parsing resume:', error);
        if (error.name === 'InvalidCharacterError' || error.message.includes('match the expected pattern')) {
            console.error('Likely an issue with base64 decoding in a dependency.');
        }
        sendError(res, 500, 'Failed to parse resume', error.message);
    }
});

// --- NEW AI FEATURES ---

// Helper to get a working model.
//
// `schema` is optional. When provided, we ask Gemini for native JSON output
// matching that shape (responseMimeType + responseSchema). This eliminates
// the prose-around-JSON failure mode that `extractJson` exists to clean up.
//
// Iterates only over models known-available from `modelStateCache`. Any
// model that fails with quota/rate-limit/404 is marked unavailable for its
// cooldown so the next request skips it without retrying.
async function generateWithFallback(prompt, schema = null) {
    const available = getAvailableModels();
    if (available.length === 0) {
        const allStates = [...modelStateCache.entries()].map(([m, s]) => `${m} (${s.reason})`).join('; ');
        throw new Error(`All Gemini models currently unavailable. State: ${allStates || 'unknown'}`);
    }

    const modelOptions = (modelName) => {
        const opts = { model: modelName };
        if (schema) {
            opts.generationConfig = {
                responseMimeType: 'application/json',
                responseSchema: schema,
            };
        }
        return opts;
    };

    let lastError = null;

    for (const modelName of available) {
        try {
            const model = genAI.getGenerativeModel(modelOptions(modelName));
            return await generateContentWithRetry(model, prompt);
        } catch (error) {
            classifyAndMark(modelName, error);
            console.warn(`Model ${modelName} failed: ${(error.message || '').slice(0, 120)}`);
            lastError = error;
        }
    }
    throw lastError;
}

// 1. Improve Grammar & Tone
//
// Optional `resumeData` in the body lets the model anchor the rewrite to the
// candidate's actual seniority, role, and industry. Without it the rewrite
// still works but reads more generic.
app.post('/api/improve-text', async (req, res) => {
    try {
        const { text, type, resumeData } = req.body; // type: 'summary' | 'bullet'
        if (!text) return res.status(400).json({ error: 'No text provided' });

        const contextBlock = resumeData
            ? `\n${INFER_CONTEXT_PREAMBLE}\n\n${deriveResumeContext(resumeData)}\n`
            : '';

        const prompt = type === 'bullet'
            ? `Rewrite this resume bullet point to be more impactful. Use strong action verbs, ideally lead with a verb in the past tense, and quantify where the original implies a number. Match the seniority of the inferred target role. Keep it concise (one line preferred, never over 250 chars).
${contextBlock}
Return ONLY the rewritten bullet (no quotes, no leading dash). Input: "${text}"`
            : `Rewrite this professional summary to be engaging, specific, and ATS-friendly. Lead with the candidate's strongest signal (years + role + specialty). Keep it 2-4 sentences. Tone and depth should match the inferred seniority.
${contextBlock}
Return ONLY the rewritten summary (no quotes, no leading whitespace). Input: "${text}"`;

        const improvedText = (await generateWithFallback(prompt)).trim();
        res.json({ improvedText });

    } catch (error) {
        console.error('Error improving text:', error);
        sendError(res, 500, 'Failed to improve text', error.message);
    }
});

// 2. Comprehensive ATS Scan
app.post('/api/analyze-resume', async (req, res) => {
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

// 3. Improve Entire Resume
app.post('/api/improve-resume', async (req, res) => {
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

        const textResponse = await generateWithFallback(prompt);
        const improvedResume = extractJson(textResponse);
        res.json({ improvedResume });

    } catch (error) {
        console.error('Error improving resume:', error);
        sendError(res, 500, 'Failed to improve resume', error.message);
    }
});

// 4. Job Description Match & Tailoring
app.post('/api/match-job', async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body;
        if (!resumeData || !jobDescription) return res.status(400).json({ error: 'Missing resume data or job description' });

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

        const textResponse = await generateWithFallback(prompt, SCHEMA_MATCH);
        const matchAnalysis = extractJson(textResponse);
        res.json(matchAnalysis);

    } catch (error) {
        console.error('Error matching job:', error);
        sendError(res, 500, 'Failed to match job', error.message);
    }
});

// 5. Generate Cover Letter
app.post('/api/generate-cover-letter', async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body;
        if (!resumeData || !jobDescription) return res.status(400).json({ error: 'Missing resume data or job description' });

        const prompt = `
        Act as a professional career coach. Write a compelling Cover Letter for the candidate based on their Resume and the target Job Description.
        
        Resume: ${JSON.stringify(resumeData)}
        
        Job Description:
        "${jobDescription}"

        Requirements:
        - Professional, enthusiastic tone.
        - Connect specific past achievements to JD requirements.
        - Keep it concise (3-4 paragraphs).
        - Return ONLY the cover letter text (no markdown, no "Here is your cover letter").
        `;

        const coverLetter = (await generateWithFallback(prompt)).trim();
        res.json({ coverLetter });

    } catch (error) {
        console.error('Error generating cover letter:', error);
        sendError(res, 500, 'Failed to generate cover letter', error.message);
    }
});

// 6. Tailor Resume from URL
app.post('/api/tailor-resume', async (req, res) => {
    try {
        const { resumeData, jobUrl } = req.body;
        if (!resumeData || !jobUrl) return res.status(400).json({ error: 'Missing resume data or job URL' });

        console.log(`Fetching job description from: ${jobUrl}`);

        // 1. Scrape the Job Description
        let jobDescription = '';
        try {
            const { data } = await axios.get(jobUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(data);

            // Remove scripts, styles, and navs to clean up text
            $('script, style, nav, header, footer, .nav, .menu').remove();

            // Extract text from main content areas (heuristics)
            jobDescription = $('main, article, .job-description, #job-description, body').text().replace(/\s+/g, ' ').trim();

            // Truncate if too long (Gemini limit)
            if (jobDescription.length > 20000) jobDescription = jobDescription.substring(0, 20000);

        } catch (scrapeError) {
            console.error('Scraping failed:', scrapeError.message);
            return res.status(400).json({ error: 'Failed to fetch job details from URL. Please paste the description manually.' });
        }

        if (jobDescription.length < 100) {
            return res.status(400).json({ error: 'Could not extract meaningful content from the URL. Please paste the description manually.' });
        }

        // 2. AI Tailoring
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

        const textResponse = await generateWithFallback(prompt);
        const tailoredResume = extractJson(textResponse);
        res.json({ tailoredResume, jobDescription }); // Return JD too so user can see what was extracted

    } catch (error) {
        console.error('Error tailoring resume:', error);
        sendError(res, 500, 'Failed to tailor resume', error.message);
    }
});

// 7. Roast My Resume
app.post('/api/roast-resume', async (req, res) => {
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

const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    // Probe available models async — don't block startup. If the call fails
    // the chain still works on first request, just without the optimization.
    probeAvailableModels();
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

export default app;
