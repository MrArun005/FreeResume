import React from 'react';
import { useAppTheme } from '../../context/AppThemeContext';
import { Moon, Sun, Monitor, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const AppThemeSwitcher = () => {
    const { theme, setTheme, themes } = useAppTheme();

    return (
        <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm p-1 rounded-full border border-gray-200 dark:border-gray-700">
            {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`
                        relative px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5
                        ${
                            theme === t.id
                                ? 'text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }
                    `}
                >
                    {theme === t.id && (
                        <motion.div
                            layoutId="activeTheme"
                            className="absolute inset-0 bg-gray-900 dark:bg-brand-600 rounded-full"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-1">
                        {t.id === 'light' && <Sun size={12} />}
                        {t.id === 'dark' && <Moon size={12} />}
                        {t.id === 'minimal' && <Circle size={12} />}
                        {t.name}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default AppThemeSwitcher;
