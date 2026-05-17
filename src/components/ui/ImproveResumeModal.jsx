import { X, Sparkles, CheckCircle2, AlertTriangle, Wand2 } from 'lucide-react';

// Single modal that handles the entire "Refine resume with AI" flow:
//   stage='confirm' — explain what will change, ask user to proceed
//   stage='loading' — show spinner while /api/improve-resume runs
//   stage='success' — confirm success + remind about Undo
//   stage='error'   — show the error message + retry

// Backdrop + card scaffolding, declared at module scope so React doesn't
// re-create the component on every render of ImproveResumeModal.
const Shell = ({ children, onClose, dismissable = true }) => (
    <div
        className="fixed inset-0 flex items-center justify-center z-[100] p-4"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={dismissable ? onClose : undefined}
    >
        <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col"
            style={{ boxShadow: '0 25px 50px -12px rgba(15,23,42,0.30)' }}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    </div>
);

const ImproveResumeModal = ({ stage, errorMessage, onConfirm, onClose, onRetry }) => {

    if (stage === 'loading') {
        return (
            <Shell onClose={onClose} dismissable={false}>
                <div className="px-6 py-10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center mb-4">
                        <div className="w-7 h-7 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1.5 tracking-tight">Refining your resume…</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Rewriting summary and experience bullets for clarity and impact.
                        This usually takes 10–20 seconds.
                    </p>
                </div>
            </Shell>
        );
    }

    if (stage === 'success') {
        return (
            <Shell onClose={onClose}>
                <header className="px-6 py-5 bg-emerald-50/60 border-b border-emerald-100 flex items-start gap-3">
                    <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 size={18} className="text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-slate-900 m-0 tracking-tight">Resume refined</h2>
                        <p className="text-sm text-slate-600 mt-0.5 leading-snug">Changes applied to your preview.</p>
                    </div>
                    <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-700 p-1 -m-1 transition-colors" aria-label="Close">
                        <X size={18} />
                    </button>
                </header>
                <div className="px-6 py-5">
                    <p className="text-sm text-slate-700 leading-relaxed">
                        Not happy with the rewrite? Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono">⌘Z</kbd> (or Ctrl+Z) to undo.
                    </p>
                </div>
                <footer className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                        Got it
                    </button>
                </footer>
            </Shell>
        );
    }

    if (stage === 'error') {
        return (
            <Shell onClose={onClose}>
                <header className="px-6 py-5 bg-red-50/60 border-b border-red-100 flex items-start gap-3">
                    <div className="shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle size={18} className="text-red-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-slate-900 m-0 tracking-tight">Couldn't refine your resume</h2>
                        <p className="text-sm text-slate-600 mt-0.5 leading-snug">Nothing was changed — your original is intact.</p>
                    </div>
                    <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-700 p-1 -m-1 transition-colors" aria-label="Close">
                        <X size={18} />
                    </button>
                </header>
                <div className="px-6 py-5 space-y-2">
                    {errorMessage && (
                        <div className="text-[12px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono leading-relaxed break-words">
                            {errorMessage}
                        </div>
                    )}
                    <p className="text-sm text-slate-500 leading-relaxed">
                        This usually means the AI service is busy or rate-limited. Wait a moment and try again.
                    </p>
                </div>
                <footer className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:text-slate-900 rounded-lg font-medium text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onRetry}
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                        Try again
                    </button>
                </footer>
            </Shell>
        );
    }

    // Default: confirm
    return (
        <Shell onClose={onClose}>
            <header className="px-6 py-5 flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center">
                    <Sparkles size={18} className="text-brand-700" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-slate-900 m-0 tracking-tight">Refine entire resume with AI</h2>
                    <p className="text-sm text-slate-500 mt-0.5 leading-snug">Anchored to your role, seniority, and industry.</p>
                </div>
                <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-700 p-1 -m-1 transition-colors" aria-label="Close">
                    <X size={18} />
                </button>
            </header>

            <div className="px-6 pb-5 space-y-3">
                <p className="text-sm text-slate-700 leading-relaxed">
                    We'll rewrite your <span className="font-semibold text-slate-900">summary</span> and{' '}
                    <span className="font-semibold text-slate-900">experience bullets</span> for clarity, impact, and ATS friendliness.
                </p>
                <ul className="text-[13px] text-slate-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                        <span className="text-brand-600 mt-0.5">·</span>
                        <span>Your dates, company names, education, and contact info won't change.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-brand-600 mt-0.5">·</span>
                        <span>Takes 10–20 seconds.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-brand-600 mt-0.5">·</span>
                        <span>
                            You can press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono">⌘Z</kbd> anytime to undo.
                        </span>
                    </li>
                </ul>
            </div>

            <footer className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 rounded-lg font-medium text-sm transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-sm transition-colors inline-flex items-center gap-1.5"
                >
                    <Wand2 size={14} /> Refine resume
                </button>
            </footer>
        </Shell>
    );
};

export default ImproveResumeModal;
