import { useEffect, useState } from 'react';
import {
    Plus,
    X,
    Code2,
    Boxes,
    Database,
    Cloud,
    Wrench,
    BarChart3,
    Brain,
    Shield,
    BookOpen,
    Users,
    Tag,
    FolderPlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FieldLabel } from '../ui/EditorPrimitives';
import { normalizeSkills } from '../../utils/skillTaxonomy';

// "Category" entries are stored as "Label: item1, item2" strings — the rest
// of the app (layouts, PDF/DOCX exporters, AI prompts) parses them by
// splitting on the first colon. Keep that contract.
const isCategory = (s) => typeof s === 'string' && s.indexOf(':') > 0;
const parseCategory = (s) => {
    const idx = s.indexOf(':');
    return { label: s.slice(0, idx).trim(), items: s.slice(idx + 1).trim() };
};
const buildCategory = (label, items) => `${label.trim()}: ${items.trim()}`;

const STARTER_CATEGORIES = [
    'Languages',
    'Frameworks',
    'Databases',
    'Cloud & Big Data',
    'DevOps & Tools',
    'Machine Learning',
    'Visualization & BI',
    'Soft Skills',
];

// Each known category gets an icon + a single dot color used as its identity
// marker. Chips themselves stay neutral so the editor doesn't compete with
// the user's chosen resume accent. Custom labels fall back to a stable
// hash-derived dot color.
const CATEGORY_META = {
    languages: { Icon: Code2, dot: 'bg-blue-500' },
    frameworks: { Icon: Boxes, dot: 'bg-emerald-500' },
    databases: { Icon: Database, dot: 'bg-amber-500' },
    'cloud & big data': { Icon: Cloud, dot: 'bg-sky-500' },
    'devops & tools': { Icon: Wrench, dot: 'bg-orange-500' },
    'visualization & bi': { Icon: BarChart3, dot: 'bg-fuchsia-500' },
    'machine learning': { Icon: Brain, dot: 'bg-purple-500' },
    'architecture & security': { Icon: Shield, dot: 'bg-red-500' },
    concepts: { Icon: BookOpen, dot: 'bg-indigo-500' },
    'soft skills': { Icon: Users, dot: 'bg-teal-500' },
};

const FALLBACK_DOTS = ['bg-rose-500', 'bg-lime-500', 'bg-cyan-500', 'bg-violet-500', 'bg-slate-400'];

function metaForCategory(label) {
    const lc = (label || '').trim().toLowerCase();
    if (CATEGORY_META[lc]) return CATEGORY_META[lc];
    let hash = 0;
    for (let i = 0; i < lc.length; i++) hash = (hash * 31 + lc.charCodeAt(i)) | 0;
    return { Icon: Tag, dot: FALLBACK_DOTS[Math.abs(hash) % FALLBACK_DOTS.length] };
}

