import React from 'react';

// Paperjet logo. A rounded-square letter mark with a stylized "P" + a
// subtle motion line that reads as a paper-plane trail. Both the mark and
// the wordmark draw from CSS custom properties so a theme switch repaints
// them automatically without touching this file.
// `tone` controls the wordmark color so the logo reads cleanly on both
// light and dark backgrounds. The brand mark itself stays the gradient
// teal regardless of tone — only the "Paper" half of the wordmark flips.
//
// Default is `'dark'` (dark text on light surface) because every page that
// renders the Logo today uses a light surface (landing nav stone-50,
// editor sidebar stone-50). The footer + any future dark surfaces opt in
// with `tone="light"`. We intentionally don't tie the tone to the global
// `.dark` class because those backgrounds are hardcoded light and the
// app-wide dark mode toggle doesn't affect them.
const Logo = ({ className = "w-8 h-8", textClassName = "text-xl", tone = 'dark' }) => {
    const wordmarkClass = tone === 'light' ? 'text-stone-50' : 'text-slate-900';
    return (
        <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className={`relative ${className} transition-transform duration-300 group-hover:scale-110`}>
                <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-sm"
                >
                    <defs>
                        <linearGradient id="paperjet-grad" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="var(--brand-600, #0D9488)" />
                            <stop offset="100%" stopColor="var(--brand-700, #0F766E)" />
                        </linearGradient>
                    </defs>

                    {/* Rounded square mark */}
                    <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#paperjet-grad)" />

                    {/* Letterform: stylized P drawn with two stroked paths
                        so it sits cleanly at every size without font-loading risk. */}
                    <path
                        d="M14 12 L14 28"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <path
                        d="M14 12 H22 C25.5 12 27.5 14 27.5 17 C27.5 20 25.5 22 22 22 H14"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    {/* Paper-plane / motion line — short underbar to the right of the bowl */}
                    <path
                        d="M19 28 H30"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.75"
                    />
                </svg>

                {/* Hover glow */}
                <div
                    className="absolute inset-0 blur-lg rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'var(--brand-500-alpha-20, rgba(20,184,166,0.20))' }}
                />
            </div>

            {/* Wordmark — "Paper" in surface text color, "jet" in brand gradient. */}
            <div className={`font-bold tracking-tight ${textClassName}`}>
                <span className={`${wordmarkClass} transition-colors`}>Paper</span>
                <span
                    className="bg-clip-text text-transparent transition-colors"
                    style={{ backgroundImage: 'linear-gradient(90deg, var(--brand-600, #0D9488), var(--brand-500, #14B8A6))' }}
                >
                    jet
                </span>
            </div>
        </div>
    );
};

export default Logo;
