import React, { useState } from 'react';
import {
    X,
    Sparkles,
    Loader,
    Plus,
    Check,
    AlertTriangle,
    ChevronRight,
    ArrowDown,
    ArrowUp,
    Minus,
    Lock,
    Briefcase,
} from 'lucide-react';

// Smart Tailor — JD-driven non-destructive bullet reranking.
//
// What makes this different from every other resume builder's "Tailor"
// button: we DO NOT rewrite the candidate's bullets. The model only
// SCORES each bullet against the JD and SUGGESTS a reorder. The user's
// exact wording stays intact. They click "Apply" to commit the reorder,
// or pick individual bullets to lift/sink.
//
// The competitive moat: every other builder's "tailor" flattens voice
// into ATS-friendly slop. This keeps the candidate's voice and just
// shows their best bullets first for this specific JD.
const AutoTailorModal = ({
    isOpen,
    onClose,
    resume,
    onResumeChange,
    onSaveToTracker,
    activeProfileId,
    activeProfileName,
}) => {
    const [jobDescription, setJobDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [appliedKeywords, setAppliedKeywords] = useState(new Set());
    // Tracks whether we've already saved THIS analysis to the tracker, so
    // clicking twice doesn't duplicate. Reset on every fresh Analyze.
    const [trackerSavedId, setTrackerSavedId] = useState(null);

    if (!isOpen) return null;

    const reset = () => {
        setResult(null);
        setError('');
        setAppliedKeywords(new Set());
        setTrackerSavedId(null);
    };

    // Guess company + role from the JD so the tracker entry isn't blank.
    // First non-empty line that doesn't look like a generic preamble wins.
    // Cheap heuristic — user can edit the card afterwards.
    const guessCompanyAndRole = (jd) => {
        const lines = jd
            .split(/\n+/)
            .map((l) => l.trim())
            .filter(Boolean);
        const company = lines
            .find((l) => /\b(at|@)\b\s+([A-Z][\w& ,.-]+)/.test(l))
            ?.match(/\b(?:at|@)\s+([A-Z][\w& ,.-]{1,40})/)?.[1]
            ?.trim();
        const role =
            lines.find((l) =>
                /^(Senior|Staff|Lead|Principal|Junior|Software|Product|Engineer|Designer|Manager|Director)\b/i.test(
                    l
                )
            ) || lines[0]?.slice(0, 80);
        return { company: company || '', role: role || '' };
    };

    const handleSaveToTracker = () => {
        if (!onSaveToTracker || !result || trackerSavedId) return;
        const guess = guessCompanyAndRole(jobDescription);
        const id = onSaveToTracker({
            company: guess.company,
            role: guess.role,
            status: 'saved',
            notes: `Smart Tailor analysis: ${result.summary || ''}`.trim(),
            resumeProfileId: activeProfileId || null,
            matchScore: typeof result.currentScore === 'number' ? result.currentScore : null,
        });
        if (id) setTrackerSavedId(id);
    };

    const handleAnalyze = async () => {
        if (!jobDescription.trim() || jobDescription.length < 50) {
            setError('Paste at least a short job description (50+ chars).');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/rerank-bullets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: resume, jobDescription }),
            });
            if (!response.ok) {
                const detail = await response.json().catch(() => ({}));
                throw new Error(detail.details || detail.error || `Server error ${response.status}`);
            }
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message || 'Analysis failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Reorder one experience's bullets. Pure function on the bullets array.
    const reorderBullets = (bullets, suggestedOrder) => {
        if (!Array.isArray(suggestedOrder) || suggestedOrder.length !== bullets.length) return bullets;
        // Sanity: every index must appear exactly once.
        const seen = new Set();
        for (const i of suggestedOrder) {
            if (typeof i !== 'number' || i < 0 || i >= bullets.length || seen.has(i)) return bullets;
            seen.add(i);
        }
        return suggestedOrder.map((i) => bullets[i]);
    };

    const handleApplyAll = () => {
        if (!result?.experienceRerank) return;
        onResumeChange((prev) => ({
            ...prev,
            experience: prev.experience.map((exp) => {
                const rerank = result.experienceRerank.find((r) => r.experienceId === exp.id);
                if (!rerank) return exp;
                return { ...exp, bullets: reorderBullets(exp.bullets, rerank.suggestedOrder) };
            }),
        }));
        onClose();
    };

    const handleApplyOne = (experienceId, suggestedOrder) => {
        onResumeChange((prev) => ({
            ...prev,
            experience: prev.experience.map((exp) =>
                exp.id === experienceId
                    ? { ...exp, bullets: reorderBullets(exp.bullets, suggestedOrder) }
                    : exp
            ),
        }));
    };

    // Add a missing keyword to the skills list. Idempotent — won't duplicate.
    const handleAddKeyword = (keyword) => {
        onResumeChange((prev) => {
            const existing = prev.skills || [];
            if (existing.some((s) => s.toLowerCase() === keyword.toLowerCase())) return prev;
            return { ...prev, skills: [...existing, keyword] };
        });
        setAppliedKeywords((s) => new Set(s).add(keyword.toLowerCase()));
    };

    const renderScoreRing = (score, color) => (
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" stroke="#e2e8f0" strokeWidth="6" fill="none" />
            <circle
                cx="32"
                cy="32"
                r="26"
                stroke={color}
                strokeWidth="6"
                fill="none"
                strokeDasharray={163.4}
                strokeDashoffset={163.4 - (163.4 * Math.max(0, Math.min(100, score))) / 100}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
            />
        </svg>
    );

    const scoreColor = (s) => (s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn no-print">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-500/10 dark:to-indigo-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-600 rounded-lg text-white shadow-lg shadow-brand-200 dark:shadow-brand-500/20">
                            <Sparkles size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-stone-100 m-0">
                                Smart Tailor{' '}
                                <span className="text-[11px] font-medium align-middle ml-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                                    keeps your voice
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-stone-400 m-0">
                                We rank your bullets against the JD &mdash; we don&apos;t rewrite them.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/60 dark:hover:bg-slate-800 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={22} className="text-slate-500 dark:text-stone-400" />
                    </button>
                </div>

                {/* Body — JD input on the left, results on the right */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
                    {/* Left: input */}
                    <div className="w-full md:w-[360px] p-6 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col gap-4 overflow-y-auto">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 mb-2">
                                Paste the job description
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => {
                                    setJobDescription(e.target.value);
                                    if (result) reset();
                                }}
                                placeholder={`We promise: nothing in your resume gets rewritten. We score each bullet you've already written and surface the most JD-relevant ones first.\n\nPaste the role's full JD here — bullets, responsibilities, requirements, the works.`}
                                className="w-full h-72 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-stone-200 placeholder:text-slate-400 dark:placeholder:text-stone-500 focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none text-[13px] leading-relaxed"
                            />
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !jobDescription.trim()}
                            className="w-full py-3 rounded-xl font-semibold bg-brand-600 hover:bg-brand-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <Loader size={16} className="animate-spin" /> Analyzing&hellip;
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} /> Analyze & rank
                                </>
                            )}
                        </button>
                        {error && (
                            <div className="text-[12px] text-red-700 bg-red-50 dark:bg-red-500/10 dark:text-red-300 border border-red-200 dark:border-red-500/30 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}
                        <div className="text-[11px] text-slate-500 dark:text-stone-400 leading-relaxed bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex gap-2">
                            <Lock size={12} className="mt-0.5 shrink-0 text-emerald-600" />
                            <span>
                                <span className="font-semibold text-slate-700 dark:text-stone-200">
                                    Your wording is preserved.
                                </span>{' '}
                                Other builders rewrite bullets to be &ldquo;ATS-friendly&rdquo; and flatten
                                your voice. We just reorder what you already wrote.
                            </span>
                        </div>
                    </div>

                    {/* Right: results */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">
                        {!result && !isLoading && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-stone-500 opacity-80 text-center">
                                <Sparkles size={56} className="mb-4 text-brand-300" />
                                <p className="text-base font-medium">
                                    Paste a JD on the left, then click Analyze.
                                </p>
                                <p className="text-sm mt-1 max-w-md">
                                    We&apos;ll show match score, which bullets to lift to the top, and the
                                    must-have keywords you&apos;re missing.
                                </p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-stone-500 gap-4">
                                <Loader size={48} className="animate-spin text-brand-500" />
                                <p className="font-medium">Scoring your bullets against the JD&hellip;</p>
                            </div>
                        )}

                        {result && !isLoading && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Score banner: current → potential */}
                                <div className="flex items-center gap-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
                                    <div className="relative flex items-center justify-center">
                                        {renderScoreRing(
                                            result.currentScore,
                                            scoreColor(result.currentScore)
                                        )}
                                        <span className="absolute text-base font-bold text-slate-900 dark:text-stone-100">
                                            {result.currentScore}
                                        </span>
                                    </div>
                                    <ChevronRight size={22} className="text-slate-300 dark:text-slate-600" />
                                    <div className="relative flex items-center justify-center">
                                        {renderScoreRing(
                                            result.potentialScore,
                                            scoreColor(result.potentialScore)
                                        )}
                                        <span className="absolute text-base font-bold text-emerald-600 dark:text-emerald-400">
                                            {result.potentialScore}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-stone-400 font-bold">
                                            Match: current &rarr; potential
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-stone-200 mt-1 leading-snug">
                                            {result.summary}
                                        </p>
                                    </div>
                                </div>

                                {/* Missing keywords */}
                                {result.missingKeywords?.length > 0 && (
                                    <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4">
                                        <h3 className="text-[11px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-1.5">
                                            <AlertTriangle size={12} /> Keywords the JD wants &mdash; click to
                                            add to Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missingKeywords.map((kw) => {
                                                const added = appliedKeywords.has(kw.keyword.toLowerCase());
                                                const isMustHave = kw.importance === 'must-have';
                                                return (
                                                    <button
                                                        key={kw.keyword}
                                                        onClick={() => handleAddKeyword(kw.keyword)}
                                                        disabled={added}
                                                        title={kw.rationale || ''}
                                                        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border transition-all ${
                                                            added
                                                                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 cursor-default'
                                                                : isMustHave
                                                                  ? 'bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                                                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-stone-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        {added ? <Check size={12} /> : <Plus size={12} />}
                                                        {kw.keyword}
                                                        {isMustHave && !added && (
                                                            <span className="text-[9px] uppercase font-bold opacity-70">
                                                                must
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Per-experience reorder previews */}
                                {result.experienceRerank?.map((rerank) => {
                                    const exp = resume.experience.find((e) => e.id === rerank.experienceId);
                                    if (!exp) return null;
                                    const isAlreadyOptimal = rerank.suggestedOrder.every(
                                        (idx, pos) => idx === pos
                                    );
                                    return (
                                        <div
                                            key={rerank.experienceId}
                                            className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-slate-900 dark:text-stone-100 truncate">
                                                        {exp.role}
                                                    </div>
                                                    <div className="text-[12px] text-slate-500 dark:text-stone-400">
                                                        {exp.company}
                                                        {exp.date && ` · ${exp.date}`}
                                                    </div>
                                                </div>
                                                {isAlreadyOptimal ? (
                                                    <span className="shrink-0 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-2 py-1 rounded-full flex items-center gap-1">
                                                        <Check size={11} /> Already optimal
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            handleApplyOne(
                                                                rerank.experienceId,
                                                                rerank.suggestedOrder
                                                            )
                                                        }
                                                        className="shrink-0 text-[11px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/15 border border-brand-200 dark:border-brand-500/30 hover:bg-brand-100 dark:hover:bg-brand-500/25 px-2.5 py-1 rounded-full transition-colors"
                                                    >
                                                        Apply this reorder
                                                    </button>
                                                )}
                                            </div>
                                            <ol className="space-y-2">
                                                {rerank.suggestedOrder.map((origIdx, newPos) => {
                                                    const bulletText = exp.bullets[origIdx];
                                                    const score = rerank.bulletScores?.find(
                                                        (b) => b.index === origIdx
                                                    );
                                                    const movement = origIdx - newPos;
                                                    return (
                                                        <li
                                                            key={origIdx}
                                                            className="flex gap-3 items-start text-[13px] text-slate-700 dark:text-stone-200"
                                                        >
                                                            <div className="shrink-0 w-16 flex flex-col items-end gap-0.5 pt-0.5">
                                                                <div
                                                                    className={`text-[11px] font-bold tabular-nums ${
                                                                        score?.relevance > 0
                                                                            ? 'text-emerald-700 dark:text-emerald-400'
                                                                            : score?.relevance < 0
                                                                              ? 'text-red-700 dark:text-red-400'
                                                                              : 'text-slate-500 dark:text-stone-400'
                                                                    }`}
                                                                >
                                                                    {score?.relevance > 0 && '+'}
                                                                    {score?.relevance ?? 0}
                                                                </div>
                                                                {movement !== 0 && (
                                                                    <div className="text-[10px] text-slate-400 dark:text-stone-500 inline-flex items-center gap-0.5">
                                                                        {movement > 0 ? (
                                                                            <ArrowUp size={9} />
                                                                        ) : (
                                                                            <ArrowDown size={9} />
                                                                        )}
                                                                        {Math.abs(movement)}
                                                                    </div>
                                                                )}
                                                                {movement === 0 && (
                                                                    <Minus
                                                                        size={9}
                                                                        className="text-slate-300 dark:text-stone-600"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="leading-snug">
                                                                    {bulletText}
                                                                </div>
                                                                {score?.rationale && (
                                                                    <div className="text-[11px] text-slate-500 dark:text-stone-400 mt-0.5 italic">
                                                                        {score.rationale}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ol>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                {result && !isLoading && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="text-[11px] text-slate-500 dark:text-stone-400">
                            Reorders are undoable from the editor toolbar.
                        </div>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                            {onSaveToTracker && (
                                <button
                                    onClick={handleSaveToTracker}
                                    disabled={!!trackerSavedId}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold border flex items-center gap-1.5 transition-colors ${
                                        trackerSavedId
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 cursor-default'
                                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-stone-200 dark:border-slate-700'
                                    }`}
                                    title={
                                        trackerSavedId
                                            ? 'Already saved to your Job Tracker'
                                            : `Save to Job Tracker${activeProfileName ? ` (linked to "${activeProfileName}")` : ''}`
                                    }
                                >
                                    {trackerSavedId ? (
                                        <>
                                            <Check size={14} /> Saved to tracker
                                        </>
                                    ) : (
                                        <>
                                            <Briefcase size={14} /> Save to tracker
                                        </>
                                    )}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Keep mine
                            </button>
                            <button
                                onClick={handleApplyAll}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 transition-colors"
                            >
                                <Check size={14} /> Apply all reorders
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutoTailorModal;
