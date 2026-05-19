// In-memory TTL cache for Gemini responses.
//
// Why: 30-50% of JD-driven requests are duplicates within a short window
//   - User clicks Analyze, sees results, tweaks resume, clicks Analyze again
//   - Multiple users paste the same public JD (LinkedIn job posting)
//   - Same resume re-analyzed against the same JD across sessions
//
// Skipping the model call saves ~2s latency, ~$0.001 per cache hit on
// paid Gemini tier, and counts against the free-tier RPM budget.
//
// Why not Redis: single-instance deployment doesn't benefit from external
// cache; the cost of network roundtrip exceeds the saved compute. If we
// ever go horizontal, swap this module's internals — the API stays.
//
// Keys are sha256 of a canonical JSON serialization of all inputs that
// affect the model output. Order-stable so {a:1,b:2} and {b:2,a:1} hash
// the same. Bound the cache size so a long-running process can't OOM.

import { createHash } from 'crypto';

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 500; // ~3-5MB at typical response sizes

// Map preserves insertion order so we can do O(1) LRU eviction.
const store = new Map();

function canonicalStringify(value) {
    // JSON.stringify with object-key sort, so equivalent shapes hash equal.
    return JSON.stringify(value, (_, v) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            return Object.keys(v)
                .sort()
                .reduce((acc, k) => ((acc[k] = v[k]), acc), {});
        }
        return v;
    });
}

export function makeKey(namespace, ...parts) {
    const payload = canonicalStringify({ ns: namespace, parts });
    return createHash('sha256').update(payload).digest('hex');
}

export function get(key) {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
        store.delete(key);
        return undefined;
    }
    // Touch — move to end so LRU eviction targets stale-by-access items.
    store.delete(key);
    store.set(key, entry);
    return entry.value;
}

export function set(key, value, ttlMs = DEFAULT_TTL_MS) {
    if (store.size >= MAX_ENTRIES) {
        // Evict oldest (first inserted / least recently used).
        const oldestKey = store.keys().next().value;
        if (oldestKey !== undefined) store.delete(oldestKey);
    }
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

// Wrap an async producer with cache-aside semantics. Most callers use this.
export async function memoize(key, producer, ttlMs = DEFAULT_TTL_MS) {
    const hit = get(key);
    if (hit !== undefined) return hit;
    const value = await producer();
    set(key, value, ttlMs);
    return value;
}

export function snapshot() {
    return { entries: store.size, maxEntries: MAX_ENTRIES };
}
