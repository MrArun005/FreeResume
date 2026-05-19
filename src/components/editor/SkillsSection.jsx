import { useEffect, useState } from 'react';
import { Plus, X, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FieldLabel } from '../ui/EditorPrimitives';
import { normalizeSkills } from '../../utils/skillTaxonomy';

// Categories the user is likely to want. Quick-add chips create a new group
// pre-named so they don't have to type the label.
const STARTER_CATEGORIES = [
    'Languages',
    'Frameworks',
    'Cloud & Big Data',
    'Databases',
    'DevOps & Tools',
    'Visualization & BI',
    'Machine Learning',
    'Soft Skills',
];

// A "category" entry is just a string with a colon: "Label: item1, item2".
// All consumers (Bold Recruit layout, PDF, etc.) split on the first colon.
const isCategory = (s) => typeof s === 'string' && s.indexOf(':') > 0;
const parseCategory = (s) => {
    const idx = s.indexOf(':');
    return { label: s.slice(0, idx).trim(), items: s.slice(idx + 1).trim() };
};
const buildCategory = (label, items) => `${label.trim()}: ${items.trim()}`;

const SkillsSection = ({ skills, onUpdateSkills }) => {
    // Auto-normalize ONCE on mount if we detect any flat (non-category)
    // skills. Watching [skills] would re-fire on every keystroke and cascade
    // into pagination re-runs; mount-only is enough because every other
    // entry point (load, profile switch, AI rewrite) goes through
    // normalizeResumeShape which already normalizes skills.
    useEffect(() => {
        const hasFlat = skills.some((s) => typeof s === 'string' && s.trim().length > 0 && !isCategory(s));
        if (hasFlat) {
            onUpdateSkills?.(normalizeSkills(skills));
        }
        // Intentionally empty deps — see comment above.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const categories = skills
        .map((s, idx) => ({ original: s, idx }))
        .filter(({ original }) => isCategory(original));

    const updateAt = (idx, newValue) => {
        const next = [...skills];
        if (newValue === null) next.splice(idx, 1);
        else next[idx] = newValue;
        onUpdateSkills?.(next);
    };

    const addCategory = (label = 'New Category') => {
        onUpdateSkills?.([...skills, `${label}: `]);
    };

    return (
        <div className="space-y-3">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <FieldLabel>
                        Skill Categories
                        <span className="ml-2 text-[10px] text-slate-400 dark:text-stone-500 font-normal normal-case tracking-normal">
                            {categories.length} {categories.length === 1 ? 'group' : 'groups'}
                        </span>
                    </FieldLabel>
                    <button
                        onClick={() => addCategory()}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors"
                    >
                        <FolderPlus size={13} /> Add group
                    </button>
                </div>

                {categories.length === 0 ? (
                    <div className="text-[12px] text-slate-400 dark:text-stone-500 italic mb-3">
                        No groups yet. Categories let you organize skills like{' '}
                        <span className="not-italic font-medium text-slate-600 dark:text-stone-300">
                            Languages: Python, SQL
                        </span>
                        .
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {categories.map(({ original, idx }) => (
                            <CategoryRow
                                key={idx}
                                label={parseCategory(original).label}
                                items={parseCategory(original).items}
                                onChange={(label, items) => updateAt(idx, buildCategory(label, items))}
                                onRemove={() => updateAt(idx, null)}
                            />
                        ))}
                    </div>
                )}

                {/* Starter-category chips (one tap → adds a pre-named group) */}
                {categories.length < 4 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-stone-500 font-bold mb-2">
                            Quick add
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {STARTER_CATEGORIES.filter(
                                (c) =>
                                    !categories.some(
                                        ({ original }) =>
                                            parseCategory(original).label.toLowerCase() === c.toLowerCase()
                                    )
                            )
                                .slice(0, 6)
                                .map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => addCategory(c)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-600 dark:text-stone-300 bg-slate-50 dark:bg-slate-700/60 border border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                                    >
                                        <Plus size={10} /> {c}
                                    </button>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Splits the stored comma string into displayable skills. Trims and filters
// empties so a trailing comma or stray whitespace never produces ghost chips.
const splitSkills = (items) =>
    items
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

// Joins back to the canonical "a, b, c" storage format the rest of the app
// (PDF/DOCX exporters, AI prompts) expects.
const joinSkills = (arr) => arr.join(', ');

// Inline editor for one category. Label stays as a plain input; the items
// list is rendered as removable chips with an inline add-input. Each chip
// has its own X so the user can drop individual skills (Python, SQL…) without
// editing a long comma string by hand.
const CategoryRow = ({ label, items, onChange, onRemove }) => {
    const [localLabel, setLocalLabel] = useState(label);
    const [draft, setDraft] = useState('');
    const skillList = splitSkills(items);

    const commitLabel = () => {
        if (localLabel !== label) onChange(localLabel, items);
    };

    const removeSkill = (idx) => {
        const next = skillList.filter((_, i) => i !== idx);
        onChange(localLabel, joinSkills(next));
    };

    const addSkillsFromDraft = () => {
        // Allow paste of "Python, SQL, R" — split and add each as its own chip.
        const incoming = splitSkills(draft);
        if (!incoming.length) return;
        const merged = [...skillList];
        incoming.forEach((s) => {
            if (!merged.some((existing) => existing.toLowerCase() === s.toLowerCase())) {
                merged.push(s);
            }
        });
        onChange(localLabel, joinSkills(merged));
        setDraft('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addSkillsFromDraft();
        } else if (e.key === 'Backspace' && draft === '' && skillList.length > 0) {
            // Backspace on empty input nukes the last chip — matches the
            // expected behavior of every chip-editor users have seen elsewhere.
            removeSkill(skillList.length - 1);
        }
    };

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50/40 dark:bg-slate-900/40 group">
            <div className="flex items-center gap-2 mb-2">
                <input
                    value={localLabel}
                    onChange={(e) => setLocalLabel(e.target.value)}
                    onBlur={commitLabel}
                    placeholder="Category name"
                    className="flex-1 text-[12px] font-bold text-slate-900 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 bg-transparent border-0 border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-slate-400 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-800 px-1 py-0.5 outline-none transition-colors"
                />
                <button
                    onClick={onRemove}
                    className="text-slate-400 dark:text-stone-500 hover:text-red-600 dark:hover:text-red-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove group"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Chip row — each existing skill is its own removable pill, then
                an inline input for adding more. Wrapping is fine because chips
                are short; the container clicks focus onto the input so the
                whole row feels like one tag editor. */}
            <div
                className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 focus-within:border-slate-400 dark:focus-within:border-slate-500"
                onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input && e.target === e.currentTarget) input.focus();
                }}
            >
                <AnimatePresence initial={false}>
                    {skillList.map((skill, idx) => (
                        <motion.span
                            key={skill}
                            layout
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
                            transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
                            className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-medium bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-200 border border-brand-200 dark:border-brand-800"
                        >
                            {skill}
                            <button
                                type="button"
                                onClick={() => removeSkill(idx)}
                                className="hover:bg-brand-200 dark:hover:bg-brand-800 rounded-full p-0.5 transition-colors"
                                title={`Remove ${skill}`}
                            >
                                <X size={10} />
                            </button>
                        </motion.span>
                    ))}
                </AnimatePresence>
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addSkillsFromDraft}
                    placeholder={skillList.length === 0 ? 'Python, SQL, JavaScript…' : 'Add skill…'}
                    className="flex-1 min-w-[80px] text-[12px] text-slate-700 dark:text-stone-200 placeholder:text-slate-400 dark:placeholder:text-stone-500 bg-transparent border-0 outline-none py-0.5"
                />
            </div>
            <div className="mt-1.5 text-[10px] text-slate-400 dark:text-stone-500">
                Type a skill and press{' '}
                <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px]">
                    Enter
                </kbd>{' '}
                or{' '}
                <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px]">
                    ,
                </kbd>{' '}
                to add. Click ✕ on a chip to remove.
            </div>
        </div>
    );
};

export default SkillsSection;
