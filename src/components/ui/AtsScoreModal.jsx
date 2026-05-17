import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle, Wand2, RefreshCw } from 'lucide-react';
import { calculateAtsScore } from '../../utils/atsScorer';
import { isApplicableFix } from '../../utils/applyResumeFix';

const scorePalette = (score) => {
    if (score >= 80) return { bg: '#DCFCE7', border: '#BBF7D0', text: '#16A34A' }; // green
    if (score >= 60) return { bg: '#FEFCE8', border: '#FEF08A', text: '#CA8A04' }; // yellow
    return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' };                  // red
};

// Render a single finding (issue or improvement) with an inline Apply Fix
// button when the AI returned an actionable fix descriptor.
const FindingRow = ({ item, palette, onApply, applied }) => {
    const fix = item?.fix;
    const canApply = isApplicableFix(fix) && !applied;
    return (
        <li
            className="text-[13px] p-2.5 rounded-lg border flex items-start gap-2"
            style={palette}
        >
            <span className="mt-0.5">•</span>
            <div className="flex-1 min-w-0">
                <div>{item.text || item}</div>
                {(canApply || applied) && (
                    <button
                        onClick={canApply ? onApply : undefined}
                        disabled={!canApply}
                        className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                            applied
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                : 'bg-teal-600 hover:bg-teal-700 text-white border border-teal-700'
                        }`}
                    >
                        {applied ? (
                            <>
                                <CheckCircle size={12} /> Applied
                            </>
                        ) : (
                            <>
                                <Wand2 size={12} /> Apply fix
                            </>
                        )}
                    </button>
                )}
            </div>
        </li>
    );
};

const AtsScoreModal = ({ resume, onClose, onApplyFix }) => {
    const [analysis, setAnalysis] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    // Set of finding IDs the user has applied this session; used to disable
    // the button so they can't double-apply the same fix.
    const [applied, setApplied] = React.useState(() => new Set());

    const fetchAnalysis = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/analyze-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: resume }),
            });

            if (!response.ok) throw new Error('Failed to analyze resume');

            const data = await response.json();
            setAnalysis(data);
            // New analysis means a fresh set of findings — clear any prior
            // "applied" badges so the user sees the new state cleanly.
            setApplied(new Set());
        } catch (err) {
            console.error(err);
            const localScore = calculateAtsScore(resume);
            setAnalysis({
                score: localScore.score,
                summary: 'Basic analysis (AI unavailable)',
                criticalIssues: localScore.issues || [],
                improvements: localScore.tips || [],
                keywordsFound: [],
                missingKeywords: [],
            });
        } finally {
            setLoading(false);
        }
    }, [resume]);

    React.useEffect(() => {
        if (resume) fetchAnalysis();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApply = (id, fix) => {
        if (typeof onApplyFix === 'function') onApplyFix(fix);
        setApplied((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const handleApplyAllMissingKeywords = () => {
        if (typeof onApplyFix !== 'function') return;
        const kws = (analysis?.missingKeywords || []).filter(Boolean);
        if (kws.length === 0) return;
        onApplyFix({ type: 'add-keywords', target: 'skills', value: kws.join(', ') });
        setApplied((prev) => {
            const next = new Set(prev);
            next.add('__missing-keywords__');
            return next;
        });
    };

    const anyApplied = applied.size > 0;
    const missingKeywordsApplied = applied.has('__missing-keywords__');

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[100] p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                style={{ boxShadow: '0 25px 50px -12px rgba(15,23,42,0.30)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="flex items-center gap-2 text-[20px] font-bold text-slate-800 m-0 tracking-tight">
                        <CheckCircle size={20} className="text-teal-600" /> AI Resume Audit
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 transition-colors">
                        <X size={20} />
                    </button>
                </header>

                {/* Content */}
                <div className="px-6 py-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mb-4" />
                            <p className="text-slate-500 text-sm">Analyzing your resume with AI…</p>
                        </div>
                    ) : analysis ? (
                        <>
                            {/* Score Circle */}
                            <div className="text-center mb-8">
                                {(() => {
                                    const p = scorePalette(analysis.score);
                                    return (
                                        <div
                                            className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center"
                                            style={{ background: p.bg, border: `8px solid ${p.border}` }}
                                        >
                                            <span className="text-4xl font-bold" style={{ color: p.text }}>{analysis.score}</span>
                                        </div>
                                    );
                                })()}
                                <p className="text-sm text-slate-500 font-medium">ATS Compatibility Score</p>
                                {analysis.summary && (
                                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">{analysis.summary}</p>
                                )}
                            </div>

                            {/* Recommended keywords */}
                            {analysis.missingKeywords?.length > 0 && (
                                <div className="mb-6 rounded-xl p-4 border" style={{ background: 'rgba(13,148,136,0.05)', borderColor: 'rgba(13,148,136,0.15)' }}>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <h3 className="flex items-center gap-1.5 text-sm font-bold text-teal-900 m-0">
                                            <Info size={16} /> Recommended Keywords
                                        </h3>
                                        {typeof onApplyFix === 'function' && (
                                            <button
                                                onClick={missingKeywordsApplied ? undefined : handleApplyAllMissingKeywords}
                                                disabled={missingKeywordsApplied}
                                                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                                                    missingKeywordsApplied
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                                        : 'bg-teal-600 hover:bg-teal-700 text-white border border-teal-700'
                                                }`}
                                            >
                                                {missingKeywordsApplied ? (
                                                    <>
                                                        <CheckCircle size={12} /> Added
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wand2 size={12} /> Add all to Skills
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {analysis.missingKeywords.map((kw, i) => (
                                            <span
                                                key={i}
                                                className="bg-white text-teal-700 px-2.5 py-1 rounded-md text-[13px] font-medium border"
                                                style={{ borderColor: 'rgba(13,148,136,0.15)', boxShadow: '0 1px 2px 0 rgba(15,23,42,0.05)' }}
                                            >
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 2-col issues */}
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <h3 className="flex items-center gap-1.5 text-sm font-bold text-red-600 mb-2.5">
                                        <AlertCircle size={16} /> Critical Issues
                                    </h3>
                                    {(!analysis.criticalIssues || analysis.criticalIssues.length === 0) ? (
                                        <p className="text-[13px] text-slate-500 italic flex items-center gap-1.5">
                                            <CheckCircle size={12} className="text-emerald-500" /> Nothing critical.
                                        </p>
                                    ) : (
                                        <ul className="space-y-2 m-0 p-0 list-none">
                                            {analysis.criticalIssues.map((issue, idx) => {
                                                const id = issue.id || `crit-${idx}`;
                                                return (
                                                    <FindingRow
                                                        key={id}
                                                        item={issue}
                                                        palette={{ background: '#FEF2F2', color: '#991B1B', borderColor: '#FECACA' }}
                                                        onApply={() => handleApply(id, issue.fix)}
                                                        applied={applied.has(id)}
                                                    />
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>

                                <div>
                                    <h3 className="flex items-center gap-1.5 text-sm font-bold text-yellow-600 mb-2.5">
                                        <AlertTriangle size={16} /> Improvements
                                    </h3>
                                    {(!analysis.improvements || analysis.improvements.length === 0) ? (
                                        <p className="text-[13px] text-slate-500 italic">No specific tips at this time.</p>
                                    ) : (
                                        <ul className="space-y-2 m-0 p-0 list-none">
                                            {analysis.improvements.map((tip, idx) => {
                                                const id = tip.id || `imp-${idx}`;
                                                return (
                                                    <FindingRow
                                                        key={id}
                                                        item={tip}
                                                        palette={{ background: '#FEFCE8', color: '#854D0E', borderColor: '#FEF08A' }}
                                                        onApply={() => handleApply(id, tip.fix)}
                                                        applied={applied.has(id)}
                                                    />
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <footer className="px-4 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-2">
                    {anyApplied ? (
                        <button
                            onClick={fetchAnalysis}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Re-analyze
                        </button>
                    ) : <span />}
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                        Close analysis
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AtsScoreModal;
