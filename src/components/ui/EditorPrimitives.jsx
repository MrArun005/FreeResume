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
} from 'lucide-react';

// Soft target for a single bullet. Recruiters and ATS systems read fastest
// when bullets land in the 80–200 char range. We don't hard-cap, but the
// counter color shifts above 200 to signal "consider trimming".
export const BULLET_SOFT_LIMIT = 200;

export const FieldLabel = ({ children, optional }) => (
    <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-1">
        {children}
        {optional && <span className="text-[10px] text-slate-400 font-normal">· optional</span>}
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
            className={`w-full px-3 py-2 rounded-md text-[13px] text-slate-900 outline-none font-inherit transition-all
                ${focused ? 'bg-white border border-slate-300' : 'bg-stone-50 border border-transparent'}
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
            className={`w-full px-3 py-2 rounded-md text-[13px] text-slate-900 outline-none leading-relaxed transition-all
                ${focused ? 'bg-white border border-slate-300' : 'bg-stone-50 border border-transparent'}
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
            <span className="text-slate-400 mt-1.5 leading-none text-sm shrink-0 select-none">•</span>
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
                            ${focused ? 'bg-white border border-slate-300' : 'bg-transparent border border-transparent'}
                            ${improving ? 'opacity-50' : ''}
                            text-slate-900`}
                    />
                    {/* Controls sit inside the textarea on the right so they
                        don't steal horizontal space in the narrow sidebar. */}
                    <div className="absolute top-1 right-1 flex items-center gap-0.5">
                        {onImprove && (
                            <button
                                onClick={handleImprove}
                                disabled={improving || !value?.trim()}
                                className="text-slate-300 hover:text-brand-700 hover:bg-brand-50 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
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
                                className="text-slate-300 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove bullet"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>
                {nearLimit && (
                    <div
                        className={`text-[10px] mt-0.5 px-2 transition-colors ${over ? 'text-red-600' : 'text-amber-600'}`}
                    >
                        {len} / {BULLET_SOFT_LIMIT} chars{over ? ' · consider trimming' : ''}
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
                    className="text-slate-500 hover:text-slate-900 text-xs font-medium inline-flex items-center gap-1 transition-colors disabled:opacity-40"
                >
                    <Plus size={12} /> Add highlight
                </button>
                <span className="text-[10px] text-slate-400">
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
        <div className="bg-white border border-slate-200 rounded-lg transition-colors hover:border-slate-300">
            <div
                className="flex items-center gap-1 px-2 py-2.5 cursor-pointer select-none"
                onClick={() => setOpen((o) => !o)}
            >
                {dragHandleProps && (
                    <button
                        {...dragHandleProps}
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1 transition-colors"
                        title="Drag to reorder"
                    >
                        <GripVertical size={14} />
                    </button>
                )}
                <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 leading-tight truncate">
                        {title || <span className="text-slate-400 italic font-normal">Untitled</span>}
                    </div>
                    {subtitle && (
                        <div className="text-[11px] text-slate-500 leading-tight truncate mt-0.5">
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
                        className={`p-1.5 rounded transition-colors ${isPageBreak ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`}
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
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={13} />
                    </button>
                )}
                <span
                    className="text-slate-400 p-1 transition-transform"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                    <ChevronDown size={14} />
                </span>
            </div>
            {open && <div className="border-t border-slate-100 p-3.5">{children}</div>}
        </div>
    );
};
