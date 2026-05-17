// True-WYSIWYG PDF export.
//
// The preview is HTML/CSS rendered by React. To get a PDF that's pixel-
// identical, we ship the *same* HTML + CSS to a Chromium instance on the
// server and let it print to PDF. That avoids the drift problem inherent to
// having two separate rendering engines (HTML preview + @react-pdf/renderer).
//
// Flow:
//   1. Find every rendered resume page (`#resume-page-N` divs).
//   2. Serialize them into a standalone HTML document that inlines every
//      same-origin stylesheet on the page (so Tailwind + component styles
//      come along for the ride).
//   3. POST to /api/generate-pdf. The server uses Puppeteer to render the
//      HTML and stream back the PDF bytes.
//   4. If the server is offline or the call fails, fall back to the
//      browser's native print dialog — the print CSS in index.css already
//      hides everything except the resume pages, so the output matches.

// Walk every accessible CSS rule on the page and concatenate them into a
// single string we can drop into a <style> tag. Cross-origin sheets (e.g.
// Google Fonts) throw a SecurityError when read — we skip them and let the
// standalone doc re-fetch via <link> instead.
function collectInlineStyles() {
    let css = '';
    for (const sheet of Array.from(document.styleSheets)) {
        try {
            const rules = sheet.cssRules;
            if (!rules) continue;
            for (const rule of Array.from(rules)) {
                css += rule.cssText + '\n';
            }
        } catch {
            // SecurityError on cross-origin sheets — fine, we re-link below.
        }
    }
    return css;
}

