// Shared editor primitives — adapted from the claude.ai/design UI kit.
// CardChrome: collapsible item card with drag handle, page-break, delete, chevron.
// FillInput / FillTextarea: transparent until focused, then bg-white + border.
// BulletRow: bullet character outside, textarea inline.
// FieldLabel: small uppercase label.

import React, { useState } from 'react';
import {
    GripVertical,
    SplitSquareHorizontal,
    Trash2,
    ChevronDown,
    Plus,
    X,
    Wand2,
    Loader2,
    BarChart3,
} from 'lucide-react';
import { analyzeBullet } from '../../utils/bulletQuality';

// Soft target for a single bullet. Recruiters and ATS systems read fastest
// when bullets land in the 80–200 char range. We don't hard-cap, but the
// counter color shifts above 200 to signal "consider trimming".
export const BULLET_SOFT_LIMIT = 200;

export const FieldLabel = ({ children, optional }) => (
    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-stone-400 mb-1">
        {children}
        {optional && (
            <span className="text-[10px] text-slate-400 dark:text-stone-500 font-normal">· optional</span>
        )}
    </label>
);

export const FillInput = React.forwardRef(function FillInput({ className = '', ...props }, ref) {
    const [focused, setFocused] = useState(false);
    return (
        <input
            ref={ref}
            {...props}
            onFocus={(e) => {
                setFocused(true);
                props.onFocus?.(e);
            }}
            onBlur={(e) => {
                setFocused(false);
                props.onBlur?.(e);
            }}
            className={`w-full px-3 py-2 rounded-md text-[13px] text-slate-900 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 outline-none font-inherit transition-all
                ${
                    focused
                        ? 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600'
                        : 'bg-stone-50 dark:bg-slate-800/60 border border-transparent'
                }
                ${className}`}
        />
    );
});

export const FillTextarea = React.forwardRef(function FillTextarea(
    { className = '', rows = 3, ...props },
    ref
) {
    const [focused, setFocused] = useState(false);
    return (
        <textarea
            ref={ref}
            rows={rows}
            {...props}
            onFocus={(e) => {
                setFocused(true);
                props.onFocus?.(e);
            }}
            onBlur={(e) => {
                setFocused(false);
                props.onBlur?.(e);
            }}
            className={`w-full px-3 py-2 rounded-md text-[13px] text-slate-900 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 outline-none leading-relaxed transition-all
                ${
                    focused
                        ? 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600'
                        : 'bg-stone-50 dark:bg-slate-800/60 border border-transparent'
                }
                ${className}`}
        />
    );
});

