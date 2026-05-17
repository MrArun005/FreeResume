// LandedJob design tokens.
//
// Single source of truth for the brand color scale + theme presets. The
// scale follows Tailwind's 50–900 convention so existing utility classes
// (bg-brand-600, text-brand-700, etc.) map directly through the
// tailwind.config.js `brand` color entry, which itself references CSS
// custom properties so themes can swap at runtime without rebuilding.
//
// Add a new preset → applyTheme(presetName) at runtime → every component
// using `brand-*` classes (or referencing `var(--brand-...)` directly)
// repaints in place. No re-render needed.

const TEAL = {
    name: 'LandedJob Teal',
    description: 'The default. Calm professional teal that pairs cleanly with slate UI.',
    scale: {
        50: '#F0FDFA',
        100: '#CCFBF1',
        200: '#99F6E4',
        300: '#5EEAD4',
        400: '#2DD4BF',
        500: '#14B8A6',
        600: '#0D9488',
        700: '#0F766E',
        800: '#115E59',
        900: '#134E4A',
    },
};

const INDIGO = {
    name: 'Indigo Premium',
    description: 'Confident, modern, SaaS-friendly. Pairs well with grayscale UI.',
    scale: {
        50: '#EEF2FF',
        100: '#E0E7FF',
        200: '#C7D2FE',
        300: '#A5B4FC',
        400: '#818CF8',
        500: '#6366F1',
        600: '#4F46E5',
        700: '#4338CA',
        800: '#3730A3',
        900: '#312E81',
    },
};

const AMBER = {
    name: 'Slate Noir',
    description: 'Editorial dark primary with warm amber accents. Premium feel.',
    scale: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F59E0B',
        600: '#D97706',
        700: '#B45309',
        800: '#92400E',
        900: '#78350F',
    },
};

const ROSE = {
    name: 'Rose',
    description: 'Warm pink-red — distinctive without being aggressive.',
    scale: {
        50: '#FFF1F2',
        100: '#FFE4E6',
        200: '#FECDD3',
        300: '#FDA4AF',
        400: '#FB7185',
        500: '#F43F5E',
        600: '#E11D48',
        700: '#BE123C',
        800: '#9F1239',
        900: '#881337',
    },
};

const EMERALD = {
    name: 'Emerald',
    description: 'Fresh green — energy + growth. Strong contrast on white.',
    scale: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
        800: '#065F46',
        900: '#064E3B',
    },
};

export const THEMES = {
    teal: TEAL,
    indigo: INDIGO,
    amber: AMBER,
    rose: ROSE,
    emerald: EMERALD,
};

export const DEFAULT_THEME = 'teal';
const STORAGE_KEY = 'paperjetTheme';

// ─────────────────────────────────────────────────────────────────────────
// Font family presets for the rendered resume.
//
// Each preset is one CSS font-family stack the user can pick from in the
// theme modal. The active stack is written to the `--resume-font-family`
// CSS custom property; src/index.css uses that variable on `.resume-paper`
// and overrides Tailwind's `font-sans`/`font-serif`/`font-mono` classes
// inside the resume so the user's choice wins regardless of which template
// they're on.
//
// Fonts are chosen for ATS-friendliness: every option resolves to a
// widely-installed system fallback, so PDF parsers handle them cleanly.
// Inter and Instrument Serif are already preloaded via index.html.
export const FONT_FAMILIES = {
    inter: {
        name: 'Inter',
        description: 'Modern sans-serif. The default. Crisp on screen and in PDF.',
        stack: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    },
    classicSans: {
        name: 'Helvetica',
        description: 'The recruiter-safe classic. Universally readable, ATS-favored.',
        stack: 'Helvetica, Arial, "Liberation Sans", sans-serif',
    },
    instrumentSerif: {
        name: 'Instrument Serif',
        description: 'Editorial serif with personality. Great for design / writing roles.',
        stack: '"Instrument Serif", Georgia, "Times New Roman", serif',
    },
    classicSerif: {
        name: 'Georgia',
        description: 'Traditional serif. Reads like a thoughtful résumé from a senior pro.',
        stack: 'Georgia, "Times New Roman", Times, serif',
    },
    mono: {
        name: 'Share Tech Mono',
        description: 'Technical monospace. Distinctive — best for dev / engineering roles.',
        stack: '"Share Tech Mono", "JetBrains Mono", Menlo, Consolas, monospace',
    },
};

export const DEFAULT_FONT = 'inter';
const FONT_STORAGE_KEY = 'paperjetFont';

