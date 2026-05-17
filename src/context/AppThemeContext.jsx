import { createContext, useContext, useLayoutEffect, useState } from 'react';

// Light / dark mode for the whole app (editor + landing page). The selected
// resume template itself always renders on a white surface — recruiters
// expect a white-background resume — so the dark mode only affects the
// surrounding UI chrome, never the resume preview.
//
// Persisted under the `app-theme` localStorage key. We migrate the legacy
// `app-white` / `app-black` values left over from an earlier multi-variant
// version of this context: see CLAUDE notes in PRs from early 2026.

const STORAGE_KEY = 'app-theme';

const AppThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAppTheme = () => {
    const context = useContext(AppThemeContext);
    if (!context) {
        throw new Error('useAppTheme must be used within an AppThemeProvider');
    }
    return context;
};

const readInitialTheme = () => {
    if (typeof window === 'undefined') return 'light';
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        // Migrate the older two-value scheme so existing users don't get reset.
        if (saved === 'app-white') return 'light';
        if (saved === 'app-black') return 'dark';
        // First-time visit: respect the user's OS preference rather than
        // forcing a default — a dark-mode user shouldn't see a flashbang.
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    } catch {
        return 'light';
    }
};

export const AppThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(readInitialTheme);

    useLayoutEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'app-white', 'app-black');
        root.classList.add(theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            /* localStorage disabled — theme still applies for the session */
        }
    }, [theme]);

    const value = {
        theme,
        setTheme,
        toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
        themes: [
            { id: 'light', name: 'Light' },
            { id: 'dark', name: 'Dark' },
        ],
    };

    return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
};
