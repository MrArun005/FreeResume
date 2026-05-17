import { createContext, useContext, useLayoutEffect, useState } from 'react';

const AppThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAppTheme = () => {
    const context = useContext(AppThemeContext);
    if (!context) {
        throw new Error('useAppTheme must be used within an AppThemeProvider');
    }
    return context;
};

export const AppThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('app-theme');
            if (saved === 'app-white' || saved === 'app-black') return saved;
            return 'app-black';
        }
        return 'app-black';
    });

    useLayoutEffect(() => {
        const root = window.document.documentElement;

        // Remove all theme classes
        root.classList.remove('light', 'dark', 'app-white', 'app-black');

        // Handle Dark/Light Mode
        if (theme === 'app-white') {
            root.classList.add('light');
            root.classList.remove('dark');
        } else {
            root.classList.add('dark');
            root.classList.remove('light');
        }

        // Add specific variant class
        root.classList.add(theme);

        // Save to local storage
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const value = {
        theme,
        setTheme,
        themes: [
            {
                id: 'app-white',
                name: 'White',
                icon: '☀️',
                color: 'bg-white text-black border border-gray-300',
            },
            {
                id: 'app-black',
                name: 'Black',
                icon: '🌙',
                color: 'bg-black text-white border border-gray-700',
            },
        ],
    };

    return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
};
