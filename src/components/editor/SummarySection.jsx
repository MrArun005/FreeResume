import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { FillTextarea, FieldLabel } from '../ui/EditorPrimitives';

const SummarySection = ({ summary, onChange, resume }) => {
    const [improving, setImproving] = React.useState(false);

    const handleImprove = async () => {
        if (!summary) return;
        setImproving(true);
        try {
            const response = await fetch('/api/improve-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: summary,
                    type: 'summary',
                    // Send the resume so the server-side prompt can ground the rewrite
                    // in the candidate's actual role, seniority, and industry rather
                    // than producing generic prose.
                    resumeData: resume,
                }),
            });
            const data = await response.json();
            if (data.improvedText) {
                onChange({ target: { name: 'summary', value: data.improvedText } });
            }
        } catch (error) {
            console.error('Failed to improve text:', error);
            alert('Failed to improve text. Please try again.');
        } finally {
            setImproving(false);
        }
    };

    return (
        <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 tracking-tight">
                <FileText size={18} className="text-brand-700" /> Professional summary
            </h2>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
                <FieldLabel>Summary</FieldLabel>
                <FillTextarea
                    value={summary || ''}
                    onChange={(e) => {
                        onChange(e);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    name="summary"
                    rows={6}
                    placeholder="Write 2–3 sentences. Focus on your strongest impact and the kind of work you want next."
                />
                {/* Character counter with soft-limit color cues. ATS-friendly
                    summaries land in 150–400 chars: long enough to seat the
                    target role + 2-3 standout skills, short enough that a
                    recruiter reads the whole thing. */}
                {(() => {
                    const len = (summary || '').length;
                    const sweetSpot = len >= 150 && len <= 400;
                    const tooShort = len > 0 && len < 150;
                    const tooLong = len > 400;
                    const color = tooLong
                        ? 'text-red-600'
                        : tooShort
                          ? 'text-amber-600'
                          : sweetSpot
                            ? 'text-emerald-600'
                            : 'text-slate-400';
                    const hint =
                        len === 0
                            ? 'Aim for 150–400 characters.'
                            : tooShort
                              ? 'A bit short — aim for 150+ characters.'
                              : tooLong
                                ? 'Getting long — trim toward 400 characters.'
                                : '';
                    return (
                        <div
                            className={`mt-1.5 text-[11px] ${color} transition-colors flex items-center gap-2`}
                        >
                            <span className="font-medium">{len} / 400</span>
                            {hint && <span className="text-slate-500">· {hint}</span>}
                        </div>
                    );
                })()}
                <button
                    onClick={handleImprove}
                    disabled={improving || !summary}
                    className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-50/60 text-brand-700 border border-brand-200 hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {improving ? (
                        <>
                            <div className="w-3 h-3 border-2 border-brand-200 border-t-brand-700 rounded-full animate-spin" />
                            Refining…
                        </>
                    ) : (
                        <>
                            <Sparkles size={11} /> Refine with AI
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SummarySection;
