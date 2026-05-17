import React, { useState, useEffect, useRef } from 'react';
import { Move, Maximize2 } from 'lucide-react';

const DraggableElement = ({
    id,
    children,
    initialPos = { x: 0, y: 0 },
    initialSize = { w: 'auto', h: 'auto' },
    onUpdate,
    isEditable = true,
}) => {
    const [pos, setPos] = useState(initialPos);
    const [size, setSize] = useState(initialSize);

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const dragStart = useRef({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });
    const startSize = useRef({ w: 0, h: 0 });

    // Refs to hold latest state for event handlers
    const currentPos = useRef(pos);
    const currentSize = useRef(size);

    // Sync state from props at render time (React-recommended pattern for
    // "adjust state when a prop changes" — avoids cascading-effect renders).
    const [lastInitialPos, setLastInitialPos] = useState({ x: initialPos.x, y: initialPos.y });
    if (lastInitialPos.x !== initialPos.x || lastInitialPos.y !== initialPos.y) {
        setLastInitialPos({ x: initialPos.x, y: initialPos.y });
        setPos(initialPos);
    }

    const [lastInitialSize, setLastInitialSize] = useState({ w: initialSize.w, h: initialSize.h });
    if (lastInitialSize.w !== initialSize.w || lastInitialSize.h !== initialSize.h) {
        setLastInitialSize({ w: initialSize.w, h: initialSize.h });
        if (initialSize.w !== undefined) setSize(initialSize);
    }

    useEffect(() => {
        currentPos.current = pos;
    }, [pos]);
    useEffect(() => {
        currentSize.current = size;
    }, [size]);

    // --- DRAG LOGIC ---
    const handleMouseDown = (e) => {
        if (!isEditable) return;
        // Don't trigger drag if clicking resize handle
        if (e.target.closest('.resize-handle')) return;

        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        startPos.current = { ...pos };

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    };

    const handleDragMove = (e) => {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;

        // Snap to grid (20px)
        const rawX = startPos.current.x + dx;
        const rawY = startPos.current.y + dy;

        setPos({
            x: Math.round(rawX / 20) * 20,
            y: Math.round(rawY / 20) * 20,
        });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        if (onUpdate) onUpdate(id, { ...currentPos.current, ...currentSize.current });
    };

    // --- RESIZE LOGIC ---
    const handleResizeStart = (e) => {
        if (!isEditable) return;
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        dragStart.current = { x: e.clientX, y: e.clientY };

        // Get current actual size if auto
        const rect = e.target.closest('.draggable-container').getBoundingClientRect();
        // If state is auto, use rect, otherwise use state
        const w = size.w === 'auto' ? rect.width : size.w;
        const h = size.h === 'auto' ? rect.height : size.h;

        startSize.current = { w, h };

        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    };

    const handleResizeMove = (e) => {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;

        // Snap size to grid (20px)
        const rawW = Math.max(50, startSize.current.w + dx);
        const rawH = Math.max(20, startSize.current.h + dy);

        setSize({
            w: Math.round(rawW / 20) * 20,
            h: Math.round(rawH / 20) * 20,
        });
    };

    const handleResizeEnd = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        if (onUpdate) onUpdate(id, { ...currentPos.current, ...currentSize.current });
    };

    return (
        <div
            id={id}
            className={`draggable-container absolute group ${isEditable ? 'hover:ring-2 ring-blue-400 ring-dashed rounded' : ''}`}
            style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                width: size.w,
                height: size.h,
                transition: isDragging || isResizing ? 'none' : 'transform 0.1s ease-out',
                zIndex: isDragging || isResizing ? 50 : 10,
                cursor: isDragging ? 'grabbing' : isEditable ? 'grab' : 'default',
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Drag Handle Icon (Top Right) */}
            {isEditable && (
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-50 cursor-grab">
                    <Move size={10} />
                </div>
            )}

            {/* Content */}
            <div className="w-full h-full overflow-hidden">{children}</div>

            {/* Resize Handle (Bottom Right) */}
            {isEditable && (
                <div
                    className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end opacity-0 group-hover:opacity-100 p-0.5 z-50"
                    onMouseDown={handleResizeStart}
                >
                    <div className="w-2 h-2 bg-blue-500 rounded-sm" />
                </div>
            )}
        </div>
    );
};

export default DraggableElement;
