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

app.use((req, res, next) => {
    console.log(`[DEBUG] Request: ${req.method} ${req.url}`);
    console.log(`[DEBUG] Content-Length: ${req.headers['content-length']}`);
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
