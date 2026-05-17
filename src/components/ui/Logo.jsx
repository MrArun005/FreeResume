import React from 'react';

// LandedJob logo. A single bold "L"-checkmark glyph paired with a tight
// wordmark — no container frame so it reads as a brand mark rather than
// an app icon. The "L" stem descends and the foot tilts up into a
// checkmark stroke: the letter L (start of "Landed") and a tick (you
// landed it) in one continuous trajectory.
//
// `tone` controls the wordmark color so the logo reads cleanly on both
// light and dark backgrounds. The glyph itself stays in the brand
// gradient regardless — only the "Landed" half of the wordmark flips.
//
//   tone="auto"  (default) — follows the global light/dark theme via
//                            Tailwind's `dark:` variant.
//   tone="light"           — always light text. Use on surfaces that
//                            are designed dark in *both* modes.
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
        <div className="flex items-center gap-2 group cursor-pointer">
            <div className={`relative ${className} transition-transform duration-300 group-hover:scale-110`}>
                <svg
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    <defs>
                        <linearGradient
                            id="landedjob-grad"
                            x1="0"
                            y1="0"
                            x2="32"
                            y2="32"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0%" stopColor="var(--brand-500, #14B8A6)" />
                            <stop offset="100%" stopColor="var(--brand-700, #0F766E)" />
                        </linearGradient>
                    </defs>

                    {/* Single fluid stroke: L's vertical stem descends, then
                        foot tilts upward into a checkmark — letter + tick
                        in one continuous trajectory. */}
                    <path
                        d="M7 4 L7 22 L27 14"
                        stroke="url(#landedjob-grad)"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>

                {/* Hover glow */}
                <div
                    className="absolute inset-0 blur-lg rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'var(--brand-500-alpha-20, rgba(20,184,166,0.20))' }}
                />
            </div>

            {/* Wordmark — tight tracking, mixed weight so the brand half
                ("Job") punches through with the gradient while "Landed"
                grounds it in the surface text color. */}
            <div className={`font-extrabold tracking-tight ${textClassName} leading-none`}>
                <span className={`${wordmarkClass} transition-colors`}>Landed</span>
                <span
                    className="bg-clip-text text-transparent transition-colors"
                    style={{
                        backgroundImage:
                            'linear-gradient(90deg, var(--brand-600, #0D9488), var(--brand-500, #14B8A6))',
                    }}
                >
                    Job
                </span>
            </div>
        </div>
    );
};

export default Logo;