// ─────────────────────────────────────────────────────────────────────────
// Size scale presets for the rendered resume.
//
// Each preset is a multiplier written to `--resume-font-size` as a px
// value (computed from a 16px base). It's applied to `.resume-paper` so
// text using inheritance (em, %, no Tailwind class) scales naturally.
//
// IMPORTANT — partial scope: Tailwind's `text-sm` / `text-base` etc.
// resolve to absolute rem values against :root, not the resume wrapper.
// So those elements don't scale with this control. The setting still has
// real effect on layouts that use em-based sizing and on every element
// without an explicit size class. To make it scale every text element,
// every layout's text-* classes would need to be refactored to use em or
// CSS calc() with `var(--resume-font-size)`. That's a follow-up.
export const FONT_SIZES = {
    compact: { name: 'Compact', description: 'Fit more on the page.', basePx: 14 },
    normal: { name: 'Normal', description: 'The default. Balanced.', basePx: 16 },
    comfortable: { name: 'Comfortable', description: 'Easier to read aloud.', basePx: 18 },
};

export const DEFAULT_SIZE = 'normal';
const SIZE_STORAGE_KEY = 'paperjetSize';

// Convert "#RRGGBB" → "R, G, B" for CSS rgba(var(--brand-500-rgb), 0.2) style use.
function hexToRgbTuple(hex) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

// Push a theme's color scale into CSS custom properties on :root. Every
// `--brand-N` lands as both a hex value (for direct use) and an `--brand-N-rgb`
// tuple (for alpha overlays). Calling this with the same theme name is a
// no-op-style cheap operation, so it's safe to call on every mount.
export function applyTheme(themeName) {
    const theme = THEMES[themeName] || THEMES[DEFAULT_THEME];
    const root = document.documentElement;
    for (const [shade, hex] of Object.entries(theme.scale)) {
        root.style.setProperty(`--brand-${shade}`, hex);
        root.style.setProperty(`--brand-${shade}-rgb`, hexToRgbTuple(hex));
    }
    // Convenience aliases for the most common usages.
    root.style.setProperty('--brand-primary', theme.scale[600]);
    root.style.setProperty('--brand-primary-hover', theme.scale[700]);
    root.style.setProperty('--brand-primary-soft', theme.scale[50]);
    root.style.setProperty('--brand-500-alpha-20', `rgba(${hexToRgbTuple(theme.scale[500])}, 0.20)`);
    // Track which theme is active so React/devs can read it back.
    root.dataset.paperjetTheme = themeName in THEMES ? themeName : DEFAULT_THEME;
}

export function loadSavedTheme() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && THEMES[saved]) return saved;
    } catch {
        /* private mode */
    }
    return DEFAULT_THEME;
}

export function saveTheme(themeName) {
    try {
        localStorage.setItem(STORAGE_KEY, themeName);
    } catch {
        /* private mode */
    }
}

// One-shot init for main.jsx: load saved theme + apply before first paint.
export function initTheme() {
    const name = loadSavedTheme();
    applyTheme(name);
    applyFont(loadSavedFont());
    applySize(loadSavedSize());
    return name;
}

// ─────────────────────────────────────────────────────────────────────────
// Font family controls — same shape as the theme helpers above.

export function applyFont(fontKey) {
    const font = FONT_FAMILIES[fontKey] || FONT_FAMILIES[DEFAULT_FONT];
    document.documentElement.style.setProperty('--resume-font-family', font.stack);
    document.documentElement.dataset.paperjetFont = fontKey in FONT_FAMILIES ? fontKey : DEFAULT_FONT;
}

export function loadSavedFont() {
    try {
        const saved = localStorage.getItem(FONT_STORAGE_KEY);
        if (saved && FONT_FAMILIES[saved]) return saved;
    } catch {
        /* private mode */
    }
    return DEFAULT_FONT;
}

export function saveFont(fontKey) {
    try {
        localStorage.setItem(FONT_STORAGE_KEY, fontKey);
    } catch {
        /* private mode */
    }
}

// ─────────────────────────────────────────────────────────────────────────
// Size scale controls — same shape.

export function applySize(sizeKey) {
    const size = FONT_SIZES[sizeKey] || FONT_SIZES[DEFAULT_SIZE];
    document.documentElement.style.setProperty('--resume-font-size', `${size.basePx}px`);
    document.documentElement.dataset.paperjetSize = sizeKey in FONT_SIZES ? sizeKey : DEFAULT_SIZE;
}

export function loadSavedSize() {
    try {
        const saved = localStorage.getItem(SIZE_STORAGE_KEY);
        if (saved && FONT_SIZES[saved]) return saved;
    } catch {
        /* private mode */
    }
    return DEFAULT_SIZE;
}

export function saveSize(sizeKey) {
    try {
        localStorage.setItem(SIZE_STORAGE_KEY, sizeKey);
    } catch {
        /* private mode */
    }
}
