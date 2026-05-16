import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { calculateAtsScore } from '../../utils/atsScorer';

const AtsScoreModal = ({ resume, onClose }) => {
    const [analysis, setAnalysis] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const response = await fetch('/api/analyze-resume', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeData: resume })
                });

                if (!response.ok) throw new Error('Failed to analyze resume');

                const data = await response.json();
                setAnalysis(data);
            } catch (err) {
                console.error(err);
                // Fallback to local calculation if backend fails
                const localScore = calculateAtsScore(resume);
                setAnalysis({
                    score: localScore.score,
                    summary: "Basic analysis (AI unavailable)",
                    criticalIssues: localScore.issues,
                    improvements: localScore.tips,
                    keywordsFound: [],
                    missingKeywords: []
                });
            } finally {
                setLoading(false);
            }
        };

        if (resume) {
            fetchAnalysis();
        }
    }, [resume]);

    const getScoreColor = (s) => {
        if (s >= 80) return 'text-green-500';
        if (s >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBg = (s) => {
        if (s >= 80) return 'bg-green-100';
        if (s >= 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle className="text-teal-600" /> AI Resume Audit
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium">Analyzing your resume with AI...</p>
                        </div>
                    ) : analysis ? (
                        <>
                            {/* Score Display */}
                            <div className="text-center mb-8">
                                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-8 ${getScoreBg(analysis.score)} mb-4 transform transition-all hover:scale-105`}>
                                    <span className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}</span>
                                </div>
                                <p className="text-gray-500 font-medium">ATS Compatibility Score</p>
                                <p className="text-gray-500 font-medium text-center max-w-md mx-auto mt-2">
                                    {analysis.summary}
                                </p>
                            </div>

                            {/* Keywords Section */}
                            {(analysis.missingKeywords?.length > 0) && (
                                <div className="mb-8 bg-teal-50 p-4 rounded-xl border border-teal-100">
                                    <h3 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
                                        <Info size={18} /> Recommended Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.missingKeywords.map((kw, i) => (
                                            <span key={i} className="bg-white text-teal-600 px-2 py-1 rounded-md text-sm font-medium border border-teal-100 shadow-sm">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Critical Issues */}
                                <div>
                                    <h3 className="font-bold text-red-600 flex items-center gap-2 mb-3">
                                        <AlertCircle size={18} /> Critical Issues
                                    </h3>
                                    {analysis.criticalIssues.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" /> No critical issues found.
                                        </p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {analysis.criticalIssues.map((issue, idx) => (
                                                <li key={idx} className="text-sm bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                                                    <span className="mt-1">•</span> {issue.text}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Improvements */}
                                <div>
                                    <h3 className="font-bold text-yellow-600 flex items-center gap-2 mb-3">
                                        <AlertTriangle size={18} /> Improvements
                                    </h3>
                                    {analysis.improvements.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">No specific tips at this time.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {analysis.improvements.map((tip, idx) => (
                                                <li key={idx} className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-100 flex items-start gap-2">
                                                    <span className="mt-1">•</span> {tip.text}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition shadow-lg"
                    >
                        Close Analysis
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AtsScoreModal;
