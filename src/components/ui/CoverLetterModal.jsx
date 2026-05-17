import React, { useEffect, useState } from 'react';
import { X, FileText, Loader, Sparkles, Download, Copy, RefreshCcw } from 'lucide-react';
import { exportCoverLetterPdf } from '../../utils/exportPdf';

const TONE_OPTIONS = [
    {
        id: 'professional',
        label: 'Professional',
        hint: 'Confident, polished, conservative. Safe default.',
    },
    {
        id: 'enthusiastic',
        label: 'Enthusiastic',
        hint: 'Warm and energetic. Good for mission-driven companies.',
    },
    {
        id: 'concise',
        label: 'Concise',
        hint: 'Three tight paragraphs. Good for senior + recruiter-led roles.',
    },
];

// Cover letter generator. Opened from the Download menu. Two-stage flow:
//   1. Paste JD + pick tone → Generate (calls /api/generate-cover-letter).
//   2. Edit the generated text, then Download as PDF (via existing
//      /api/generate-pdf — see exportCoverLetterPdf for the HTML template).
const CoverLetterModal = ({ isOpen, onClose, resume }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [tone, setTone] = useState('professional');
    const [coverLetter, setCoverLetter] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setError('');
            setCopied(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!jobDescription.trim()) {
            setError('Paste a job description first.');
            return;
        }
        setError('');
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate-cover-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData: resume, jobDescription, tone }),
            });
            const data = await response.json();
            if (!response.ok || !data.coverLetter) {
                throw new Error(data?.error || data?.details || 'Generation failed.');
            }
            setCoverLetter(data.coverLetter);
        } catch (err) {
            setError(err?.message || 'Failed to generate cover letter.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!coverLetter.trim()) return;
        const candidateName = (resume?.personal?.fullName || resume?.personal?.name || 'CoverLetter')
            .trim()
            .replace(/\s+/g, '_');
        setIsDownloading(true);
        setError('');
        const result = await exportCoverLetterPdf({
            coverLetter,
            resumeData: resume,
            filename: `${candidateName}_CoverLetter.pdf`,
        });
        setIsDownloading(false);
        if (!result.ok) {
            setError(result.reason || 'PDF download failed.');
        }
    };

    const handleCopy = async () => {
        if (!coverLetter.trim()) return;
        try {
            await navigator.clipboard.writeText(coverLetter);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* user can still select-and-copy manually */
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-brand-50 to-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600 rounded-lg text-white shadow-lg shadow-purple-200">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Cover Letter</h2>
                            <p className="text-xs text-gray-500">
                                AI generates from your resume + the job description, then exports as PDF.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/60 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={22} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Left: inputs */}
                    <div className="w-full md:w-2/5 p-6 border-r border-gray-100 bg-gray-50 flex flex-col gap-4 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Job description
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description you're applying for..."
                                className="w-full h-48 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tone</label>
                            <div className="space-y-2">
                                {TONE_OPTIONS.map((opt) => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                            tone === opt.id
                                                ? 'border-brand-500 bg-brand-50 shadow-sm'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="cover-letter-tone"
                                            value={opt.id}
                                            checked={tone === opt.id}
                                            onChange={() => setTone(opt.id)}
                                            className="mt-1 accent-brand-600"
                                        />
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {opt.label}
                                            </div>
                                            <div className="text-xs text-gray-500">{opt.hint}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !jobDescription.trim()}
                            className="w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-brand-600 text-white hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader size={16} className="animate-spin" /> Generating...
                                </>
                            ) : coverLetter ? (
                                <>
                                    <RefreshCcw size={16} /> Regenerate
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} /> Generate
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right: preview / output */}
                    <div className="w-full md:w-3/5 p-6 overflow-y-auto bg-white flex flex-col gap-3">
                        {isGenerating ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                                <Loader size={42} className="animate-spin text-brand-500" />
                                <p className="text-sm">Writing your cover letter...</p>
                            </div>
                        ) : coverLetter ? (
                            <>
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900 text-sm">
                                        Edit before downloading
                                    </h3>
                                    <button
                                        onClick={handleCopy}
                                        className="text-xs text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                                    >
                                        <Copy size={13} /> {copied ? 'Copied' : 'Copy text'}
                                    </button>
                                </div>
                                <textarea
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    className="flex-1 min-h-[260px] p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm font-serif leading-relaxed text-gray-800"
                                />
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading || !coverLetter.trim()}
                                    className="w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isDownloading ? (
                                        <>
                                            <Loader size={16} className="animate-spin" /> Preparing PDF...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={16} /> Download PDF
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <FileText size={56} className="mb-3 opacity-60" />
                                <p className="text-sm font-medium">
                                    Paste a JD and pick a tone to get started
                                </p>
                                <p className="text-xs mt-1 text-gray-400">
                                    Your resume content stays in the editor — we only read it.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoverLetterModal;
