import { useEffect, useMemo, useState } from 'react';
import {
    X,
    ScanLine,
    AlertTriangle,
    AlertCircle,
    Copy,
    Check,
    Database,
    FileText,
    Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { renderAtsText, diagnoseAts, parseAtsFields, buildKeywordIndex } from '../../utils/atsPreview';

// ATS Preview pane — three views of what the bot does with your resume:
//   1. Parsed Fields: the structured DB row the ATS actually stores
//   2. Plain Text:    the raw text extraction (what naive parsers see)
//   3. Keyword Index: alphabetized term list — what recruiter searches hit
//
// The Parsed Fields view is the real differentiator. Every "ATS-friendly"
// resume tool talks about plain text. None of them show you the tagged
// fields, which is what actually populates the recruiter's candidate record.

const TABS = [
    { id: 'fields', label: 'Parsed fields', icon: Database, hint: 'The DB row the ATS stores' },
    { id: 'text', label: 'Plain text', icon: FileText, hint: 'Raw extraction' },
    { id: 'keywords', label: 'Keyword index', icon: Search, hint: 'What recruiter searches hit' },
];

const Empty = ({ children }) => (
    <span className="text-rose-600 dark:text-rose-400 font-medium">{children}</span>
);

const FieldRow = ({ label, value, missing }) => (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-stone-500 pt-0.5">
            {label}
        </div>
        <div className="text-[13px] text-slate-800 dark:text-stone-200 break-words">
            {missing ? <Empty>{value || '(empty)'}</Empty> : value || <Empty>(empty)</Empty>}
        </div>
    </div>
);

const ParsedFieldsView = ({ fields }) => {
    if (!fields) return <div className="text-slate-500 text-sm">No resume data to parse.</div>;
    const { candidate, derived, experience, education, skills } = fields;

    return (
        <div className="space-y-6">
            <section>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-stone-400 mb-2 flex items-center gap-1.5">
                    <Database size={11} /> Candidate record
                </h4>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2">
                    <FieldRow label="name" value={candidate.name} missing={!candidate.name} />
                    <FieldRow label="title" value={candidate.title} />
                    <FieldRow label="email" value={candidate.email} missing={!candidate.email} />
                    <FieldRow label="phone" value={candidate.phone} />
                    <FieldRow label="location" value={candidate.location} />
                    <FieldRow
                        label="links"
                        value={
                            candidate.links.length
                                ? candidate.links.map((l) => `${l.network}: ${l.url}`).join('  •  ')
                                : null
                        }
                    />
                </div>
            </section>

            <section>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-stone-400 mb-2">
                    Derived (what the bot computes)
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <DerivedCard label="Total YoE" value={derived.totalYoE} />
                    <DerivedCard label="Current title" value={derived.currentTitle} />
                    <DerivedCard label="Current co." value={derived.currentCompany} />
                    <DerivedCard label="Role count" value={String(derived.roleCount)} />
                </div>
            </section>

            <section>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-stone-400 mb-2">
                    Experience ({experience.length})
                </h4>
                {experience.length === 0 ? (
                    <div className="text-[12px] text-rose-600 dark:text-rose-400">
                        No experience entries — the bot has nothing to score.
                    </div>
                ) : (
                    <ol className="space-y-2">
                        {experience.map((e, i) => (
                            <li
                                key={i}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5"
                            >
                                <div className="flex items-baseline justify-between gap-2">
                                    <div className="text-[13px] font-semibold text-slate-900 dark:text-stone-100 truncate">
                                        {e.title || <Empty>(no title)</Empty>}
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-500 dark:text-stone-400 shrink-0">
                                        {e.tenure}
                                    </div>
                                </div>
                                <div className="text-[12px] text-slate-600 dark:text-stone-300 mt-0.5">
                                    {e.company || <Empty>(no company)</Empty>}
                                    {e.location ? ` · ${e.location}` : ''}
                                </div>
                                <div className="text-[11px] font-mono text-slate-400 dark:text-stone-500 mt-1 flex flex-wrap gap-x-3">
                                    <span>start: {e.startISO || <Empty>?</Empty>}</span>
                                    <span>end: {e.endISO || <Empty>?</Empty>}</span>
                                    <span>bullets: {e.bulletCount}</span>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            {education.length > 0 && (
                <section>
                    <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-stone-400 mb-2">
                        Education ({education.length})
                    </h4>
                    <ol className="space-y-2">
                        {education.map((edu, i) => (
                            <li
                                key={i}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
                            >
                                <div className="text-[13px] font-semibold text-slate-900 dark:text-stone-100">
                                    {edu.degree || <Empty>(no degree)</Empty>}
                                </div>
                                <div className="text-[12px] text-slate-600 dark:text-stone-300">
                                    {edu.school || <Empty>(no school)</Empty>}
                                    {edu.date ? ` · ${edu.date}` : ''}
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            <section>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-stone-400 mb-2">
                    Skills ({skills.length})
                </h4>
                {skills.length === 0 ? (
                    <div className="text-[12px] text-rose-600 dark:text-rose-400">
                        Empty — keyword matching loses its biggest signal.
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        {skills.map((s, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11.5px] font-mono text-slate-700 dark:text-stone-200"
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

const DerivedCard = ({ label, value }) => (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider font-mono text-slate-400 dark:text-stone-500">
            {label}
        </div>
        <div className="text-[13px] font-semibold text-slate-900 dark:text-stone-100 truncate mt-0.5">
            {value || <Empty>—</Empty>}
        </div>
    </div>
);

const AtsPreviewModal = ({ onClose, resume }) => {
    const [tab, setTab] = useState('fields');
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
    const fields = useMemo(() => parseAtsFields(resume), [resume]);
    const keywords = useMemo(() => buildKeywordIndex(resume), [resume]);

    const handleCopy = async () => {
        const payload =
            tab === 'fields'
                ? JSON.stringify(fields, null, 2)
                : tab === 'keywords'
                  ? keywords.map((k) => `${k.original}\t${k.count}`).join('\n')
                  : text;
        try {
            await navigator.clipboard.writeText(payload);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard blocked — silently fail */
        }
    };

    const copyLabel = tab === 'fields' ? 'Copy JSON' : tab === 'keywords' ? 'Copy index' : 'Copy plain text';

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
                                    <Copy size={12} /> {copyLabel}
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

                {/* Tab strip */}
                <div className="px-5 pt-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-end gap-1">
                    {TABS.map((t) => {
                        const Icon = t.icon;
                        const active = tab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium border-b-2 -mb-px transition-colors ${
                                    active
                                        ? 'border-slate-900 dark:border-stone-100 text-slate-900 dark:text-stone-100'
                                        : 'border-transparent text-slate-500 dark:text-stone-400 hover:text-slate-700 dark:hover:text-stone-200'
                                }`}
                            >
                                <Icon size={13} /> {t.label}
                            </button>
                        );
                    })}
                    <div className="ml-auto text-[11px] text-slate-400 dark:text-stone-500 pb-2.5 hidden sm:block">
                        {TABS.find((t) => t.id === tab)?.hint}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_320px] min-h-0">
                    <div className="overflow-y-auto p-5 bg-slate-50 dark:bg-slate-950/40">
                        {tab === 'fields' && <ParsedFieldsView fields={fields} />}
                        {tab === 'text' && (
                            <pre className="font-mono text-[12.5px] leading-[1.65] text-slate-800 dark:text-stone-200 whitespace-pre-wrap break-words selection:bg-slate-900 selection:text-white dark:selection:bg-stone-100 dark:selection:text-slate-900">
                                {text || '(empty resume)'}
                            </pre>
                        )}
                        {tab === 'keywords' && (
                            <div>
                                <div className="text-[11.5px] text-slate-500 dark:text-stone-400 mb-3">
                                    {keywords.length} unique terms. Recruiter searches like
                                    &ldquo;Postgres&rdquo; only hit words that appear here.
                                </div>
                                {keywords.length === 0 ? (
                                    <div className="text-rose-600 dark:text-rose-400 text-sm">
                                        Empty index — nothing for the bot to match against.
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {keywords.map((k, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11.5px] font-mono text-slate-700 dark:text-stone-200"
                                                title={`${k.count} occurrence${k.count === 1 ? '' : 's'}`}
                                            >
                                                {k.original}
                                                {k.count > 1 && (
                                                    <span className="text-slate-400 dark:text-stone-500 text-[10px]">
                                                        ×{k.count}
                                                    </span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
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
                                What you&apos;re looking at.
                            </p>
                            <p>
                                Real ATSes don&apos;t store your PDF. They store a structured row: name,
                                email, current title, years of experience, skill tags. That row is what
                                recruiters search and filter on. The three tabs show each layer the bot
                                generates.
                            </p>
                        </div>
                    </aside>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AtsPreviewModal;
