import React from 'react';
import { Check } from 'lucide-react';
import { SECTION_SCALES, getActiveScale } from '../../utils/sectionStyles';

// Path B size picker — rendered inside each section editor in the sidebar.
// Three small pill buttons (Compact / Normal / Large) that write to
// `resume.sectionStyles[sectionId]`. Layouts read the same field and
// apply the matching --section-scale CSS variable to that section's
// wrapper. See src/utils/sectionStyles.js for the multiplier table and
// composition rules.
//
// Renders nothing if no `sectionId` is provided so callers can do
// `<SectionSizePicker sectionId={id} ... />` safely on sections that
// don't have an id yet (e.g. a new custom section being typed).
const SectionSizePicker = ({ resume, sectionId, onResumeChange }) => {
    if (!sectionId) return null;
    const active = getActiveScale(resume, sectionId);

    const handlePick = (key) => {
        // Selecting "normal" deletes the key entirely so the resume blob
        // stays clean — only sections the user actually tweaked persist
        // a value. Avoids JSON bloat for users who never use this control.
        // Compute `next` from `prev` inside the functional setter rather
        // than from the closure, so rapid clicks don't race against stale
        // resume state.
        onResumeChange((prev) => {
            const next = { ...(prev.sectionStyles || {}) };
            if (key === 'normal') delete next[sectionId];
            else next[sectionId] = key;
            return { ...prev, sectionStyles: next };
        });
    };

    return (
        <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-stone-500 font-bold">
                Size
            </span>
            <div className="flex gap-1">
                {Object.entries(SECTION_SCALES).map(([key, preset]) => {
                    const isActive = key === active;
                    return (
                        <button
                            key={key}
                            onClick={() => handlePick(key)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                                isActive
                                    ? 'bg-brand-50 dark:bg-brand-500/15 border-brand-300 dark:border-brand-500/40 text-brand-700 dark:text-brand-300'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-stone-300 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                            title={preset.description}
                        >
                            {preset.label}
                            {isActive && key !== 'normal' && (
                                <Check size={10} className="text-brand-600 dark:text-brand-400" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SectionSizePicker;
