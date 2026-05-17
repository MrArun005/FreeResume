import React, { useState } from 'react';
import { X, Flame, Share2, AlertTriangle, ThumbsDown, Wand2, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isApplicableFix } from '../../utils/applyResumeFix';

const RoastModal = ({ isOpen, onClose, resumeData, onApplyFix }) => {
    const [loading, setLoading] = useState(false);
    const [roastData, setRoastData] = useState(null);
    const [error, setError] = useState(null);
    // Indices of red flags the user has applied this session.
    const [applied, setApplied] = useState(() => new Set());

    const handleRoast = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/roast-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData }),
            });

            if (!response.ok) throw new Error('Failed to fetch roast');

            const data = await response.json();
            setRoastData(data);
            setApplied(new Set());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [resumeData]);

    // Fetch a fresh roast when the modal opens.
    React.useEffect(() => {
        if (isOpen) {
            handleRoast();
        }
    }, [isOpen, handleRoast]);

    if (!isOpen) return null;

    const handleApply = (idx, fix) => {
        if (typeof onApplyFix === 'function') onApplyFix(fix);
        setApplied((prev) => {
            const next = new Set(prev);
            next.add(idx);
            return next;
        });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-zinc-900 border-2 border-red-500/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(239,68,68,0.3)]"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-zinc-900/95 border-b border-red-500/20 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <Flame className="w-6 h-6 text-red-500 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Roast My Resume</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 border-4 border-red-500/30 rounded-full animate-ping"></div>
                                    <div className="absolute inset-0 border-4 border-t-red-500 rounded-full animate-spin"></div>
                                </div>
                                <p className="text-red-400 font-medium animate-pulse">
                                    Heating up the grill...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
                                {error}
                            </div>
                        ) : roastData ? (
                            <div className="space-y-8">
                                {/* Score Section */}
                                <div className="text-center space-y-2">
                                    <div className="inline-block p-4 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 mb-4">
                                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                                            {roastData.score}/100
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">"{roastData.oneLiner}"</h3>
                                </div>

                                {/* The Main Roast */}
                                <div className="p-6 bg-red-950/30 border border-red-500/20 rounded-xl">
                                    <p className="text-lg text-red-200 italic leading-relaxed">
                                        "{roastData.roast}"
                                    </p>
                                </div>

                                {/* Specific Burns */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <ThumbsDown className="w-5 h-5 text-orange-500" />
                                        Specific Burns
                                    </h4>
                                    <div className="grid gap-3">
                                        {roastData.burns.map((burn, i) => (
                                            <div
                                                key={i}
                                                className="p-4 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:border-red-500/30 transition-colors"
                                            >
                                                🔥 {burn}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Red Flags — actionable */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                        Major Red Flags
                                    </h4>
                                    <div className="grid gap-3">
                                        {roastData.redFlags.map((flag, i) => {
                                            // Backwards-compat: tolerate older string-shaped redFlags
                                            const text = typeof flag === 'string' ? flag : flag?.text;
                                            const fix = typeof flag === 'object' ? flag.fix : null;
                                            const canApply = isApplicableFix(fix) && !applied.has(i);
                                            const isApplied = applied.has(i);
                                            return (
                                                <div
                                                    key={i}
                                                    className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <span className="flex-1">⚠️ {text}</span>
                                                        {(canApply || isApplied) &&
                                                            typeof onApplyFix === 'function' && (
                                                                <button
                                                                    onClick={
                                                                        canApply
                                                                            ? () => handleApply(i, fix)
                                                                            : undefined
                                                                    }
                                                                    disabled={!canApply}
                                                                    className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                                                                        isApplied
                                                                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-default'
                                                                            : 'bg-yellow-500 hover:bg-yellow-400 text-zinc-900 border border-yellow-400'
                                                                    }`}
                                                                >
                                                                    {isApplied ? (
                                                                        <>
                                                                            <CheckCircle size={12} /> Fixed
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Wand2 size={12} /> Fix this
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Action row */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {applied.size > 0 && (
                                        <button
                                            onClick={handleRoast}
                                            disabled={loading}
                                            className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <RefreshCw
                                                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                                            />
                                            Roast again with new resume
                                        </button>
                                    )}
                                    <button className="flex-1 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                                        <Share2 className="w-5 h-5" />
                                        Share My Shame
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RoastModal;
