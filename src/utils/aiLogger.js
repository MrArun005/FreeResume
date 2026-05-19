// Client-side AI telemetry. Three guarantees:
//   1. Every AI feature click is console.logged to the browser devtools
//      (useful when debugging live with a user on the line).
//   2. The same event is fire-and-forget POSTed to /api/log-client so it
//      lands in Render logs — covering the case where the actual AI call
//      fails before reaching the server (network drop, browser timeout,
//      user navigates away). Without this, those clicks would be invisible.
//   3. apiFetch wraps fetch so every backend call auto-logs start + end
//      with timing, status, and bytes. Drop-in replacement for fetch().
//
// Logs use a `[CLIENT]` prefix so they're grep-friendly alongside the
// server's `[HTTP]` and `[AI]` lines.

const BEACON_URL = '/api/log-client';

// Fire-and-forget beacon to the server. Uses sendBeacon when available
// (survives page unload) and falls back to fetch with keepalive otherwise.
function sendBeacon(payload) {
    try {
        const body = JSON.stringify(payload);
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const blob = new Blob([body], { type: 'application/json' });
            navigator.sendBeacon(BEACON_URL, blob);
            return;
        }
        // Last resort — fetch with keepalive so it survives unload.
        fetch(BEACON_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
        }).catch(() => {
            /* fire-and-forget — never block the user */
        });
    } catch {
        /* never throw — telemetry must never break the app */
    }
}

// Log a user-facing AI click event. Call from button onClick handlers
// BEFORE the network request fires, so we capture the intent even if the
// subsequent call never reaches the server.
export function logAiClick(op, meta = {}) {
    const ts = new Date().toISOString();
    const fields = Object.entries(meta)
        .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
        .join(' ');
    console.log(`[CLIENT] ai-click op=${op} ${fields} ts=${ts}`);
    sendBeacon({ event: 'ai-click', op, meta });
}

// Wrapper around fetch that auto-logs start + end. Use for any /api/* call
// — AI or otherwise. The op label appears in console + beacon so the user's
// activity is traceable end-to-end (click → fetch start → server log → fetch
// end).
export async function apiFetch(url, options = {}, op = 'api') {
    const t0 = Date.now();
    const method = (options.method || 'GET').toUpperCase();
    const inBytes = options.body
        ? typeof options.body === 'string'
            ? options.body.length
            : options.body.size || 0
        : 0;
    console.log(`[CLIENT] fetch-start op=${op} ${method} ${url} in_bytes=${inBytes}`);
    sendBeacon({ event: 'fetch-start', op, meta: { url, method, in_bytes: inBytes } });
    try {
        const response = await fetch(url, options);
        const latency = Date.now() - t0;
        console.log(
            `[CLIENT] fetch-end op=${op} ${method} ${url} status=${response.status} latency=${latency}ms`
        );
        sendBeacon({
            event: 'fetch-end',
            op,
            meta: { url, status: response.status, latency },
        });
        return response;
    } catch (err) {
        const latency = Date.now() - t0;
        console.error(
            `[CLIENT] fetch-fail op=${op} ${method} ${url} err="${err.message}" latency=${latency}ms`
        );
        sendBeacon({
            event: 'fetch-fail',
            op,
            meta: { url, err: err.message?.slice(0, 200), latency },
        });
        throw err;
    }
}
