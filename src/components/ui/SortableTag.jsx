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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-lg text-sm font-medium border border-slate-200 cursor-grab active:cursor-grabbing hover:border-slate-300 hover:bg-slate-50 transition-colors group"
        >
            {children}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag start
                    onRemove();
                }}
                className="p-1 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-600 transition-colors ml-1 opacity-60 group-hover:opacity-100"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
            >
                <X size={14} />
            </button>
        </div>
    );
}
