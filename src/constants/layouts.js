import { THEMES } from './themes';

export const LAYOUTS = [
    { id: 'google', name: 'Google Style' },
    { id: 'bold-recruit', name: 'Bold Recruit' },
    { id: 'executive-serif', name: 'Executive Serif' },
    { id: 'navy-modern', name: 'Navy Modern' },
    { id: 'minimal-mono', name: 'Minimal Mono' },
    { id: 'canvas', name: 'The Canvas (Pro)' },
    { id: 'classic', name: 'Classic Stack' },
    { id: 'creative', name: 'The Creative' },
    { id: 'jakes', name: "The Engineer (Jake's)" },
    { id: 'freeform', name: 'Freeform Builder' },
    { id: 'sidebar-left', name: 'Left Sidebar' },
    { id: 'sidebar-right', name: 'Right Sidebar' },
    { id: 'minimal', name: 'Minimalist' },
    { id: 'ats', name: 'ATS Friendly' },
    { id: 'executive', name: 'The Executive' },
    { id: 'gold', name: 'The Gold Standard' },
];

// Gallery groups templates by visual character. ATS-safe templates lead each
// category (Modern, Bold, Minimal, Classical). The "Sidebar" and "Creative"
// categories add visual variety for candidates whose roles benefit from
// design signaling (designers, marketers, ICs at startups). Layouts that
// stay hidden:
//   - freeform (too unstructured for most resumes)
//
// All listed layouts are wired through TemplatePreview, so adding one here
// automatically makes it pickable in the gallery and renderable in the
// editor.
export const TEMPLATES = [
    // ─── Modern ─────────────────────────────────────────────────────────
    {
        id: 'google-1',
        name: 'Google Style',
        layout: 'google',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Modern',
    },
    {
        id: 'navy-modern-1',
        name: 'Navy Modern',
        layout: 'navy-modern',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Modern',
    },

    // ─── Bold ───────────────────────────────────────────────────────────
    {
        id: 'bold-recruit-1',
        name: 'Bold Recruit',
        layout: 'bold-recruit',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Bold',
    },
    {
        id: 'jakes-1',
        name: "Engineer (Jake's)",
        layout: 'jakes',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Bold',
    },

    // ─── Minimal ────────────────────────────────────────────────────────
    {
        id: 'ats-1',
        name: 'Standard ATS',
        layout: 'ats',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Minimal',
    },
    {
        id: 'minimal-mono-1',
        name: 'Minimal Mono',
        layout: 'minimal-mono',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Minimal',
    },
    {
        id: 'minimal-1',
        name: 'Minimalist',
        layout: 'minimal',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Minimal',
    },
    {
        id: 'classic-1',
        name: 'Classic Stack',
        layout: 'classic',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Minimal',
    },

    // ─── Classical ──────────────────────────────────────────────────────
    {
        id: 'executive-serif-1',
        name: 'Executive Serif',
        layout: 'executive-serif',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Classical',
    },
    {
        id: 'executive-1',
        name: 'The Executive',
        layout: 'executive',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Classical',
    },

    // ─── Sidebar ────────────────────────────────────────────────────────
    {
        id: 'sidebar-left-1',
        name: 'Left Sidebar',
        layout: 'sidebar-left',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Sidebar',
    },
    {
        id: 'sidebar-right-1',
        name: 'Right Sidebar',
        layout: 'sidebar-right',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Sidebar',
    },

    // ─── Creative ───────────────────────────────────────────────────────
    {
        id: 'creative-1',
        name: 'The Creative',
        layout: 'creative',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Creative',
    },
    {
        id: 'canvas-1',
        name: 'Canvas (Pro)',
        layout: 'canvas',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Creative',
    },
    {
        id: 'gold-1',
        name: 'Gold Standard',
        layout: 'gold',
        theme: THEMES.find((t) => t.id === 'black'),
        category: 'Creative',
    },
];
