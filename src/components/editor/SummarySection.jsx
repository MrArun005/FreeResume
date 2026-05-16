import React from 'react';
import { FileText } from 'lucide-react';

const SummarySection = ({ summary, onChange }) => {
    const [improving, setImproving] = React.useState(false);

    const handleImprove = async () => {
        if (!summary) return;
        setImproving(true);
        try {
            const response = await fetch('/api/improve-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: summary, type: 'summary' })
            });
            const data = await response.json();
            if (data.improvedText) {
                // Simulate event for onChange
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
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2 tracking-wide">
                    <FileText size={20} className="text-teal-400" /> Professional Summary
                </h2>
                <button
                    onClick={handleImprove}
                    disabled={improving || !summary}
                    className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/30 px-4 py-2 rounded-xl font-bold hover:bg-teal-500/20 hover:text-teal-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_20px_rgba(20,184,166,0.25)]"
                >
                    {improving ? (
                        <>
                            <div className="w-3.5 h-3.5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                            <span className="tracking-wide">Improving...</span>
                        </>
                    ) : (
                        <><span className="text-amber-400 leading-none">✨</span> <span className="tracking-wide text-gray-200 group-hover:text-white">Improve with AI</span></>
                    )}
                </button>
            </div>
            <textarea
                value={summary}
                onChange={(e) => {
                    onChange(e);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }}
                name="summary"
                className="w-full h-48 p-4 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all resize-y leading-relaxed text-gray-300 placeholder-gray-600 text-base shadow-inner custom-scrollbar"
                placeholder="Write a compelling summary..."
            />
        </div>
    );
};

export default SummarySection;
