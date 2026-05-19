// Puppeteer browser pool.
//
// Why: launching Chromium per request costs 3-5s CPU and ~200MB RAM.
// On Render's free instance that means ~3 concurrent PDFs before OOM.
// A long-lived browser drops launch overhead to ~0 and lets us serve
// 10× more PDFs per RAM unit. Pages themselves are cheap (~10MB each).
//
// Lifecycle:
//   - Lazy boot on first request — server startup stays fast.
//   - Singleton kept warm for the process lifetime.
//   - Re-boot transparently if the browser dies (crash, OOM, manual close).
//   - Graceful shutdown on SIGTERM / SIGINT so Render can recycle cleanly.
//
// Caller contract:
//   const page = await acquirePage();
//   try { ... } finally { await page.close(); }   // ALWAYS close the page
//
// Pages must be closed or memory leaks (Chromium keeps the tab alive).

import puppeteer from 'puppeteer';

const LAUNCH_OPTIONS = {
    headless: 'new',
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        // Render's free instance has minimal /dev/shm — Chromium otherwise
        // crashes on large pages. Use /tmp instead.
        '--disable-dev-shm-usage',
        // Reduce memory footprint of long-running browsers.
        '--no-zygote',
        '--single-process',
    ],
};

let browserPromise = null;

async function bootBrowser() {
    const browser = await puppeteer.launch(LAUNCH_OPTIONS);
    // If the browser dies for any reason, drop the cached promise so the
    // next request boots a fresh one. Without this, every subsequent
    // request would throw "Connection closed" indefinitely.
    browser.on('disconnected', () => {
        console.warn('[puppeteerPool] browser disconnected — will boot fresh on next request');
        browserPromise = null;
    });
    return browser;
}

// Return the singleton browser, booting it if needed.
function getBrowser() {
    if (!browserPromise) {
        browserPromise = bootBrowser().catch((err) => {
            // Don't cache a rejected promise — let the next caller retry.
            browserPromise = null;
            throw err;
        });
    }
    return browserPromise;
}

// Acquire a fresh page. Caller MUST close it when done (try/finally).
export async function acquirePage() {
    const browser = await getBrowser();
    return browser.newPage();
}

// Graceful shutdown — close the browser before Node exits so Chromium
// child processes don't get orphaned on Render restarts.
async function shutdown() {
    if (!browserPromise) return;
    try {
        const browser = await browserPromise;
        await browser.close();
    } catch {
        /* already gone */
    }
    browserPromise = null;
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
