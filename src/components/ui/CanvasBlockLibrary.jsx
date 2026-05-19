import { Plus } from 'lucide-react';
import { BLOCK_TYPES } from '../../constants/canvasBlocks';

// Canvas (Pro) block library — the "+" palette anchored on the left of the
// canvas in edit mode. Each entry, when clicked, calls `onAdd(type)` with the
// block type id; the parent canvas inserts a new block with sensible defaults
// at a non-overlapping position.

const CanvasBlockLibrary = ({ onAdd }) => {
    return (
        <div className="absolute left-2 top-2 z-40 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-lg p-2 no-print">
            <div className="px-2 pt-1 pb-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-stone-400 flex items-center gap-1.5">
                <Plus size={11} /> Add block
            </div>
            <div className="grid grid-cols-2 gap-1.5">
                {BLOCK_TYPES.map((b) => {
                    const Icon = b.icon;
                    return (
                        <button
                            key={b.id}
                            onClick={() => onAdd(b.id)}
                            title={b.hint}
                            className="flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg text-[10.5px] font-medium text-slate-600 dark:text-stone-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:border-brand-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <Icon size={14} className="text-slate-500 dark:text-stone-400" />
                            <span className="leading-tight">{b.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CanvasBlockLibrary;
