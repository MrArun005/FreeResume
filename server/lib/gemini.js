// Gemini client + model fallback machinery.
//
// We maintain an ordered list of free-tier-friendly models. Each sits in a
// different quota pool so when one bucket is exhausted for the day, the
// chain marches on to a model that still has budget. The `modelStateCache`
// remembers *why* a given model is unavailable and for how long, so
// subsequent requests skip it without paying the discovery cost again.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { withTimeout } from './utils.js';

// ─── Module-level config ─────────────────────────────────────────────────

// Wall-clock budget for any single Gemini call. Without this, a hung
// upstream call would also hang our HTTP request handler indefinitely.
// 45s comfortably covers the heaviest prompts (full-resume rewrites) on
// flash models.
const GEMINI_TIMEOUT_MS = 45_000;

// Ordered model fallback list. Each entry sits in a different free-tier
// quota pool. Updated 2026-05 after seeing the older
// `gemini-2.5-flash-preview-09-2025` get retired (404) and
// `gemini-2.0-flash` hit daily free-tier exhaustion. Verified against
// `node list-models.js` for this API key.
const MODEL_FALLBACK_CHAIN = [
    'gemini-2.5-flash', // current GA, primary choice
    'gemini-2.5-flash-lite', // separate quota pool, cheaper, same quality for most tasks
    'gemini-2.0-flash-lite', // separate quota pool, cheaper still
    'gemini-flash-latest', // rolling alias — last resort
];

const DAY_MS = 24 * 60 * 60 * 1_000;
const MINUTE_MS = 60 * 1_000;

const MAX_RETRIES = 3;
const INITIAL_DELAY = 2000;

// ─── Module-level state ──────────────────────────────────────────────────

let genAI = null;
const modelStateCache = new Map(); // modelName → { unavailableUntil: ms, reason: string }

// ─── Public API ──────────────────────────────────────────────────────────

// Initialize the SDK with the API key. Must be called once during server
// startup, before any route is hit.
export function initGemini(apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
}

