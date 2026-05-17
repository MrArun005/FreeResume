import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';

export function SortableTag({ id, children, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-stone-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
        >
            {children}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag start
                    onRemove();
                }}
                className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md text-slate-400 dark:text-stone-500 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-1 opacity-60 group-hover:opacity-100"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
            >
                <X size={14} />
            </button>
        </div>
    );
}
