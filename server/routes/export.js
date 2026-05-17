// Export endpoints: PDF (Puppeteer, true-WYSIWYG) and DOCX (structural).
//
// PDF takes a fully rendered HTML document (built client-side from the
// live preview) and prints it to A4 via headless Chromium. DOCX builds a
// Word document directly from the resume data using real Heading/list
// styles so ATS scanners and humans parse it cleanly.

import { Router } from 'express';
import puppeteer from 'puppeteer';
import { buildResumeDocx } from '../docxBuilder.js';
import { sendError } from '../lib/utils.js';

const router = Router();

router.post('/generate-pdf', async (req, res) => {
    let browser = null;
    try {
        const { html } = req.body;
        if (!html) return res.status(400).json({ error: 'Missing HTML content' });

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
        });
        const page = await browser.newPage();

        // Viewport sized to A4 so media queries and layout calculations
        // match what the client previewed.
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

        await page.setContent(html, {
            waitUntil: ['load', 'networkidle0'],
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
            preferCSSPageSize: true,
            displayHeaderFooter: false,
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=resume.pdf',
            'Content-Length': pdfBuffer.length,
        });
        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error('PDF Generation Error:', error);
        sendError(res, 500, 'Failed to generate PDF', error.message);
    } finally {
        if (browser) await browser.close();
    }
});

router.post('/generate-docx', async (req, res) => {
    try {
        const { resumeData, templateId } = req.body;
        if (!resumeData) return res.status(400).json({ error: 'Missing resumeData' });

        const buffer = await buildResumeDocx(resumeData, templateId || 'standard');
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
