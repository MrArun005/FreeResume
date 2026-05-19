import { useEffect } from 'react';
import { Upload, FileText, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Onboarding modal — first thing the user sees when they pick a template.
// Two paths: upload an existing resume to auto-fill, or start blank.
//
// Accepts onClose (matches the rest of the modal API). Backdrop click and
// Escape key both close the modal. Visual language matches the landing page —
// slate/stone palette, brand-warm for the primary action, sky for the
// alternative, soft radial wash behind the surface.
const OnboardingModal = ({ onUpload, onCreateNew, onClose }) => {
    // Escape to close. Effect mounts once with the modal; cleanup removes the
    // listener so nothing leaks if the parent unmounts us.
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 shadow-2xl shadow-slate-900/20"
            >
                {/* Soft radial wash so the surface isn't a flat panel — sky on left, */}
                {/* peach on right, matching the landing-page palette. */}
                <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none dark:opacity-30"
                    style={{
                        background:
                            'radial-gradient(500px circle at 0% 0%, rgba(186,230,253,0.45), transparent 55%), radial-gradient(500px circle at 100% 100%, rgba(254,215,170,0.40), transparent 55%)',
                    }}
                />

                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X size={18} strokeWidth={2.2} />
                </button>

                <div className="relative p-8 sm:p-10">
                    <div className="text-center max-w-md mx-auto">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-stone-400 mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Almost there
                        </div>
                        <h2 className="font-serif-display text-3xl sm:text-4xl leading-tight tracking-tight text-slate-900 dark:text-stone-100">
                            How would you like to start?
                        </h2>
                        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-stone-400 leading-relaxed">
                            Upload an existing resume to auto-fill, or start from a clean slate.
                        </p>
                    </div>

                    <div className="mt-8 grid sm:grid-cols-2 gap-4">
                        {/* Primary path — peach warmth on hover */}
                        <button
                            onClick={onUpload}
                            className="group relative isolate text-left rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-transparent transition-colors overflow-hidden"
                        >
                            <span
                                aria-hidden
                                className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background:
                                        'linear-gradient(135deg, rgba(254,215,170,0.55) 0%, rgba(253,186,116,0.40) 100%)',
                                }}
                            />
                            <div className="w-11 h-11 rounded-xl bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                <Upload size={20} strokeWidth={2} />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-stone-100 mb-1.5 tracking-tight">
                                Upload existing resume
                            </h3>
                            <p className="text-[13px] text-slate-600 dark:text-stone-400 leading-relaxed">
                                We&rsquo;ll parse your PDF or DOCX and fill in everything we can.
                            </p>
                            <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-stone-300 group-hover:gap-2 transition-all">
                                Pick a file
                                <ArrowRight size={12} strokeWidth={2.4} />
                            </div>
                        </button>

                        {/* Secondary path — sky/mint on hover */}
                        <button
                            onClick={onCreateNew}
                            className="group relative isolate text-left rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-transparent transition-colors overflow-hidden"
                        >
                            <span
                                aria-hidden
                                className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background:
                                        'linear-gradient(135deg, rgba(186,230,253,0.55) 0%, rgba(167,243,208,0.40) 100%)',
                                }}
                            />
                            <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                                <FileText size={20} strokeWidth={2} />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-stone-100 mb-1.5 tracking-tight">
                                Start from scratch
                            </h3>
                            <p className="text-[13px] text-slate-600 dark:text-stone-400 leading-relaxed">
                                Blank canvas with sample placeholders — write your own from the top.
                            </p>
                            <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-stone-300 group-hover:gap-2 transition-all">
                                Open the editor
                                <ArrowRight size={12} strokeWidth={2.4} />
                            </div>
                        </button>
                    </div>

                    <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-stone-500">
                        You can switch templates and edit everything later.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default OnboardingModal;