const SkillsSection = ({ skills, onUpdateSkills }) => {
    useEffect(() => {
        const hasFlat = skills.some((s) => typeof s === 'string' && s.trim().length > 0 && !isCategory(s));
        if (hasFlat) onUpdateSkills?.(normalizeSkills(skills));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const categories = skills
        .map((s, idx) => ({ original: s, idx }))
        .filter(({ original }) => isCategory(original));

    const totalSkills = categories.reduce((sum, { original }) => {
        const items = parseCategory(original).items;
        return (
            sum +
            items
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean).length
        );
    }, 0);

    const updateAt = (idx, newValue) => {
        const next = [...skills];
        if (newValue === null) next.splice(idx, 1);
        else next[idx] = newValue;
        onUpdateSkills?.(next);
    };

    const addCategory = (label = 'New Category') => {
        onUpdateSkills?.([...skills, `${label}: `]);
    };

    const usedLabels = new Set(categories.map(({ original }) => parseCategory(original).label.toLowerCase()));
    const availableStarters = STARTER_CATEGORIES.filter((c) => !usedLabels.has(c.toLowerCase()));

    return (
        <div className="space-y-2.5">
            {/* Header */}
            <div className="flex items-baseline justify-between gap-3">
                <FieldLabel>
                    Skill Groups
                    {totalSkills > 0 && (
                        <span className="ml-2 text-[10px] text-slate-400 dark:text-stone-500 font-normal normal-case tracking-normal">
                            {categories.length} · {totalSkills} {totalSkills === 1 ? 'skill' : 'skills'}
                        </span>
                    )}
                </FieldLabel>
                <span className="text-[10.5px] text-slate-400 dark:text-stone-500">
                    <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[9.5px] mr-1 border border-slate-200 dark:border-slate-700">
                        Enter
                    </kbd>
                    to add
                </span>
            </div>

            {categories.length === 0 ? (
                <EmptyState onPick={addCategory} starters={STARTER_CATEGORIES.slice(0, 4)} />
            ) : (
                <div className="space-y-1.5">
                    <AnimatePresence initial={false}>
                        {categories.map(({ original, idx }) => {
                            const { label, items } = parseCategory(original);
                            return (
                                <motion.div
                                    key={idx}
                                    layout
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -8, transition: { duration: 0.15 } }}
                                    transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                                >
                                    <CategoryCard
                                        label={label}
                                        items={items}
                                        onChange={(newLabel, newItems) =>
                                            updateAt(idx, buildCategory(newLabel, newItems))
                                        }
                                        onRemove={() => updateAt(idx, null)}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Add row — compact */}
            {(categories.length > 0 || availableStarters.length < STARTER_CATEGORIES.length) &&
                availableStarters.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                        <button
                            onClick={() => addCategory()}
                            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-600 dark:text-stone-300 hover:text-slate-900 dark:hover:text-stone-100 transition-colors"
                        >
                            <FolderPlus size={12} /> Custom
                        </button>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <div className="flex flex-wrap gap-1">
                            {availableStarters.slice(0, 5).map((c) => {
                                const m = metaForCategory(c);
                                return (
                                    <button
                                        key={c}
                                        onClick={() => addCategory(c)}
                                        title={`Add ${c}`}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] text-slate-500 dark:text-stone-400 hover:text-slate-800 dark:hover:text-stone-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${m.dot}`} />
                                        {c}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
        </div>
    );
};

const EmptyState = ({ onPick, starters }) => (
    <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40 px-4 py-5 text-center">
        <div className="text-[12.5px] font-semibold text-slate-700 dark:text-stone-200 mb-1">
            Start a skill group
        </div>
        <div className="text-[11px] text-slate-500 dark:text-stone-400 mb-3 max-w-[300px] mx-auto">
            Recruiters scan for keyword clusters. Group your skills like &ldquo;Languages: Python, SQL&rdquo;.
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center">
            {starters.map((c) => {
                const m = metaForCategory(c);
                const I = m.Icon;
                return (
                    <button
                        key={c}
                        onClick={() => onPick(c)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium text-slate-700 dark:text-stone-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                    >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${m.dot}`} />
                        <I size={11} className="opacity-70" /> {c}
                    </button>
                );
            })}
        </div>
    </div>
);

const splitSkills = (items) =>
    items
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
const joinSkills = (arr) => arr.join(', ');

const CategoryCard = ({ label, items, onChange, onRemove }) => {
    const [localLabel, setLocalLabel] = useState(label);
    const [draft, setDraft] = useState('');
    const skillList = splitSkills(items);
    const meta = metaForCategory(localLabel);
    const Icon = meta.Icon;

    const commitLabel = () => {
        if (localLabel.trim() && localLabel !== label) onChange(localLabel.trim(), items);
        else if (!localLabel.trim()) setLocalLabel(label);
    };

    const removeSkill = (idx) => {
        const next = skillList.filter((_, i) => i !== idx);
        onChange(localLabel, joinSkills(next));
    };

    const addSkillsFromDraft = () => {
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
            removeSkill(skillList.length - 1);
        }
    };

    return (
        <div className="group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            {/* Header: dot + icon + name + count + remove */}
            <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                <span className={`inline-block w-2 h-2 rounded-full ${meta.dot} shrink-0`} />
                <Icon size={12} className="text-slate-500 dark:text-stone-400 shrink-0" />
                <input
                    value={localLabel}
                    onChange={(e) => setLocalLabel(e.target.value)}
                    onBlur={commitLabel}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    placeholder="Group name"
                    className="flex-1 min-w-0 text-[12px] font-semibold text-slate-900 dark:text-stone-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 bg-transparent border-0 outline-none px-1 py-0.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded transition-colors"
                />
                {skillList.length > 0 && (
                    <span className="text-[10px] font-mono text-slate-400 dark:text-stone-500 shrink-0 tabular-nums">
                        {skillList.length}
                    </span>
                )}
                <button
                    onClick={onRemove}
                    title="Remove group"
                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-0.5 rounded transition-all opacity-0 group-hover:opacity-100"
                >
                    <X size={13} />
                </button>
            </div>

            {/* Chips — neutral so they don't compete with template accent */}
            <div
                className="flex flex-wrap items-center gap-1 px-3 pb-2.5 pt-0.5"
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
                            className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded text-[11px] font-medium text-slate-700 dark:text-stone-200 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 group/chip"
                        >
                            {skill}
                            <button
                                type="button"
                                onClick={() => removeSkill(idx)}
                                className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded p-0.5 transition-colors opacity-50 group-hover/chip:opacity-100"
                                title={`Remove ${skill}`}
                            >
                                <X size={9} />
                            </button>
                        </motion.span>
                    ))}
                </AnimatePresence>
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addSkillsFromDraft}
                    placeholder={skillList.length === 0 ? 'Type a skill, Enter to add…' : '+ add'}
                    className="flex-1 min-w-[80px] text-[11.5px] text-slate-700 dark:text-stone-200 placeholder:text-slate-400 dark:placeholder:text-stone-500 bg-transparent border-0 outline-none py-0.5 px-1"
                />
                {skillList.length === 0 && (
                    <Plus size={11} className="text-slate-300 dark:text-stone-600 mr-1" />
                )}
            </div>
        </div>
    );
};

export default SkillsSection;
