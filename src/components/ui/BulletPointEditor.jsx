import { useState, useRef } from 'react';
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
        <div className="space-y-3 bg-stone-50 p-4 rounded-lg border border-slate-200">
            {/* Existing Bullets */}
            {bullets.length > 0 && (
                <div className="space-y-2">
                    {bullets.map((bullet, index) => (
                        <div key={index} className="flex items-start gap-2 group relative">
                            <span className="text-teal-600 mt-2.5 shrink-0 leading-none">•</span>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => editBullet(index, e.target.value)}
                                    className="w-full py-2 pl-2.5 pr-9 text-sm bg-white border border-slate-200 rounded-md hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-900 transition-colors"
                                    placeholder="Bullet point"
                                />
                                <button
                                    onClick={() => removeBullet(index)}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition-all"
                                    title="Remove bullet"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Bullet */}
            {!isAtMaxBullets && (
                <div className="flex items-start gap-2">
                    <span className="text-slate-400 mt-2.5 shrink-0 leading-none">•</span>
                    <div className="flex-1 flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 py-2 pl-2.5 text-sm bg-white border border-dashed border-slate-300 rounded-md hover:border-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-900 placeholder-slate-400 transition-colors"
                            placeholder="Add bullet point — press Enter"
                        />
                        <button
                            onClick={addBullet}
                            disabled={!currentInput.trim()}
                            className="text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-2.5 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            title="Add bullet"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Character Counter */}
            <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${totalChars > maxTotalChars ? 'text-red-600' :
                    totalChars > maxTotalChars * 0.8 ? 'text-amber-600' :
                        'text-slate-500'
                    }`}>
                    {bullets.length} bullet{bullets.length !== 1 ? 's' : ''} · {totalChars} / {maxTotalChars} chars
                    {totalChars > maxTotalChars && ' — may overflow'}
                </span>
                {currentInput.length > maxCharsPerBullet && (
                    <span className="text-red-600 font-medium">
                        {currentInput.length} / {maxCharsPerBullet}
                    </span>
                )}
            </div>
        </div>
    );
};

export default BulletPointEditor;
