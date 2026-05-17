import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function SortableItem(props) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute -left-8 top-1/2 -translate-y-1/2 p-2 cursor-grab text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity touch-none"
            >
                <GripVertical size={20} />
            </div>

            {/* Content */}
            {props.children}
        </div>
    );
}
