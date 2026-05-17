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
    { id: 'deedy', name: "The Designer (Deedy's)" },
    { id: 'modern-grid', name: 'Modern Grid' },
    { id: 'jakes', name: "The Engineer (Jake's)" },
    { id: 'freeform', name: "Freeform Builder" },
    { id: 'sidebar-left', name: 'Left Sidebar' },
    { id: 'sidebar-right', name: 'Right Sidebar' },
    { id: 'minimal', name: 'Minimalist' },
    { id: 'ats', name: 'ATS Friendly' },
    { id: 'glitch', name: 'The Glitch (Cyberpunk)' },
    { id: 'executive', name: 'The Executive' },
    { id: 'leaf', name: 'The Leaf (Organic)' },
    { id: 'gold', name: 'The Gold Standard' },
];

// Gallery is curated to ATS-safe templates only (estimated parse rate ≥ ~85%).
// The remaining layout files in src/components/layouts/ are intentionally retained
// on disk — they're hidden from the picker but available if we ever choose to
// re-surface them (e.g. behind a "Creative / Visual" gallery tab).
//
// ATS audit summary at curation time:
//  ✅ google           — 88-93%  (Google Style)            modern blue accent
//  ✅ ats              — 90-95%  (Standard ATS)            plain sans, icons + text
//  ✅ bold-recruit     — 82-88%  (Bold Recruit)            red accent, recruiter scan
//  ✅ executive-serif  — 92-95%  (Executive Serif)         B&W Georgia serif, centered
//  ✅ navy-modern      — 88-92%  (Navy Modern)             corporate navy, sans-serif
//  ✅ minimal-mono     — 93-96%  (Minimal Mono)            extreme minimal, B&W
//  ❌ classic, jakes, modern-grid, executive, minimal, gold, sidebar-*, creative,
//     deedy, leaf, glitch, freeform, canvas — all under threshold, hidden from gallery.
export const TEMPLATES = [
    // Modern recruiter-friendly with subtle color accents
    { id: 'google-1', name: 'Google Style', layout: 'google', theme: THEMES.find(t => t.id === 'black'), category: 'Modern' },
    { id: 'navy-modern-1', name: 'Navy Modern', layout: 'navy-modern', theme: THEMES.find(t => t.id === 'black'), category: 'Modern' },

    // Bold / high-contrast
    { id: 'bold-recruit-1', name: 'Bold Recruit', layout: 'bold-recruit', theme: THEMES.find(t => t.id === 'black'), category: 'Bold' },

    // Pure black-and-white, maximum ATS parseability
    { id: 'ats-1', name: 'Standard ATS', layout: 'ats', theme: THEMES.find(t => t.id === 'black'), category: 'Minimal' },
    { id: 'minimal-mono-1', name: 'Minimal Mono', layout: 'minimal-mono', theme: THEMES.find(t => t.id === 'black'), category: 'Minimal' },

    // Classical / professional
    { id: 'executive-serif-1', name: 'Executive Serif', layout: 'executive-serif', theme: THEMES.find(t => t.id === 'black'), category: 'Classical' },
];
