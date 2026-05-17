import React from 'react';
import { motion } from 'framer-motion';
import { useAppTheme } from '../../context/AppThemeContext';
import { Palette } from 'lucide-react';

const FuturisticThemeSwitcher = () => {
    const { theme, setTheme, themes } = useAppTheme();
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium text-gray-300 hover:text-white backdrop-blur-sm"
            >
                <Palette size={16} />
                <span className="hidden sm:inline">Theme</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute top-full right-0 mt-2 p-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 min-w-[180px] flex flex-col gap-1"
                    >
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    theme === t.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span
                                    className={`w-4 h-4 rounded-full ${t.color} border border-white/20 shadow-sm`}
                                ></span>
                                {t.name}
                            </button>
                        ))}
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default FuturisticThemeSwitcher;
