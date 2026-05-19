// Export endpoints: PDF (Puppeteer, true-WYSIWYG) and DOCX (structural).
//
// PDF takes a fully rendered HTML document (built client-side from the
// live preview) and prints it to A4 via headless Chromium. DOCX builds a
// Word document directly from the resume data using real Heading/list
// styles so ATS scanners and humans parse it cleanly.

import { Router } from 'express';
import { acquirePage } from '../lib/puppeteerPool.js';
import { runPdf } from '../lib/queues.js';
import { buildResumeDocx } from '../docxBuilder.js';
import { sendError } from '../lib/utils.js';

const router = Router();

// Paper-size table mirroring src/utils/paperSize.js — kept inline (rather
// than imported) so the server has no client-side dependency. Updating both
// when adding a size is cheap (two sizes today, unlikely to grow far).
const PAPER_FORMATS = {
    A4: { format: 'A4', widthPx: 794, heightPx: 1123 },
    letter: { format: 'Letter', widthPx: 816, heightPx: 1056 },
};

router.post('/generate-pdf', async (req, res) => {
    try {
        const { html, paperSize } = req.body;
        if (!html) return res.status(400).json({ error: 'Missing HTML content' });

        const paper = PAPER_FORMATS[paperSize] || PAPER_FORMATS.A4;

        // Run through the PDF concurrency queue so a burst of N requests
        // doesn't fan out to N Chromium pages and OOM the instance.
        // Each task acquires a page from the warm browser pool, uses it,
        // then closes it (NOT the whole browser — that's the win).
        const pdfBuffer = await runPdf(async () => {
            const page = await acquirePage();
            try {
                // Viewport sized to the chosen page so media queries and
                // layout calculations match what the client previewed.
                await page.setViewport({
                    width: paper.widthPx,
                    height: paper.heightPx,
                    deviceScaleFactor: 2,
                });
                await page.setContent(html, { waitUntil: ['load', 'networkidle0'] });
                return await page.pdf({
                    format: paper.format,
                    printBackground: true,
                    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
                    preferCSSPageSize: true,
                    displayHeaderFooter: false,
                });
            } finally {
                await page.close();
            }
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=resume.pdf',
            'Content-Length': pdfBuffer.length,
        });
        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error('PDF Generation Error:', error);
        // If the queue timed out, surface a 503 so the client can fall back
        // to browser print rather than retrying immediately.
        const status = error?.name === 'TimeoutError' ? 503 : 500;
        sendError(res, status, 'Failed to generate PDF', error.message);
    }
});

router.post('/generate-docx', async (req, res) => {
    try {
        const { resumeData, templateId, typography } = req.body;
        if (!resumeData) return res.status(400).json({ error: 'Missing resumeData' });

        const buffer = await buildResumeDocx(resumeData, templateId || 'standard', typography);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': 'attachment; filename=resume.docx',
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    } catch (error) {
        console.error('DOCX Generation Error:', error);
        sendError(res, 500, 'Failed to generate DOCX', error.message);
    }
});

export default router;
