// Generic helpers shared across server routes — no Gemini-specific logic.

// Strip carriage returns, soft hyphens at line breaks, and collapse runs of
// whitespace so resume text we pull out of PDFs / DOCX feeds to the LLM in
// a normalized shape.
export function normalizeRaw(text) {
    if (!text) return '';
    // U+00A0 (non-breaking space) → regular space. Use the unicode escape
    // here because a literal U+00A0 trips ESLint's no-irregular-whitespace.
    let t = text.replace(/\u00A0/g, ' ');
    t = t.replace(/-\n\s*/g, '');
    t = t.replace(/[ \t]{2,}/g, ' ');
    t = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    t = t.replace(/\n{3,}/g, '\n\n');
    return t.trim();
}

// Race a promise against a deadline. Used to bound each Gemini call so a
// hung upstream connection can't lock up the request handler indefinitely.
export function withTimeout(promise, ms, label = 'operation') {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
        ),
    ]);
}

// Pull a JSON object/array out of a Gemini response. Handles the common
// cases where the model wraps output in ```json fences, prepends prose, or
// trails commentary. Throws with a useful message if no valid JSON exists.
//
// We keep this as a defensive fallback even when we request native JSON
// mode — the model still occasionally produces fenced output.
export function extractJson(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Empty response from Gemini');
    }

    let cleaned = text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        /* fall through to bracket extraction */
    }

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
        if (escape) {
            escape = false;
            continue;
        }
        if (ch === '\\' && inString) {
            escape = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (inString) continue;
        if (ch === openChar) depth++;
        else if (ch === closeChar) {
            depth--;
            if (depth === 0) {
                const candidate = cleaned.slice(startIdx, i + 1);
                try {
                    return JSON.parse(candidate);
                } catch (e) {
                    throw new Error(`Found JSON-like block but parse failed: ${e.message}`);
                }
            }
        }
    }
    throw new Error('Unterminated JSON block in Gemini response');
}

// Standard error responder. Keeps the response shape consistent across
// endpoints so the frontend can rely on { error, details } being present.
export function sendError(res, status, error, details) {
    res.status(status).json({
        error,
        details: details || undefined,
    });
}
