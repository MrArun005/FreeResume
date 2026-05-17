import React from 'react';

// LandedJob logo. A rounded-square letter mark with a downward arrow
// landing on a strip — literal "you landed it" metaphor. The mark and
// the wordmark draw from CSS custom properties so a theme switch
// repaints them automatically without touching this file.
//
// `tone` controls the wordmark color so the logo reads cleanly on both
// light and dark backgrounds. The brand mark itself stays the gradient
// teal regardless of tone — only the "Job" half of the wordmark flips.
//
//   tone="auto"  (default) — follows the global light/dark theme via
//                            Tailwind's `dark:` variant. Use on any
//                            surface that flips with the user toggle.
//   tone="light"           — always light text. Use on surfaces that
//                            are designed dark in *both* modes (footer,
//                            editor top header chrome).
//   tone="dark"            — always dark text. Rare; permanently light
//                            surfaces only.
const Logo = ({ className = 'w-8 h-8', textClassName = 'text-xl', tone = 'auto' }) => {
    const wordmarkClass =
        tone === 'light'
            ? 'text-stone-50'
            : tone === 'dark'
              ? 'text-slate-900'
              : 'text-slate-900 dark:text-stone-100';
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
                        <linearGradient
                            id="landedjob-grad"
                            x1="2"
                            y1="2"
                            x2="38"
                            y2="38"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0%" stopColor="var(--brand-600, #0D9488)" />
                            <stop offset="100%" stopColor="var(--brand-700, #0F766E)" />
                        </linearGradient>
                    </defs>

                    {/* Rounded square mark */}
                    <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#landedjob-grad)" />

                    {/* Downward arrow shaft — the descent */}
                    <path d="M20 10 L20 24" stroke="white" strokeWidth="3" strokeLinecap="round" />

                    {/* Arrowhead — the impact point */}
                    <path
                        d="M14 19 L20 25 L26 19"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />

                    {/* Landing strip — the destination */}
                    <path
                        d="M10 31 H30"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        opacity="0.85"
                    />
                </svg>

                {/* Hover glow */}
                <div
                    className="absolute inset-0 blur-lg rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'var(--brand-500-alpha-20, rgba(20,184,166,0.20))' }}
                />
            </div>

            {/* Wordmark — "Landed" in brand gradient (the verb, the promise),
                "Job" in surface text (the noun, the object). */}
            <div className={`font-bold tracking-tight ${textClassName}`}>
                <span
                    className="bg-clip-text text-transparent transition-colors"
                    style={{
                        backgroundImage:
                            'linear-gradient(90deg, var(--brand-600, #0D9488), var(--brand-500, #14B8A6))',
                    }}
                >
                    Landed
                </span>
                <span className={`${wordmarkClass} transition-colors`}>Job</span>
            </div>
        </div>
    );
};

export default Logo;
