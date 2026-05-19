// Express entry point. App-level concerns only — middleware, route
// mounting, startup probe. Domain logic lives in routes/ and lib/.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { initGemini, probeAvailableModels } from './lib/gemini.js';
import parseRouter from './routes/parse.js';
import exportRouter from './routes/export.js';
import rewriteRouter from './routes/rewrite.js';
import auditRouter from './routes/audit.js';
import matchRouter from './routes/match.js';
import { snapshot as queueSnapshot } from './lib/queues.js';
import { snapshot as cacheSnapshot } from './lib/cache.js';

dotenv.config();

// Fail fast at startup so the server never silently runs with a missing
// key and only surfaces the problem on the first AI request.
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
    console.error('\n[FATAL] GEMINI_API_KEY is missing from server/.env');
    console.error('  → Create server/.env with: GEMINI_API_KEY=your_key_here');
    console.error('  → Get a key at https://aistudio.google.com/app/apikey\n');
    process.exit(1);
}

initGemini(process.env.GEMINI_API_KEY);

const app = express();
const port = process.env.PORT || 3000;

// Structured request log. Emits one start line + one end line per API call.
// Grep `[HTTP]` in Render logs to scan all traffic. Skips noisy paths like
// healthz so the dashboard isn't flooded by the keep-alive cron.
app.use((req, res, next) => {
    if (req.url === '/api/healthz' || req.url === '/api/log-client') return next();
    const t0 = Date.now();
    const len = req.headers['content-length'] || '0';
    const ua = (req.headers['user-agent'] || '').slice(0, 60);
    console.log(`[HTTP] start method=${req.method} url=${req.url} in_bytes=${len} ua="${ua}"`);
    res.on('finish', () => {
        console.log(
            `[HTTP] end   method=${req.method} url=${req.url} status=${res.statusCode} latency=${Date.now() - t0}ms`
        );
    });
    next();
});

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Mount every route under /api. Each router only exposes its own endpoints,
// so this list is the canonical surface map.
app.use('/api', parseRouter);
app.use('/api', exportRouter);
app.use('/api', rewriteRouter);
app.use('/api', auditRouter);
app.use('/api', matchRouter);

// Client telemetry beacon. Frontend fire-and-forgets here when a user
// clicks any AI feature, so we see the click in Render logs even if the
// real AI call later fails network-side. Best-effort; never errors back
// to the client. Grep `[CLIENT]` to scan user activity.
app.post('/api/log-client', (req, res) => {
    try {
        const { event, op, meta } = req.body || {};
        const safeEvent = (event || 'unknown').slice(0, 40);
        const safeOp = (op || '').slice(0, 40);
        const metaStr = meta
            ? Object.entries(meta)
                  .map(([k, v]) => `${k}=${typeof v === 'string' ? v.slice(0, 200) : JSON.stringify(v)}`)
                  .join(' ')
            : '';
        console.log(`[CLIENT] event=${safeEvent} op=${safeOp} ${metaStr}`);
    } catch {
        // Don't crash the request — telemetry is fire-and-forget.
    }
    res.status(204).end();
});

// Lightweight health + load telemetry. Returns queue depth and cache size
// so we can spot pressure during a traffic spike without enabling full
// observability. Render and most uptime monitors can use this as their
// liveness probe.
app.get('/api/healthz', (_req, res) => {
    res.json({
        ok: true,
        uptime: process.uptime(),
        memMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        queues: queueSnapshot(),
        cache: cacheSnapshot(),
    });
});

const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    // Probe available models async — don't block startup. If the call
    // fails, the chain still works on the first request, just without
    // the optimization.
    probeAvailableModels();
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

export default app;
