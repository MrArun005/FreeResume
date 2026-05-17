import React, { useState } from 'react';
import { X, Palette, Check } from 'lucide-react';
import { THEMES, applyTheme, saveTheme, loadSavedTheme } from '../../theme/tokens';

// Settings panel for the design system. Shows every available theme preset
// as a swatch row + currently-active token values so the user can both
// switch themes and see exactly what colors are in play.
//
// Theme switches are instant: applyTheme() rewrites the CSS custom properties
// on :root, every `brand-*` Tailwind class repaints immediately. Persistence
// happens via saveTheme() into localStorage.
const ThemeSettingsModal = ({ isOpen, onClose }) => {
    const [activeTheme, setActiveTheme] = useState(loadSavedTheme);

    if (!isOpen) return null;

    const handleSelect = (themeKey) => {
        setActiveTheme(themeKey);
        applyTheme(themeKey);
        saveTheme(themeKey);
    };

    const currentTheme = THEMES[activeTheme] || THEMES.teal;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[100] p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
                style={{ boxShadow: '0 25px 50px -12px rgba(15,23,42,0.30)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-600)' }}>
                            <Palette size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 tracking-tight m-0">Design & Theme</h2>
                            <p className="text-[12px] text-slate-500 m-0">Brand colors used across the app.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 transition-colors" aria-label="Close">
                        <X size={20} />
                    </button>
                </header>

                <div className="px-6 py-5 overflow-y-auto space-y-6">
                    {/* Preset list */}
                    <div>
                        <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3">Themes</h3>
                        <div className="space-y-2">
                            {Object.entries(THEMES).map(([key, theme]) => {
                                const isActive = key === activeTheme;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleSelect(key)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all ${
                                            isActive
                                                ? 'border-slate-900 bg-slate-50'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        {/* Swatch strip showing the full scale */}
                                        <div className="flex shrink-0 rounded-md overflow-hidden border border-slate-200">
                                            {[300, 500, 600, 700, 800].map((shade) => (
                                                <div
                                                    key={shade}
                                                    className="w-6 h-8"
                                                    style={{ background: theme.scale[shade] }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                                                {theme.name}
                                                {isActive && <Check size={14} className="text-emerald-600" />}
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">{theme.description}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Token inspector — the active theme's scale, hex values, and a
                        live preview of buttons / pills using brand-* classes. */}
                    <div>
                        <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3">Token inspector</h3>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-5 gap-px bg-slate-100">
                                {Object.entries(currentTheme.scale).map(([shade, hex]) => (
                                    <div key={shade} className="bg-white p-2 text-center">
                                        <div className="w-full h-8 rounded mb-1.5" style={{ background: hex }} />
                                        <div className="text-[10px] text-slate-500 font-mono">{shade}</div>
                                        <div className="text-[10px] text-slate-700 font-mono">{hex.toUpperCase()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Live preview using brand-* utility classes */}
                    <div>
                        <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3">Live preview</h3>
                        <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-md transition-colors">
                                    Primary button
                                </button>
                                <button className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold rounded-md hover:bg-brand-100 transition-colors">
                                    Secondary
                                </button>
                                <span className="px-2.5 py-1 bg-brand-100 text-brand-800 text-xs font-medium rounded">
                                    Pill
                                </span>
                            </div>
                            <div className="text-xs text-slate-600">
                                Link styling: <a className="text-brand-700 underline hover:text-brand-800">resume.paperjet.app</a>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                        Done
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ThemeSettingsModal;
