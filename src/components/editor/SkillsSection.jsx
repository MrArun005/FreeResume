import { useState } from 'react';
import { Plus, X, FolderPlus } from 'lucide-react';
import { FieldLabel } from '../ui/EditorPrimitives';

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
    // Only category-shaped entries are surfaced here. The App-level
    // `normalizeSkills` helper consolidates any legacy/plain skills into a
    // "Technical Skills" category at load time, so this list is always
    // category-only by the time it reaches the editor.
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

// Inline editor for one category. Two fields: label + comma-separated items.
// State is local until blur to avoid a parent rerender thrash while typing.
const CategoryRow = ({ label, items, onChange, onRemove }) => {
    const [localLabel, setLocalLabel] = useState(label);
    const [localItems, setLocalItems] = useState(items);

    const commit = () => {
        if (localLabel !== label || localItems !== items) {
            onChange(localLabel, localItems);
        }
    };

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50/40 dark:bg-slate-900/40 group">
            <div className="flex items-center gap-2 mb-2">
                <input
                    value={localLabel}
                    onChange={(e) => setLocalLabel(e.target.value)}
                    onBlur={commit}
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
            <input
                value={localItems}
                onChange={(e) => setLocalItems(e.target.value)}
                onBlur={commit}
                placeholder="Python, SQL, JavaScript…"
                className="w-full text-[12px] text-slate-700 dark:text-stone-200 placeholder:text-slate-400 dark:placeholder:text-stone-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 focus:border-slate-400 dark:focus:border-slate-500 outline-none"
            />
        </div>
    );
};

export default SkillsSection;
