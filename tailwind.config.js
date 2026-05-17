export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            // Brand color scale — every shade resolves to a CSS custom
            // property set in :root by src/theme/tokens.js. Switching a
            // theme just rewrites those vars on :root; nothing else needs
            // to know. Use bg-brand-600, text-brand-700, border-brand-200, etc.
            colors: {
                brand: {
                    50: 'var(--brand-50)',
                    100: 'var(--brand-100)',
                    200: 'var(--brand-200)',
                    300: 'var(--brand-300)',
                    400: 'var(--brand-400)',
                    500: 'var(--brand-500)',
                    600: 'var(--brand-600)',
                    700: 'var(--brand-700)',
                    800: 'var(--brand-800)',
                    900: 'var(--brand-900)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
                display: ['Orbitron', 'sans-serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
                clean: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                'serif-display': ['"Instrument Serif"', 'Georgia', 'serif'],
                // Kept for any legacy cyberpunk fragments still using these.
                tech: ['Rajdhani', 'sans-serif'],
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'fade-in-down': 'fadeInDown 0.8s ease-out forwards',
                'fade-in': 'fade In 1s ease-out forwards',
                'zoom-in': 'zoomIn 0.6s ease-out forwards',
                'slide-in-left': 'slideInLeft 0.8s ease-out forwards',
                'slide-in-right': 'slideInRight 0.8s ease-out forwards',
                'float': 'float 3s ease-in-out infinite',
                'marquee': 'marquee 30s linear infinite',
                'slow-scroll': 'slowScroll 40s linear infinite',
                'scroll': 'scroll 30s linear infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                zoomIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                slowScroll: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                scroll: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            }
        },
    },
    plugins: [],
}
