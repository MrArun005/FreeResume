import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';

export function SortableTag({ id, children, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 text-teal-300 rounded-lg text-sm font-semibold tracking-wide shadow-sm border border-white/10 cursor-grab active:cursor-grabbing hover:bg-slate-800/80 hover:border-teal-500/50 hover:text-teal-200 transition-all duration-300 group"
        >
            {children}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag start
                    onRemove();
                }}
                className="p-1 hover:bg-red-500/20 rounded-md text-red-400 hover:text-red-300 transition-all duration-300 ml-1 opacity-70 group-hover:opacity-100"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
            >
                <X size={14} />
            </button>
        </div>
    );
}