// One-shot startup probe: hit ListModels and prune any chain entry that
// the API doesn't actually serve `generateContent` on. Saves us from
// learning at runtime that a preview was retired.
export async function probeAvailableModels() {
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

// Structured log helper for every AI call. Grep `[AI]` in Render logs to
// see all Gemini activity. Format: `[AI] op=<label> status=<ok|fail> model=<x>
// latency=<ms> in=<bytes> out=<bytes> retries=<n>`. Caller passes a short
// op label (e.g. 'parse-resume', 'rewrite-summary') via the second arg.
function logAi(level, op, fields) {
    const parts = [`op=${op || 'unknown'}`];
    for (const [k, v] of Object.entries(fields)) {
        if (v != null) parts.push(`${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`);
    }
    const line = `[AI] ${parts.join(' ')}`;
    if (level === 'warn') console.warn(line);
    else if (level === 'error') console.error(line);
    else console.log(line);
}

// Approximate prompt-size in bytes. For text prompts it's the UTF-8 length;
// for multimodal parts we sum text bytes + inlineData base64 length.
function promptBytes(input) {
    if (typeof input === 'string') return Buffer.byteLength(input, 'utf8');
    if (Array.isArray(input)) {
        return input.reduce((sum, p) => {
            if (p.text) return sum + Buffer.byteLength(p.text, 'utf8');
            if (p.inlineData?.data) return sum + p.inlineData.data.length;
            return sum;
        }, 0);
    }
    return 0;
}

// Generate from a plain-text prompt with the fallback chain. Optional
// `schema` constrains output to JSON via responseSchema. `op` is a short
// label for log lines (e.g. 'rewrite-summary', 'match-score').
export async function generateWithFallback(prompt, schema = null, op = 'text') {
    if (!genAI) throw new Error('Gemini not initialized — call initGemini(apiKey) first');

    const available = getAvailableModels();
    if (available.length === 0) {
        const allStates = [...modelStateCache.entries()].map(([m, s]) => `${m} (${s.reason})`).join('; ');
        logAi('error', op, { status: 'fail', reason: 'no-models-available', detail: allStates });
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

    const inBytes = promptBytes(prompt);
    const t0 = Date.now();
    logAi('info', op, { phase: 'start', schema: !!schema, in: inBytes, chain: available.join('|') });

    let lastError = null;
    for (const modelName of available) {
        const modelT0 = Date.now();
        try {
            const model = genAI.getGenerativeModel(modelOptions(modelName));
            const result = await generateContentWithRetry(model, prompt);
            const outBytes = Buffer.byteLength(result || '', 'utf8');
            logAi('info', op, {
                status: 'ok',
                model: modelName,
                latency: Date.now() - t0,
                model_latency: Date.now() - modelT0,
                in: inBytes,
                out: outBytes,
            });
            return result;
        } catch (error) {
            classifyAndMark(modelName, error);
            logAi('warn', op, {
                status: 'model-fail',
                model: modelName,
                latency: Date.now() - modelT0,
                err: (error.message || '').slice(0, 120),
            });
            lastError = error;
        }
    }
    logAi('error', op, {
        status: 'fail',
        latency: Date.now() - t0,
        err: (lastError?.message || 'unknown').slice(0, 200),
    });
    throw lastError;
}

// Generate from multimodal parts (text + inlineData) with the fallback
// chain. Used by the resume-parse endpoint for native PDF input. `op` is a
// short label for log lines.
export async function generateFromParts(parts, schema = null, op = 'parts') {
    if (!genAI) throw new Error('Gemini not initialized — call initGemini(apiKey) first');

    const modelsToTry = getAvailableModels();
    if (modelsToTry.length === 0) {
        const allStates = [...modelStateCache.entries()].map(([m, s]) => `${m} (${s.reason})`).join('; ');
        logAi('error', op, { status: 'fail', reason: 'no-models-available', detail: allStates });
        throw new Error(`All Gemini models currently unavailable. State: ${allStates || 'unknown'}`);
    }

    const inBytes = promptBytes(parts);
    const t0 = Date.now();
    logAi('info', op, { phase: 'start', schema: !!schema, in: inBytes, chain: modelsToTry.join('|') });

    for (const modelName of modelsToTry) {
        const modelT0 = Date.now();
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: schema
                    ? {
                          responseMimeType: 'application/json',
                          responseSchema: schema,
                      }
                    : undefined,
            });
            const result = await generateContentWithRetry(model, parts);
            const outBytes = Buffer.byteLength(result || '', 'utf8');
            logAi('info', op, {
                status: 'ok',
                model: modelName,
                latency: Date.now() - t0,
                model_latency: Date.now() - modelT0,
                in: inBytes,
                out: outBytes,
            });
            return result;
        } catch (error) {
            classifyAndMark(modelName, error);
            logAi('warn', op, {
                status: 'model-fail',
                model: modelName,
                latency: Date.now() - modelT0,
                err: (error.message || '').slice(0, 120),
            });
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
                logAi('error', op, {
                    status: 'fail',
                    latency: Date.now() - t0,
                    err: (error.message || '').slice(0, 200),
                });
                throw error;
            }
        }
    }
}

// ─── Internal helpers ────────────────────────────────────────────────────

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
        // Per-minute rate limit — cool off for 60s; chain falls through
        // in the meantime.
        markModelUnavailable(modelName, MINUTE_MS, 'per-minute rate limit');
    }
}

function getAvailableModels() {
    return MODEL_FALLBACK_CHAIN.filter(isModelAvailable);
}

// True if the 429 is a *daily* quota exhaustion. In that case,
// exponential 2-8s backoff is pointless — the API tells us "retry in
// 30-60 seconds" via RetryInfo. Skip retries and march to the next model.
function isDailyQuotaExhausted(error) {
    const msg = error?.message || '';
    return (
        msg.includes('GenerateRequestsPerDayPerProjectPerModel-FreeTier') ||
        msg.includes('per day') ||
        msg.includes('per-day')
    );
}

// Classify whether an error from the Gemini SDK is worth retrying.
// Includes rate-limit (429) + common transient network/server failures,
// but excludes daily-quota exhaustion (handled by skipping to next model).
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
            if (isDailyQuotaExhausted(error)) {
                console.warn(`Daily quota exhausted for this model — failing fast to next fallback`);
                throw error;
            }
            if (isRetryable(error) && retries < MAX_RETRIES) {
                const delay = INITIAL_DELAY * Math.pow(2, retries);
                console.warn(
                    `Gemini transient error (${error.message}). Retry ${retries + 1}/${MAX_RETRIES} in ${delay}ms`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                retries++;
            } else {
                throw error;
            }
        }
    }
}
