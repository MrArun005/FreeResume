import { useEffect, useState } from 'react';
import {
    Trash2,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Paintbrush,
    Square,
    CornerDownRight,
    Move,
} from 'lucide-react';

// Style inspector for the currently-selected Canvas block. Anchored to the
// top-right of the canvas in edit mode. Exposes a focused subset of style
// controls: bg color, border color/width, corner radius, padding, text align.
// Custom blocks (canvasBlocks) can also be deleted. Built-in blocks (name,
// title, contact...) cannot — onDelete will be null and the button hides.

const ColorSwatch = ({ value, onChange, label }) => (
    <label className="flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-stone-300">
        <span className="font-medium">{label}</span>
        <span className="flex items-center gap-1.5">
            <button
                type="button"
                onClick={() => onChange('')}
                className="px-1.5 py-0.5 text-[10px] rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-stone-400 hover:text-slate-700 dark:hover:text-stone-200"
                title="Clear"
            >
                none
            </button>
            <input
                type="color"
                value={value || '#ffffff'}
                onChange={(e) => onChange(e.target.value)}
                className="w-7 h-6 rounded border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
            />
        </span>
    </label>
);

const NumberSlider = ({ value, onChange, min, max, label, suffix = 'px' }) => (
    <label className="flex flex-col gap-1 text-[11px] text-slate-600 dark:text-stone-300">
        <span className="flex items-center justify-between font-medium">
            <span>{label}</span>
            <span className="font-mono text-slate-500 dark:text-stone-400">
                {value || 0}
                {suffix}
            </span>
        </span>
        <input
            type="range"
            min={min}
            max={max}
            value={value || 0}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="w-full accent-brand-600"
        />
    </label>
);

const CanvasBlockInspector = ({ selectedId, blockStyle = {}, blockType, onChangeStyle, onDelete }) => {
    const [draft, setDraft] = useState(blockStyle);

    // Sync from prop when selection changes — but treat the draft as the
    // source of truth during interaction.
    useEffect(() => {
        setDraft(blockStyle || {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId]);

    if (!selectedId) return null;

    const setField = (key, val) => {
        const next = { ...draft, [key]: val };
        setDraft(next);
        onChangeStyle?.(next);
    };

    return (
        <div className="absolute right-2 top-2 z-40 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-lg p-3 no-print">
            <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-stone-400 flex items-center gap-1.5">
                    <Paintbrush size={11} /> Style
                </div>
                {blockType && (
                    <span className="text-[9.5px] font-mono text-slate-400 dark:text-stone-500 truncate max-w-[80px]">
                        {blockType}
                    </span>
                )}
            </div>

            <div className="space-y-2.5">
                <ColorSwatch label="Background" value={draft.bg} onChange={(v) => setField('bg', v)} />
                <div className="grid grid-cols-2 gap-2">
                    <ColorSwatch
                        label="Border"
                        value={draft.borderColor}
                        onChange={(v) => setField('borderColor', v)}
                    />
                </div>
                <NumberSlider
                    label="Border width"
                    value={draft.borderWidth}
                    onChange={(v) => setField('borderWidth', v)}
                    min={0}
                    max={8}
                />
                <NumberSlider
                    label="Corner radius"
                    value={draft.radius}
                    onChange={(v) => setField('radius', v)}
                    min={0}
                    max={32}
                />
                <NumberSlider
                    label="Padding"
                    value={draft.padding}
                    onChange={(v) => setField('padding', v)}
                    min={0}
                    max={32}
                />

                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-stone-300">
                    <span className="font-medium">Text align</span>
                    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-md p-0.5">
                        {[
                            { value: 'left', Icon: AlignLeft },
                            { value: 'center', Icon: AlignCenter },
                            { value: 'right', Icon: AlignRight },
                        ].map(({ value, Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setField('textAlign', value)}
                                className={`p-1 rounded ${
                                    draft.textAlign === value
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 dark:text-stone-400 hover:text-slate-700 dark:hover:text-stone-200'
                                }`}
                                title={`Align ${value}`}
                            >
                                <Icon size={11} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {onDelete && (
                <button
                    onClick={onDelete}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/30 transition-colors"
                >
                    <Trash2 size={12} /> Delete block
                </button>
            )}

            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-stone-500">
                <Square size={9} /> 8px snap · <CornerDownRight size={9} /> drag corner to resize ·{' '}
                <Move size={9} /> shift = free drag
            </div>
        </div>
    );
};

export default CanvasBlockInspector;
