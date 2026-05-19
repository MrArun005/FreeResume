// Page-size table + helpers. Single source of truth for resume paper
// dimensions across preview, print CSS, PDF (Puppeteer), and DOCX export.
//
// The chosen size lives on `resume.paperSize` (persisted with the resume),
// so different profiles can target different markets — A4 for EU/India,
// US Letter for North America.
//
// Render path: an effect in App.jsx writes `--page-width` / `--page-height`
// CSS custom properties to `:root`. Every dimension referenced in CSS or
// JSX is `var(--page-width)` / `var(--page-height)` — no hardcoded mm.

export const PAPER_SIZES = {
    A4: {
        key: 'A4',
        label: 'A4',
        description: '210 × 297 mm — Europe, India, most of the world',
        widthMm: 210,
        heightMm: 297,
        // Puppeteer's page.pdf() format string.
        pdfFormat: 'A4',
        // docx library page dimensions in twips (1 mm ≈ 56.7 twips).
        // 11906 × 16838 = A4 in twips, per the OOXML spec.
        docxTwips: { width: 11906, height: 16838 },
        // Pagination ceiling — the layout's overflow:hidden clips at the
        // physical page height, but we stop adding sections earlier to
        // avoid a half-empty bottom. Tuned per A4 height in px @ 96dpi
        // (297mm ≈ 1123px); the existing per-layout offsets are baked
        // into App.jsx so this is the default baseline.
        ceilingPx: 1115,
    },
    letter: {
        key: 'letter',
        label: 'US Letter',
        description: '8.5 × 11 in — United States, Canada',
        widthMm: 215.9,
        heightMm: 279.4,
        pdfFormat: 'Letter',
        // 12240 × 15840 twips = 8.5in × 11in.
        docxTwips: { width: 12240, height: 15840 },
        // Letter is ~17mm shorter than A4 vertically; that's ~64px less
        // budget @96dpi. Subtract from the A4 ceiling to keep the same
        // bottom whitespace feel.
        ceilingPx: 1050,
    },
};

export const DEFAULT_PAPER_SIZE = 'A4';

export function getPaperSize(key) {
    return PAPER_SIZES[key] || PAPER_SIZES[DEFAULT_PAPER_SIZE];
}

export function resolvePaperSize(resume) {
    return getPaperSize(resume?.paperSize);
}

// Write the dimensions into CSS custom properties on :root. Called from
// App.jsx as an effect on resume.paperSize. Layouts and print CSS reference
// var(--page-width) / var(--page-height) so a single toggle propagates
// everywhere without per-component plumbing.
export function applyPaperSizeToDocument(paperSize) {
    if (typeof document === 'undefined') return;
    const size = getPaperSize(paperSize);
    const root = document.documentElement;
    root.style.setProperty('--page-width', `${size.widthMm}mm`);
    root.style.setProperty('--page-height', `${size.heightMm}mm`);
}

// Margin/whitespace presets. Implemented as a content scale rather than
// per-layout padding edits — CSS targets `.resume-paper > *:first-child`
// and applies transform: scale(--page-content-scale). The layout still
// renders at full page dimensions, but visually shrinks toward center,
// producing an even white border. This is the only approach that doesn't
// require touching all 18 layouts' internal padding.
export const PAGE_MARGIN_PRESETS = {
    compact: { label: 'Compact', scale: 1.04, description: 'Slightly tighter — fit more on the page.' },
    standard: { label: 'Standard', scale: 1.0, description: 'Default — exactly as the layout was designed.' },
    spacious: { label: 'Spacious', scale: 0.94, description: 'More breathing room around the content.' },
};

export const DEFAULT_PAGE_MARGINS = 'standard';

export function applyPageMargins(preset) {
    if (typeof document === 'undefined') return;
    const cfg = PAGE_MARGIN_PRESETS[preset] || PAGE_MARGIN_PRESETS[DEFAULT_PAGE_MARGINS];
    document.documentElement.style.setProperty('--page-content-scale', String(cfg.scale));
}

// Accent color override. `null` means "no override" — clear the variable so
// each layout's built-in fallback wins. Any valid CSS color string works.
export function applyAccentColor(hexOrCss) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (!hexOrCss) {
        root.style.removeProperty('--resume-accent');
    } else {
        root.style.setProperty('--resume-accent', hexOrCss);
    }
}

// Header alignment: 'left' | 'center' | 'right'. Sets two CSS variables:
// --resume-header-align drives text-align on #section-personal,
// --resume-header-justify drives flex containers inside it so contact
// chips and social icons follow the same alignment.
export function applyHeaderAlignment(align) {
    if (typeof document === 'undefined') return;
    const safe = align === 'center' || align === 'right' ? align : 'left';
    const justify = { left: 'flex-start', center: 'center', right: 'flex-end' }[safe];
    const root = document.documentElement;
    root.style.setProperty('--resume-header-align', safe);
    root.style.setProperty('--resume-header-justify', justify);
}

export const ACCENT_PRESETS = [
    { key: 'navy', label: 'Navy', value: '#1E3A8A' },
    { key: 'blue', label: 'Blue', value: '#1a73e8' },
    { key: 'teal', label: 'Teal', value: '#0d9488' },
    { key: 'emerald', label: 'Emerald', value: '#059669' },
    { key: 'maroon', label: 'Maroon', value: '#9F1239' },
    { key: 'red', label: 'Red', value: '#DC2626' },
    { key: 'amber', label: 'Amber', value: '#B45309' },
    { key: 'slate', label: 'Slate', value: '#334155' },
];
