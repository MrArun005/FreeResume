import React, { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';

const BulletPointEditor = ({ bullets = [], onChange, maxBullets = 5, maxCharsPerBullet = 250, maxTotalChars = 1000 }) => {
    const [currentInput, setCurrentInput] = useState('');
    const inputRef = useRef(null);

    const totalChars = bullets.reduce((sum, bullet) => sum + bullet.length, 0);
    const isAtMaxBullets = bullets.length >= maxBullets;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addBullet();
        }
    };

    const addBullet = () => {
        const trimmed = currentInput.trim();
        if (!trimmed) return;

        if (isAtMaxBullets) {
            alert(`Maximum ${maxBullets} bullet points allowed`);
            return;
        }

        if (trimmed.length > maxCharsPerBullet) {
            alert(`Each bullet point should be under ${maxCharsPerBullet} characters`);
            return;
        }

        onChange([...bullets, trimmed]);
        setCurrentInput('');
        inputRef.current?.focus();
    };

    const removeBullet = (index) => {
        onChange(bullets.filter((_, i) => i !== index));
    };

    const editBullet = (index, newValue) => {
        const updated = [...bullets];
        updated[index] = newValue;
        onChange(updated);
    };

    return (
        <div className="space-y-4 bg-slate-900/40 p-4 rounded-xl border border-white/5">
            {/* Existing Bullets */}
            {bullets.length > 0 && (
                <div className="space-y-3">
                    {bullets.map((bullet, index) => (
                        <div key={index} className="flex items-start gap-3 group relative">
                            <span className="text-teal-500 mt-2 shrink-0 text-lg leading-none">•</span>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => editBullet(index, e.target.value)}
                                    className="w-full p-2.5 pl-3 pr-10 text-sm bg-slate-950/50 border border-white/10 rounded-lg hover:border-white/20 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 outline-none text-gray-200 transition-all duration-300 shadow-inner"
                                    placeholder="Bullet point"
                                />
                                <button
                                    onClick={() => removeBullet(index)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1.5 rounded-md transition-all duration-300"
                                    title="Remove bullet"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Bullet */}
            {!isAtMaxBullets && (
                <div className="flex items-start gap-3">
                    <span className="text-gray-600 mt-2 shrink-0 text-lg leading-none">•</span>
                    <div className="flex-1 relative flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 p-2.5 pl-3 text-sm bg-transparent border-2 border-dashed border-white/10 rounded-lg hover:border-white/20 focus:border-teal-500/50 outline-none text-gray-200 placeholder-gray-500 transition-all duration-300"
                            placeholder="Add bullet point (press Enter)"
                        />
                        <button
                            onClick={addBullet}
                            disabled={!currentInput.trim()}
                            className="text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 px-3 py-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-sm"
                            title="Add bullet"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Character Counter */}
            <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${totalChars > maxTotalChars ? 'text-red-500' :
                    totalChars > maxTotalChars * 0.8 ? 'text-amber-500' :
                        'text-gray-400'
                    }`}>
                    {bullets.length} bullet{bullets.length !== 1 ? 's' : ''} • {totalChars} / {maxTotalChars} characters
                    {totalChars > maxTotalChars && ' ⚠️ Too long - may overflow page!'}
                </span>
                {currentInput.length > maxCharsPerBullet && (
                    <span className="text-red-500 font-medium">
                        Current: {currentInput.length} / {maxCharsPerBullet} ⚠️
                    </span>
                )}
            </div>
        </div>
    );
};

export default BulletPointEditor;
