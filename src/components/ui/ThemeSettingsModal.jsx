import React, { useState } from 'react';
import {
    X,
    Palette,
    Check,
    Type,
    AArrowUp,
    Heading,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    FileText,
    Maximize2,
    Droplet,
    ScanLine,
} from 'lucide-react';
import { PAPER_SIZES, PAGE_MARGIN_PRESETS, ACCENT_PRESETS } from '../../utils/paperSize';
import {
    THEMES,
    applyTheme,
    saveTheme,
    loadSavedTheme,
    FONT_FAMILIES,
    applyFont,
    saveFont,
    loadSavedFont,
    FONT_SIZES,
    applySize,
    saveSize,
    loadSavedSize,
    HEADING_SIZES,
    applyHeadingSize,
    saveHeadingSize,
    loadSavedHeadingSize,
    BODY_SIZES,
    applyBodySize,
    saveBodySize,
    loadSavedBodySize,
    BULLET_SIZES,
    applyBulletSize,
    saveBulletSize,
    loadSavedBulletSize,
} from '../../theme/tokens';

// Settings panel for the design system. Shows every available theme preset
// as a swatch row + currently-active token values so the user can both
// switch themes and see exactly what colors are in play.
//
// Theme switches are instant: applyTheme() rewrites the CSS custom properties
// on :root, every `brand-*` Tailwind class repaints immediately. Persistence
// happens via saveTheme() into localStorage.
const ThemeSettingsModal = ({ isOpen, onClose, resume, onResumeChange, onOpenAtsPreview }) => {
    const [activeTheme, setActiveTheme] = useState(loadSavedTheme);
    const [activeFont, setActiveFont] = useState(loadSavedFont);
    const [activeSize, setActiveSize] = useState(loadSavedSize);
    const [activeHeadingSize, setActiveHeadingSize] = useState(loadSavedHeadingSize);
    const [activeBodySize, setActiveBodySize] = useState(loadSavedBodySize);
    const [activeBulletSize, setActiveBulletSize] = useState(loadSavedBulletSize);

    if (!isOpen) return null;

    const handleSelect = (themeKey) => {
        setActiveTheme(themeKey);
        applyTheme(themeKey);
        saveTheme(themeKey);
    };

    const handleFontSelect = (fontKey) => {
        setActiveFont(fontKey);
        applyFont(fontKey);
        saveFont(fontKey);
    };

    const handleSizeSelect = (sizeKey) => {
        setActiveSize(sizeKey);
        applySize(sizeKey);
        saveSize(sizeKey);
    };

    const handleHeadingSizeSelect = (key) => {
        setActiveHeadingSize(key);
        applyHeadingSize(key);
        saveHeadingSize(key);
    };

    const handleBodySizeSelect = (key) => {
        setActiveBodySize(key);
        applyBodySize(key);
        saveBodySize(key);
    };

    const handleBulletSizeSelect = (key) => {
        setActiveBulletSize(key);
        applyBulletSize(key);
        saveBulletSize(key);
    };

    // Shared renderer for the three element-type size pickers — same shape
    // (3 options × {name, description, px}), same visual pattern. Extracted
    // so the markup stays scannable rather than three near-identical blocks.
    const renderSizePicker = ({ icon, label, presets, activeKey, onSelect, sampleText }) => (
        <div>
            <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                {icon} {label}
            </h3>
            <div className="grid grid-cols-3 gap-2">
                {Object.entries(presets).map(([key, preset]) => {
                    const isActive = key === activeKey;
                    return (
                        <button
                            key={key}
                            onClick={() => onSelect(key)}
                            className={`px-3 py-3 rounded-xl border transition-all text-center ${
                                isActive
                                    ? 'border-slate-900 bg-slate-50'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                        >
                            <div
                                className="font-semibold text-slate-900 leading-none mb-1.5 truncate"
                                style={{ fontSize: `${preset.px}px` }}
                                title={sampleText}
                            >
                                {sampleText}
                            </div>
                            <div className="text-xs font-semibold text-slate-900 flex items-center justify-center gap-1">
                                {preset.name}
                                {isActive && <Check size={12} className="text-emerald-600" />}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{preset.description}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const currentTheme = THEMES[activeTheme] || THEMES.teal;

    // Side drawer rather than overlay modal: the user wants to see the
    // resume update *live* as they pick colors/fonts/sizes. A centered
    // modal forced an open → pick → close → look → reopen loop. This
    // panel anchors to the right edge, lives below the editor header,
    // and never covers the resume. The preview area resizes around it
    // (see the handleResize dep on modals.is('theme') in App.jsx).
    return (
        <div
            className="fixed right-0 top-16 bottom-0 w-full sm:w-[340px] xl:w-[400px] z-40 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-black/40 flex flex-col animate-in slide-in-from-right duration-300 no-print"
            onClick={(e) => e.stopPropagation()}
        >
            <header className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--brand-600)' }}
                    >
                        <Palette size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 tracking-tight m-0">
                            Design & Theme
                        </h2>
                        <p className="text-[12px] text-slate-500 m-0">
                            Colors, fonts, and text size for your resume.
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
            </header>

            <div className="px-6 py-5 overflow-y-auto space-y-6">
                {/* Paper size — top of the drawer because it changes the
                    canvas dimensions, which affects how everything else
                    reads. Per-resume (lives on resume.paperSize) so a US
                    profile and an EU profile can coexist. */}
                {resume && onResumeChange && (
                    <div>
                        <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                            <FileText size={11} /> Paper size
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(PAPER_SIZES).map(([key, size]) => {
                                const isActive = (resume.paperSize || 'A4') === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() =>
                                            onResumeChange((prev) => ({ ...prev, paperSize: key }))
                                        }
                                        className={`flex flex-col items-start gap-1 px-3 py-2.5 rounded-xl border transition-all text-left ${
                                            isActive
                                                ? 'border-slate-900 bg-slate-50'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                                            {size.label}
                                            {isActive && <Check size={14} className="text-emerald-600" />}
                                        </div>
                                        <div className="text-[10.5px] text-slate-500 leading-tight">
                                            {size.description}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Accent color — overrides each layout's built-in accent
                    via --resume-accent. Preset swatches + raw hex picker.
                    Layouts that opt-in (currently Google / BoldRecruit /
                    NavyModern) repaint immediately; others keep their
                    original accent. */}
                {resume && onResumeChange && (
                    <div>
                        <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                            <Droplet size={11} /> Accent color
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <button
                                onClick={() => onResumeChange((prev) => ({ ...prev, accentColor: null }))}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium transition-colors ${
                                    !resume.accentColor
                                        ? 'border-slate-900 bg-slate-50 text-slate-900'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                Default
                                {!resume.accentColor && <Check size={12} className="text-emerald-600" />}
                            </button>
                            {ACCENT_PRESETS.map((preset) => {
                                const isActive = resume.accentColor === preset.value;
                                return (
                                    <button
                                        key={preset.key}
                                        onClick={() =>
                                            onResumeChange((prev) => ({
                                                ...prev,
                                                accentColor: preset.value,
                                            }))
                                        }
                                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                                            isActive
                                                ? 'border-slate-900 scale-110 ring-2 ring-slate-200'
                                                : 'border-white shadow-sm hover:scale-105'
                                        }`}
                                        style={{ backgroundColor: preset.value }}
                                        title={preset.label}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="color"
                                    value={resume.accentColor || '#1a73e8'}
                                    onChange={(e) =>
                                        onResumeChange((prev) => ({
                                            ...prev,
                                            accentColor: e.target.value,
                                        }))
                                    }
                                    className="w-7 h-7 rounded cursor-pointer border border-slate-300"
                                    aria-label="Custom accent color"
                                />
                                <span>Custom hex</span>
                            </label>
                            <span className="text-slate-400">Applies to layouts that support it.</span>
                        </div>
                    </div>
                )}

                {/* Page margins — visually scales the layout root so users
                    can tighten or loosen whitespace without re-picking a
                    template. Implementation lives in index.css. */}
                {resume && onResumeChange && (
                    <div>
                        <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                            <Maximize2 size={11} /> Page margins
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(PAGE_MARGIN_PRESETS).map(([key, preset]) => {
                                const isActive = (resume.pageMargins || 'standard') === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() =>
                                            onResumeChange((prev) => ({
                                                ...prev,
                                                pageMargins: key,
                                            }))
                                        }
                                        className={`flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg border transition-all text-left ${
                                            isActive
                                                ? 'border-slate-900 bg-slate-50'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                        title={preset.description}
                                    >
                                        <div className="text-xs font-semibold text-slate-900">
                                            {preset.label}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Header alignment — text-align on #section-personal, plus
                    justify-content for any flex contact rows inside. */}
                {resume && onResumeChange && (
                    <div>
                        <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                            <AlignLeft size={11} /> Header alignment
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { key: 'left', label: 'Left', Icon: AlignLeft },
                                { key: 'center', label: 'Center', Icon: AlignCenter },
                                { key: 'right', label: 'Right', Icon: AlignRight },
                            ].map(({ key, label, Icon }) => {
                                const isActive = (resume.headerAlignment || 'left') === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() =>
                                            onResumeChange((prev) => ({
                                                ...prev,
                                                headerAlignment: key,
                                            }))
                                        }
                                        className={`flex flex-col items-center gap-1 px-2.5 py-2.5 rounded-lg border transition-all ${
                                            isActive
                                                ? 'border-slate-900 bg-slate-50 text-slate-900'
                                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-500'
                                        }`}
                                    >
                                        <Icon size={16} />
                                        <span className="text-[11px] font-semibold">{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ATS Preview — toggles a modal that shows what an
                    applicant-tracking system actually parses out of the
                    PDF. Lives in the Design drawer because it's a "view
                    mode" of the resume, not a customization. Nobody else
                    in the market shows users this; biggest credibility
                    signal for our "we're honest about ATS" pitch. */}
                {onOpenAtsPreview && (
                    <div>
                        <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                            <ScanLine size={11} /> ATS view
                        </h3>
                        <button
                            onClick={onOpenAtsPreview}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-left transition-colors group"
                        >
                            <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-900">
                                    See what the bot sees
                                </div>
                                <div className="text-[10.5px] text-slate-500 leading-tight">
                                    Plain-text parse + parser-hostile flags.
                                </div>
                            </div>
                            <ScanLine
                                size={16}
                                className="text-slate-400 group-hover:text-slate-700 shrink-0"
                            />
                        </button>
                    </div>
                )}

                {/* Preset list */}
                <div>
                    <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3">
                        Themes
                    </h3>
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
                                        <div className="text-[11px] text-slate-500 mt-0.5">
                                            {theme.description}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Font family — applied to .resume-paper at runtime. Each
                        preset writes its CSS stack to --resume-font-family;
                        index.css forces it through Tailwind's font-* classes
                        inside the resume so the user's pick always wins. */}
                <div>
                    <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                        <Type size={11} /> Font family
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(FONT_FAMILIES).map(([key, font]) => {
                            const isActive = key === activeFont;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleFontSelect(key)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all ${
                                        isActive
                                            ? 'border-slate-900 bg-slate-50'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                                >
                                    {/* Specimen — "Aa" rendered in the font itself */}
                                    <div
                                        className="w-12 h-10 shrink-0 rounded-md border border-slate-200 flex items-center justify-center bg-white text-slate-900 text-lg font-semibold"
                                        style={{ fontFamily: font.stack }}
                                    >
                                        Aa
                                    </div>
                                    <div className="flex-1 text-left">
                                        {/* Name + description rendered IN the font itself
                                            so users can preview each option without picking
                                            it. The font stack flows from the parent. */}
                                        <div
                                            className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"
                                            style={{ fontFamily: font.stack }}
                                        >
                                            {font.name}
                                            {isActive && <Check size={14} className="text-emerald-600" />}
                                        </div>
                                        <div
                                            className="text-[11px] text-slate-500 mt-0.5"
                                            style={{ fontFamily: font.stack }}
                                        >
                                            {font.description}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Text size — sets a base font-size on the resume wrapper.
                        Note: Tailwind's text-* utility classes use absolute
                        rem and don't scale; this is the partial-scope
                        documented in src/theme/tokens.js. */}
                <div>
                    <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-1.5">
                        <AArrowUp size={11} /> Text size
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(FONT_SIZES).map(([key, size]) => {
                            const isActive = key === activeSize;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleSizeSelect(key)}
                                    className={`px-3 py-3 rounded-xl border transition-all text-center ${
                                        isActive
                                            ? 'border-slate-900 bg-slate-50'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                                >
                                    <div
                                        className="font-semibold text-slate-900 leading-none mb-1"
                                        style={{ fontSize: `${size.basePx}px` }}
                                    >
                                        Aa
                                    </div>
                                    <div className="text-xs font-semibold text-slate-900 flex items-center justify-center gap-1">
                                        {size.name}
                                        {isActive && <Check size={12} className="text-emerald-600" />}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                        {size.description}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                        Note: text size scales elements that inherit from the resume wrapper. Some
                        template-specific text (with fixed Tailwind sizing) won't resize here.
                    </p>
                </div>

                {/* Element-type size pickers — three independent knobs for
                        headings, body text, and bullet points. Override the
                        base text-size for their matching selectors (see
                        index.css for the routing rules). */}
                {renderSizePicker({
                    icon: <Heading size={11} />,
                    label: 'Heading size',
                    presets: HEADING_SIZES,
                    activeKey: activeHeadingSize,
                    onSelect: handleHeadingSizeSelect,
                    sampleText: 'Heading',
                })}

                {renderSizePicker({
                    icon: <AlignLeft size={11} />,
                    label: 'Body text size',
                    presets: BODY_SIZES,
                    activeKey: activeBodySize,
                    onSelect: handleBodySizeSelect,
                    sampleText: 'Body text',
                })}

                {renderSizePicker({
                    icon: <List size={11} />,
                    label: 'Bullet size',
                    presets: BULLET_SIZES,
                    activeKey: activeBulletSize,
                    onSelect: handleBulletSizeSelect,
                    sampleText: 'Bullet item',
                })}

                {/* Token inspector — the active theme's scale, hex values, and a
                        live preview of buttons / pills using brand-* classes. */}
                <div>
                    <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3">
                        Token inspector
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-5 gap-px bg-slate-100">
                            {Object.entries(currentTheme.scale).map(([shade, hex]) => (
                                <div key={shade} className="bg-white p-2 text-center">
                                    <div className="w-full h-8 rounded mb-1.5" style={{ background: hex }} />
                                    <div className="text-[10px] text-slate-500 font-mono">{shade}</div>
                                    <div className="text-[10px] text-slate-700 font-mono">
                                        {hex.toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live preview using brand-* utility classes */}
                <div>
                    <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3">
                        Live preview
                    </h3>
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
                            Link styling:{' '}
                            <a className="text-brand-700 underline hover:text-brand-800">
                                resume.landedjob.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                    onClick={onClose}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors"
                >
                    Done
                </button>
            </footer>
        </div>
    );
};

export default ThemeSettingsModal;
