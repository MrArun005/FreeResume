// Concurrency queues for expensive routes.
//
// Two routes have hard upper limits on parallelism:
//   - PDF generation: Chromium pages cost ~10-30MB each. On Render's free
//     instance (512MB) we can safely keep ~3-4 pages open concurrently
//     before risking OOM.
//   - Gemini calls: free tier is 15 req/min. Even paid tiers benefit from
//     a soft cap to avoid surprise bills during a burst.
//
// p-queue lets us cap concurrency AND queue overflow gracefully, so a
// burst of 100 requests doesn't fan out to 100 Chromium pages — they
// trickle through at our defined safe rate.
//
// Tuning:
//   - PDF_CONCURRENCY: how many PDFs render simultaneously. Start at 3;
//     bump up if Render instance gets bigger.
//   - GEMINI_CONCURRENCY: caps in-flight AI calls. The Gemini SDK already
//     queues retries on 429, but capping concurrency reduces 429 storms
//     during traffic spikes.
//
// Env overrides let us tune on the deployed instance without a redeploy.

import PQueue from 'p-queue';

const pdfConcurrency = Number(process.env.PDF_CONCURRENCY) || 3;
const geminiConcurrency = Number(process.env.GEMINI_CONCURRENCY) || 5;

export const pdfQueue = new PQueue({
    concurrency: pdfConcurrency,
    // If the queue is already deep, fail fast rather than letting clients
    // hang for minutes. 30s wall-clock gives Chromium plenty of headroom
    // for even a 4-page resume while not letting a stuck job park forever.
    timeout: 30_000,
    throwOnTimeout: true,
});

export const geminiQueue = new PQueue({
    concurrency: geminiConcurrency,
    timeout: 45_000,
    throwOnTimeout: true,
});

// Convenience: run `fn` through the PDF queue. Mirrors q.add() but adds
// a single point to observe queue depth in logs.
export function runPdf(fn) {
    return pdfQueue.add(fn);
}

export function runGemini(fn) {
    return geminiQueue.add(fn);
}

// Tiny status accessor for a future /healthz that reports queue pressure.
export function snapshot() {
    return {
        pdf: { pending: pdfQueue.pending, size: pdfQueue.size, concurrency: pdfQueue.concurrency },
        gemini: {
            pending: geminiQueue.pending,
            size: geminiQueue.size,
            concurrency: geminiQueue.concurrency,
        },
    };
}