export const BulletRow = ({ value, onChange, onRemove, onImprove, autoFocus = false }) => {
    const [focused, setFocused] = useState(false);
    const [improving, setImproving] = useState(false);
    const len = (value || '').length;
    // Counter only surfaces when the bullet is over (or close to) the soft
    // limit. Under that band, the count is noise — bullets vary too widely
    // for a universal "ideal" number.
    const over = len > BULLET_SOFT_LIMIT;
    const nearLimit = len > BULLET_SOFT_LIMIT * 0.9;

    // Bullet-quality hints. Skip on short drafts (< 18 chars) so users aren't
    // nagged before they've finished a thought. Hidden during focus to keep
    // active editing quiet — they reappear on blur for review.
    const analysis = len >= 18 ? analyzeBullet(value) : { weakVerbs: [], hasMetric: true, isEmpty: true };
    const showHints = !focused && !analysis.isEmpty && (analysis.weakVerbs.length > 0 || !analysis.hasMetric);

    // Click-to-apply: swap the first occurrence of a weak phrase for the chosen
    // replacement, preserving the original casing at the match site.
    const applyVerbReplacement = (phrase, replacement) => {
        const re = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'i');
        const match = value.match(re);
        if (!match) return;
        const matched = match[0];
        const startsUpper =
            matched[0] === matched[0].toUpperCase() && matched[0] !== matched[0].toLowerCase();
        const replacementText = startsUpper
            ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
            : replacement.toLowerCase();
        onChange(value.replace(re, replacementText));
    };

    const handleImprove = async () => {
        if (!onImprove || improving || !value?.trim()) return;
        setImproving(true);
        try {
            const improved = await onImprove(value);
            if (improved) onChange(improved);
        } finally {
            setImproving(false);
        }
    };

    return (
        <div className="flex gap-1.5 items-start group">
            <span className="text-slate-400 dark:text-stone-500 mt-1.5 leading-none text-sm shrink-0 select-none">
                •
            </span>
            <div className="flex-1 min-w-0">
                <div className="relative">
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        rows={2}
                        autoFocus={autoFocus}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        disabled={improving}
                        className={`w-full px-2 py-1.5 pr-14 rounded-md text-[13px] leading-snug resize-none outline-none transition-all
                            ${
                                focused
                                    ? 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600'
                                    : 'bg-transparent border border-transparent'
                            }
                            ${improving ? 'opacity-50' : ''}
                            text-slate-900 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500`}
                    />
                    {/* Controls sit inside the textarea on the right so they
                        don't steal horizontal space in the narrow sidebar. */}
                    <div className="absolute top-1 right-1 flex items-center gap-0.5">
                        {onImprove && (
                            <button
                                onClick={handleImprove}
                                disabled={improving || !value?.trim()}
                                className="text-slate-300 dark:text-stone-600 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
                                title="Rewrite with AI"
                            >
                                {improving ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <Wand2 size={12} />
                                )}
                            </button>
                        )}
                        {onRemove && (
                            <button
                                onClick={onRemove}
                                className="text-slate-300 dark:text-stone-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove bullet"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>
                {nearLimit && (
                    <div
                        className={`text-[10px] mt-0.5 px-2 transition-colors ${over ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}
                    >
                        {len} / {BULLET_SOFT_LIMIT} chars{over ? ' · consider trimming' : ''}
                    </div>
                )}
                {showHints && (
                    <div className="mt-1 px-2 space-y-1">
                        {analysis.weakVerbs.map(({ phrase, suggestions }) => (
                            <div key={phrase} className="flex flex-wrap items-center gap-1">
                                <span className="text-[10px] text-amber-700 dark:text-amber-400">
                                    Swap <em className="not-italic font-semibold">{phrase}</em> →
                                </span>
                                {suggestions.slice(0, 3).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => applyVerbReplacement(phrase, s)}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                                        title={`Replace "${phrase}" with "${s}"`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        ))}
                        {!analysis.hasMetric && (
                            <div className="inline-flex items-center gap-1 text-[10px] text-sky-700 dark:text-sky-400">
                                <BarChart3 size={10} strokeWidth={2.2} />
                                Add a number or % to make the impact concrete.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// resumeData is optional — when present we forward it to /api/improve-text
// so the AI gets candidate context (target role, seniority) for grounding.
// If the server is offline or the call fails, we keep the original bullet
// and surface a console warning rather than crashing the editor.
export const BulletList = ({ bullets, onChange, maxBullets = 5, resumeData }) => {
    const update = (i, v) => onChange(bullets.map((b, idx) => (idx === i ? v : b)));
    const remove = (i) => onChange(bullets.filter((_, idx) => idx !== i));
    const add = () => {
        if (bullets.length >= maxBullets) return;
        onChange([...bullets, '']);
    };

    const improve = async (text) => {
        try {
            const response = await fetch('/api/improve-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, type: 'bullet', resumeData }),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return data?.improvedText?.trim() || null;
        } catch (err) {
            console.warn('[BulletList] improve-text failed:', err?.message || err);
            return null;
        }
    };

    return (
        <div className="space-y-1">
            {bullets.map((b, i) => (
                <BulletRow
                    key={i}
                    value={b}
                    onChange={(v) => update(i, v)}
                    onRemove={() => remove(i)}
                    onImprove={improve}
                    autoFocus={b === '' && i === bullets.length - 1}
                />
            ))}
            <div className="flex justify-between items-center pt-1">
                <button
                    onClick={add}
                    disabled={bullets.length >= maxBullets}
                    className="text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 text-xs font-medium inline-flex items-center gap-1 transition-colors disabled:opacity-40"
                >
                    <Plus size={12} /> Add highlight
                </button>
                <span className="text-[10px] text-slate-400 dark:text-stone-500">
                    {bullets.length} / {maxBullets}
                </span>
            </div>
        </div>
    );
};

export const CardChrome = ({
    title,
    subtitle,
    onDelete,
    onTogglePageBreak,
    isPageBreak = false,
    defaultOpen = true,
    children,
    dragHandleProps,
}) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors hover:border-slate-300 dark:hover:border-slate-600">
            <div
                className="flex items-center gap-1 px-2 py-2.5 cursor-pointer select-none"
                onClick={() => setOpen((o) => !o)}
            >
                {dragHandleProps && (
                    <button
                        {...dragHandleProps}
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-300 dark:text-stone-600 hover:text-slate-500 dark:hover:text-stone-400 cursor-grab active:cursor-grabbing p-1 transition-colors"
                        title="Drag to reorder"
                    >
                        <GripVertical size={14} />
                    </button>
                )}
                <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 dark:text-stone-100 leading-tight truncate">
                        {title || (
                            <span className="text-slate-400 dark:text-stone-500 italic font-normal">
                                Untitled
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <div className="text-[11px] text-slate-500 dark:text-stone-400 leading-tight truncate mt-0.5">
                            {subtitle}
                        </div>
                    )}
                </div>
                {onTogglePageBreak && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onTogglePageBreak();
                        }}
                        className={`p-1.5 rounded transition-colors ${isPageBreak ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-stone-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10'}`}
                        title={isPageBreak ? 'Remove page break' : 'Force new page'}
                    >
                        <SplitSquareHorizontal size={13} />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="text-slate-400 dark:text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={13} />
                    </button>
                )}
                <span
                    className="text-slate-400 dark:text-stone-500 p-1 transition-transform"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    <ChevronDown size={14} />
                </span>
            </div>
            {open && <div className="border-t border-slate-100 dark:border-slate-700 p-3.5">{children}</div>}
        </div>
    );
};
