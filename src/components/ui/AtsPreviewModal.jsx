import { useEffect, useMemo } from 'react';
import { X, ScanLine, AlertTriangle, AlertCircle, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { renderAtsText, diagnoseAts } from '../../utils/atsPreview';

// ATS Preview pane — see your resume the way Greenhouse / Lever / Workday
// actually parse it: plain text, no styles, no layout. Built because every
// resume tool *claims* "ATS-friendly" and none of them show you what that
// actually means at parse time.
//
// What the user sees: the resume re-rendered as section-headed plain text,
// in monospace, on a left pane. Right pane lists parser-hostile signals
// (missing email, no dates, etc) we can detect without an ATS engine.
//
// No AI call, no network — pure render from `resume`.

const AtsPreviewModal = ({ onClose, resume }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const text = useMemo(() => renderAtsText(resume), [resume]);
    const issues = useMemo(() => diagnoseAts(resume), [resume]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard blocked — silently fail */
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 dark:bg-slate-950/75 backdrop-blur-sm no-print"
        >
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl max-h-[92vh] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
            >
                <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950/40 dark:to-slate-900">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-slate-900 dark:bg-slate-700 rounded-lg text-white shadow-md shrink-0">
                            <ScanLine size={18} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-slate-900 dark:text-stone-100 m-0">
                                ATS Preview
                            </h2>
                            <p className="text-[11px] text-slate-500 dark:text-stone-400 m-0">
                                What Greenhouse / Lever / Workday extract before scoring you.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-stone-200 bg-white dark:bg-slate-800 hover:border-slate-300 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check size={12} /> Copied
                                </>
                            ) : (
                                <>
                                    <Copy size={12} /> Copy plain text
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-stone-200 rounded"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_320px] min-h-0">
                    {/* Plain-text view */}
                    <div className="overflow-y-auto p-5 bg-slate-50 dark:bg-slate-950/40">
                        <pre className="font-mono text-[12.5px] leading-[1.65] text-slate-800 dark:text-stone-200 whitespace-pre-wrap break-words selection:bg-slate-900 selection:text-white dark:selection:bg-stone-100 dark:selection:text-slate-900">
                            {text || '(empty resume)'}
                        </pre>
                    </div>

                    {/* Diagnostics rail */}
                    <aside className="overflow-y-auto p-5 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <h3 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-stone-400 mb-3 flex items-center gap-1.5">
                            <AlertTriangle size={11} /> Parser flags
                        </h3>
                        {issues.length === 0 ? (
                            <div className="rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-3 text-[12px] text-emerald-800 dark:text-emerald-200">
                                <Check size={14} className="inline -mt-0.5 mr-1" />
                                No obvious parser-hostile issues. The bot should extract the basics.
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {issues.map((issue, i) => {
                                    const isError = issue.severity === 'error';
                                    const Icon = isError ? AlertCircle : AlertTriangle;
                                    return (
                                        <li
                                            key={i}
                                            className={`flex gap-2 p-2.5 rounded-lg border text-[12px] leading-snug ${
                                                isError
                                                    ? 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-200'
                                                    : 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200'
                                            }`}
                                        >
                                            <Icon size={12} className="mt-0.5 shrink-0" />
                                            <span>{issue.text}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        <div className="mt-6 text-[11px] text-slate-500 dark:text-stone-400 leading-relaxed">
                            <p className="mb-1.5 font-semibold text-slate-700 dark:text-stone-300">
                                What this is.
                            </p>
                            <p>
                                Real ATS engines extract text from your PDF and apply pattern-matching to tag
                                sections, dates, and contact fields. This view is a clean approximation. If a
                                recruiter searches for &ldquo;Postgres&rdquo;, only terms that appear in{' '}
                                <em>this</em> text are hits.
                            </p>
                        </div>
                    </aside>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AtsPreviewModal;