// Pull Google-Fonts (and other external) <link rel=stylesheet> tags out of
// the current <head> so we can replay them in the standalone doc — Chromium
// will fetch them again with `networkidle0` and have the fonts ready before
// printing.
function collectFontLinks() {
    return Array.from(document.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"]'))
        .map((node) => node.outerHTML)
        .join('\n');
}

// Build a self-contained HTML document containing only the resume pages.
// Each page sits in its own block with `page-break-after: always` so
// Puppeteer's pdf() will emit one A4 page per resume page rather than
// merging them.
function buildStandaloneHtml() {
    const pages = Array.from(document.querySelectorAll('[id^="resume-page-"]'));
    if (pages.length === 0) return null;

    // Clone each page and strip the scaling transform on its ancestor (we
    // want 100% size in the printed PDF, not the editor's preview zoom).
    const pageMarkup = pages
        .map((node) => {
            const clone = node.cloneNode(true);
            // Drop preview-only chrome that snuck into the clone (shadows etc.
            // get cleared by the print stylesheet below; this is belt + braces).
            clone.classList.remove('shadow-2xl', 'mb-8');
            return clone.outerHTML;
        })
        .join('\n');

    const inlineCss = collectInlineStyles();
    const fontLinks = collectFontLinks();

    // The override stylesheet at the bottom must beat anything in inlineCss,
    // hence it comes last and uses !important where needed. We force every
    // page to a clean 210mm × 297mm and break to a new page after.
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
${fontLinks}
<style>${inlineCss}</style>
<style>
  @page { size: A4; margin: 0; }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  /* Reset preview-only chrome inside the cloned page divs. */
  [id^="resume-page-"] {
    width: 210mm !important;
    height: 297mm !important;
    min-height: 297mm !important;
    max-height: 297mm !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    overflow: hidden !important;
    transform: none !important;
    page-break-after: always;
    break-after: page;
    background: #ffffff !important;
  }
  [id^="resume-page-"]:last-child {
    page-break-after: auto;
    break-after: auto;
  }
  /* Strip any backdrop-blur / heavy filters that don't translate to print. */
  * { -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }
</style>
</head>
<body>
${pageMarkup}
</body>
</html>`;
}

// Trigger a "save as" download for a Blob.
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Round-trip the preview HTML to the Puppeteer endpoint and download the
// resulting PDF. Throws on any non-2xx so the caller can fall back.
export async function exportPdfViaServer({ filename = 'Resume.pdf' } = {}) {
    const html = buildStandaloneHtml();
    if (!html) throw new Error('Resume preview not ready — pages not found in DOM.');

    const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
    });

    if (!response.ok) {
        let detail = '';
        try {
            detail = (await response.json())?.details || (await response.text());
        } catch {
            /* empty */
        }
        throw new Error(`Server PDF failed (${response.status}): ${detail || 'no detail'}`);
    }

    const blob = await response.blob();
    if (blob.size === 0) throw new Error('Server returned an empty PDF.');
    downloadBlob(blob, filename);
}

// Open the native print dialog. The @media print rules in index.css already
// hide the app chrome and force only the resume pages to render at A4 size,
// so this produces an output that visually matches the preview.
export function exportPdfViaPrint() {
    window.print();
}

// Convenience wrapper used by App.jsx: try server-side first, fall back to
// the browser print dialog if anything goes wrong. Returns a small object
// describing what happened so callers can show appropriate UI ("Saved to
// downloads" vs "Print dialog opened — choose Save as PDF").
export async function exportResumePdf({ filename = 'Resume.pdf' } = {}) {
    try {
        await exportPdfViaServer({ filename });
        return { ok: true, method: 'server' };
    } catch (error) {
        console.warn('[exportPdf] Server export unavailable, falling back to browser print:', error);
        try {
            exportPdfViaPrint();
            return { ok: true, method: 'print', reason: error?.message || String(error) };
        } catch (printError) {
            return { ok: false, method: 'none', reason: printError?.message || String(printError) };
        }
    }
}

// ─── Cover letter PDF export ──────────────────────────────────────────────
//
// Separate pipeline from the resume PDF. The cover letter is a plain block
// of body text (no react preview to clone), so we synthesize the HTML here:
//   - Header block: candidate name + contact line + city, location
//   - Date
//   - Body paragraphs (split on blank lines)
//
// Then round-trip through the same Puppeteer endpoint the resume uses, so
// styling stays consistent and we don't add a second PDF dependency.

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatTodayLong() {
    const now = new Date();
    return now.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function buildCoverLetterHtml({ coverLetter, resumeData }) {
    const personal = resumeData?.personal || {};
    const name = personal.fullName || personal.name || '';
    const title = personal.title || '';
    const contactLine = [personal.email, personal.phone, personal.location]
        .filter(Boolean)
        .map(escapeHtml)
        .join(' · ');

    const paragraphs = (coverLetter || '')
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
        .join('\n');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; background: #ffffff; }
  body {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    color: #111827;
    line-height: 1.55;
    font-size: 11pt;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { width: 210mm; min-height: 297mm; padding: 22mm 24mm; box-sizing: border-box; }
  .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px; }
  .name { font-size: 22pt; font-weight: 700; letter-spacing: -0.01em; margin: 0; }
  .title { font-size: 10.5pt; color: #475569; margin-top: 4px; }
  .contact { font-size: 9.5pt; color: #475569; margin-top: 6px; }
  .date { font-size: 10.5pt; color: #1f2937; margin-bottom: 22px; }
  .salutation { margin-bottom: 14px; }
  .body p { margin: 0 0 12px 0; }
  .closing { margin-top: 22px; }
  .signature { margin-top: 26px; font-weight: 600; }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1 class="name">${escapeHtml(name || 'Your Name')}</h1>
      ${title ? `<div class="title">${escapeHtml(title)}</div>` : ''}
      ${contactLine ? `<div class="contact">${contactLine}</div>` : ''}
    </div>
    <div class="date">${escapeHtml(formatTodayLong())}</div>
    <div class="salutation">Dear Hiring Manager,</div>
    <div class="body">
      ${paragraphs || '<p>(empty cover letter)</p>'}
    </div>
    <div class="closing">Sincerely,</div>
    <div class="signature">${escapeHtml(name || '')}</div>
  </div>
</body>
</html>`;
}

export async function exportCoverLetterPdf({ coverLetter, resumeData, filename = 'CoverLetter.pdf' } = {}) {
    if (!coverLetter || !coverLetter.trim()) return { ok: false, reason: 'No cover letter content.' };

    const html = buildCoverLetterHtml({ coverLetter, resumeData });

    try {
        const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html }),
        });

        if (!response.ok) {
            let detail = '';
            try {
                detail = (await response.json())?.details || (await response.text());
            } catch {
                /* empty */
            }
            return { ok: false, reason: `Server PDF failed (${response.status}): ${detail || 'no detail'}` };
        }

        const blob = await response.blob();
        if (blob.size === 0) return { ok: false, reason: 'Server returned an empty PDF.' };
        downloadBlob(blob, filename);
        return { ok: true };
    } catch (error) {
        return { ok: false, reason: error?.message || String(error) };
    }
}

// DOCX export — completely separate pipeline from PDF. The server's
// /api/generate-docx endpoint builds a structurally clean Word document
// from the resume data (not the HTML), which gives recruiters something
// they can edit and ATS scanners something they can parse cleanly.
//
// There is no graceful fallback for DOCX: if the server is down, we surface
// the error rather than trying to fabricate a DOCX in the browser (the
// libraries that do this are ~600 KB and produce inferior output).
export async function exportResumeDocx({ resume, templateId, filename = 'Resume.docx' } = {}) {
    if (!resume) return { ok: false, reason: 'No resume provided.' };

    try {
        const response = await fetch('/api/generate-docx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeData: resume, templateId }),
        });

        if (!response.ok) {
            let detail = '';
            try {
                detail = (await response.json())?.details || (await response.text());
            } catch {
                /* empty */
            }
            return { ok: false, reason: `Server DOCX failed (${response.status}): ${detail || 'no detail'}` };
        }

        const blob = await response.blob();
        if (blob.size === 0) return { ok: false, reason: 'Server returned an empty DOCX.' };
        downloadBlob(blob, filename);
        return { ok: true };
    } catch (error) {
        return { ok: false, reason: error?.message || String(error) };
    }
}
