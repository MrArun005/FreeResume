import React, { useState } from 'react';
import { X, Briefcase, FileText, CheckCircle, AlertTriangle, Sparkles, Loader, ArrowRight, Copy } from 'lucide-react';

const JobAssistantModal = ({ isOpen, onClose, resume, onImproveResume }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [activeTab, setActiveTab] = useState('match'); // 'match' | 'coverLetter'
    const [isLoading, setIsLoading] = useState(false);
    const [matchResult, setMatchResult] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');

    if (!isOpen) return null;

    const handleMatch = async () => {
        if (!jobDescription.trim()) return alert("Please enter a job description.");
        setIsLoading(true);
        try {
            const response = await fetch('/api/match-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: resume, jobDescription })
            });
            const data = await response.json();
            setMatchResult(data);
        } catch (error) {
            console.error(error);
            alert("Failed to analyze job match.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateCoverLetter = async () => {
        if (!jobDescription.trim()) return alert("Please enter a job description.");
        setIsLoading(true);
        try {
            const response = await fetch('/api/generate-cover-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: resume, jobDescription })
            });
            const data = await response.json();
            setCoverLetter(data.coverLetter);
        } catch (error) {
            console.error(error);
            alert("Failed to generate cover letter.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTailor = async () => {
        if (!jobDescription.trim()) return alert("Please enter a job description or URL.");
        if (!window.confirm("This will overwrite your current resume content with a tailored version. You can Undo this. Continue?")) return;

        setIsLoading(true);
        try {
            const isUrl = jobDescription.startsWith('http');

            let body = { resumeData: resume };
            if (isUrl) {
                body.jobUrl = jobDescription;
            } else {
                alert("Please provide a valid URL to tailor the resume.");
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/tailor-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (data.tailoredResume) {
                onImproveResume(data.tailoredResume);
                alert("Resume tailored successfully! Check the editor.");
                onClose();
            }
        } catch (error) {
            console.error(error);
            alert("Failed to tailor resume.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-brand-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-600 rounded-lg text-white shadow-lg shadow-brand-200">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Job Application Assistant</h2>
                            <p className="text-sm text-gray-500">AI-powered analysis & tailoring</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

                    {/* Left: Input */}
                    <div className="w-full md:w-1/3 p-6 border-r border-gray-100 bg-gray-50 flex flex-col gap-4 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Job Description or URL</label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste Job Description text OR a Job Post URL (e.g., LinkedIn, Indeed)..."
                                className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => { setActiveTab('match'); handleMatch(); }}
                                disabled={isLoading || !jobDescription}
                                className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'match' ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                            >
                                {isLoading && activeTab === 'match' ? <Loader className="animate-spin" /> : <CheckCircle size={18} />}
                                Analyze Match
                            </button>
                            <button
                                onClick={() => { setActiveTab('tailor'); handleTailor(); }}
                                disabled={isLoading || !jobDescription}
                                className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'tailor' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                            >
                                {isLoading && activeTab === 'tailor' ? <Loader className="animate-spin" /> : <Sparkles size={18} />}
                                Tailor Resume
                            </button>
                            <button
                                onClick={() => { setActiveTab('coverLetter'); handleGenerateCoverLetter(); }}
                                disabled={isLoading || !jobDescription}
                                className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'coverLetter' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                            >
                                {isLoading && activeTab === 'coverLetter' ? <Loader className="animate-spin" /> : <FileText size={18} />}
                                Write Cover Letter
                            </button>
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-white">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                                <Loader size={48} className="animate-spin text-blue-500" />
                                <p className="font-medium">AI is analyzing...</p>
                            </div>
                        ) : activeTab === 'match' && matchResult ? (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Score */}
                                <div className="flex items-center gap-6">
                                    <div className="relative w-24 h-24 flex-shrink-0">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="48" cy="48" r="40" stroke="#eee" strokeWidth="8" fill="none" />
                                            <circle
                                                cx="48" cy="48" r="40"
                                                stroke={matchResult.score > 70 ? "#22c55e" : matchResult.score > 40 ? "#eab308" : "#ef4444"}
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={251.2}
                                                strokeDashoffset={251.2 - (251.2 * matchResult.score) / 100}
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-2xl font-bold text-gray-900">{matchResult.score}%</span>
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Match</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Match Analysis</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{matchResult.matchSummary}</p>
                                    </div>
                                </div>

                                {/* Missing Keywords */}
                                {matchResult.missingKeywords?.length > 0 && (
                                    <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                                        <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                                            <AlertTriangle size={18} /> Missing Keywords
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {matchResult.missingKeywords.map((kw, i) => (
                                                <span key={i} className="px-3 py-1 bg-white text-red-600 rounded-full text-sm font-medium border border-red-200 shadow-sm">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Advice */}
                                {matchResult.tailoringAdvice?.length > 0 && (
                                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                        <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                                            <Sparkles size={18} /> Tailoring Advice
                                        </h4>
                                        <ul className="space-y-2">
                                            {matchResult.tailoringAdvice.map((tip, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                                                    <ArrowRight size={14} className="mt-1 flex-shrink-0" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'coverLetter' && coverLetter ? (
                            <div className="animate-fadeIn h-full flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900">Generated Cover Letter</h3>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(coverLetter)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                    >
                                        <Copy size={14} /> Copy Text
                                    </button>
                                </div>
                                <div className="flex-1 p-6 bg-gray-50 rounded-xl border border-gray-200 overflow-y-auto font-serif text-gray-800 leading-relaxed whitespace-pre-wrap shadow-inner">
                                    {coverLetter}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                                <Briefcase size={64} className="mb-4" />
                                <p className="text-lg font-medium">Paste a Job Description to start</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobAssistantModal;
