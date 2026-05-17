import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppTheme } from '../../context/AppThemeContext';

// Single icon button that flips between light and dark. We keep this tiny
// on purpose — the editor toolbar is already crowded and a two-segment
// pill takes too much horizontal space. The icon (Sun on dark, Moon on
// light) shows the *target* state, which matches the user's mental model
// of "press this to get to the moon."
const AppThemeSwitcher = ({ className = '' }) => {
    const { theme, toggleTheme } = useAppTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${className}`}
        >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
    );
};

export default AppThemeSwitcher;
