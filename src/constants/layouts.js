import { THEMES } from './themes';

export const LAYOUTS = [
    { id: 'google', name: 'Google Style' },
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

export const TEMPLATES = [
    // Featured — the famous Google-recruitment style
    { id: 'google-1', name: 'Google Style', layout: 'google', theme: THEMES.find(t => t.id === 'black'), category: 'ATS Friendly' },

    // Professional
    { id: 'prof-1', name: 'Classic Professional', layout: 'classic', theme: THEMES.find(t => t.id === 'black'), category: 'Professional' },

    // ATS Friendly
    { id: 'ats-1', name: 'Standard ATS', layout: 'ats', theme: THEMES.find(t => t.id === 'black'), category: 'ATS Friendly' },
    { id: 'ats-2', name: 'The Engineer', layout: 'jakes', theme: THEMES.find(t => t.id === 'black'), category: 'ATS Friendly' },
    { id: 'ats-3', name: 'The Designer', layout: 'deedy', theme: THEMES.find(t => t.id === 'black'), category: 'ATS Friendly' },

    // Entry Level
    { id: 'entry-1', name: 'Clean Minimalist', layout: 'minimal', theme: THEMES.find(t => t.id === 'white'), category: 'Entry Level' },
];
