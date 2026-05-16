import React from 'react';

const Logo = ({ className = "w-8 h-8", textClassName = "text-xl" }) => {
    return (
        <div className="flex items-center gap-2.5 group cursor-pointer">
            {/* Logo Icon */}
            <div className={`relative ${className} transition-transform duration-300 group-hover:scale-110`}>
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                    <defs>
                        <linearGradient id="logo-gradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#0d9488" />
                            <stop offset="1" stopColor="#059669" />
                        </linearGradient>
                    </defs>
                    <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#logo-gradient)" />

                    {/* Pi Symbol */}
                    <path d="M12 13H28" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <path d="M17 13V27" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <path d="M23 13V24C23 26 24.5 27 26 27" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>

                {/* Glow Effect behind */}
                <div className="absolute inset-0 bg-teal-500/20 blur-lg rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Wordmark */}
            <div className={`font-bold tracking-tight ${textClassName}`}>
                <span className="text-gray-900 dark:text-white transition-colors">Free</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 transition-all">Resume</span>
            </div>
        </div>
    );
};

export default Logo;
