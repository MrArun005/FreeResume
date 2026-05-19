import { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { motion } from 'framer-motion';

// Keyboard shortcut reference. Opened with `?` from anywhere in the editor.
// Document only shortcuts that actually exist — if you add a binding, add it
// here too so users can discover it. Everything below corresponds to a real
// handler in App.jsx or a child component.

const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const MOD = isMac ? '⌘' : 'Ctrl';

const GROUPS = [
    {
        title: 'Editing',
        items: [
            { keys: [MOD, 'Z'], label: 'Undo' },
            { keys: [MOD, 'Shift', 'Z'], label: 'Redo' },
            { keys: ['Enter'], label: 'Add skill chip (in skills field)' },
            { keys: ['Backspace'], label: 'Remove last skill chip (in empty input)' },
        ],
    },
    {
        title: 'AI & tracker',
        items: [
            { keys: [MOD, 'K'], label: 'Open Smart Tailor — non-destructive JD reranking' },
            { keys: [MOD, 'J'], label: 'Open Job Tracker — every application + match score' },
            { keys: [MOD, 'D'], label: 'Toggle Design panel — fonts, colors, sizes' },
        ],
    },
    {
        title: 'Export & navigation',
        items: [
            { keys: [MOD, 'P'], label: 'Print / export PDF' },
            { keys: ['Esc'], label: 'Close modal or exit fullscreen preview' },
        ],
    },
    {
        title: 'Discovery',
        items: [{ keys: ['?'], label: 'Show this shortcuts cheatsheet' }],
    },
];

const KeyboardShortcutsModal = ({ onClose }) => {
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/75 backdrop-blur-sm"
        >
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 shadow-2xl shadow-slate-900/20"
            >
                <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none dark:opacity-30"
                    style={{
                        background:
                            'radial-gradient(400px circle at 0% 0%, rgba(186,230,253,0.40), transparent 55%), radial-gradient(400px circle at 100% 100%, rgba(254,215,170,0.35), transparent 55%)',
                    }}
                />

                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X size={18} strokeWidth={2.2} />
                </button>

                <div className="relative p-7 sm:p-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-stone-300 flex items-center justify-center">
                            <Keyboard size={18} strokeWidth={2} />
                        </div>
                        <h2 className="font-serif-display text-2xl tracking-tight text-slate-900 dark:text-stone-100">
                            Keyboard shortcuts
                        </h2>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-stone-400 mb-6 ml-13">
                        Everything you can do without lifting your hands.
                    </p>

                    <div className="space-y-6">
                        {GROUPS.map((group) => (
                            <div key={group.title}>
                                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-stone-500 mb-2">
                                    {group.title}
                                </div>
                                <ul className="space-y-2">
                                    {group.items.map((item) => (
                                        <li
                                            key={item.label}
                                            className="flex items-center justify-between gap-4 py-1.5"
                                        >
                                            <span className="text-sm text-slate-700 dark:text-stone-300">
                                                {item.label}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                {item.keys.map((k, i) => (
                                                    <kbd
                                                        key={i}
                                                        className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[12px] font-medium text-slate-700 dark:text-stone-200 shadow-[0_1px_0_rgba(15,23,42,0.06)]"
                                                    >
                                                        {k}
                                                    </kbd>
                                                ))}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default KeyboardShortcutsModal;
