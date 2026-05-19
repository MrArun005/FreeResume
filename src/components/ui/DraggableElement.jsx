import React, { useState, useEffect, useRef } from 'react';
import { Move } from 'lucide-react';

// Canvas (Pro) draggable block. Supports:
//   - 8px snap-to-grid by default (hold Shift while dragging to free-drag)
//   - Live alignment guides vs. sibling blocks — when dragged edge/center
//     aligns within SNAP_THRESHOLD of another block's edge/center, we snap
//     and emit a guide line via onAlign(callback) for the parent canvas to
//     render. Caller is expected to render the lines.
//   - Click-to-select: clicking emits onSelect(id); the parent canvas owns
//     selection state and renders the inspector for the selected block.

const GRID = 8;
const SNAP_THRESHOLD = 5;

const DraggableElement = ({
    id,
    children,
    initialPos = { x: 0, y: 0 },
    initialSize = { w: 'auto', h: 'auto' },
    onUpdate,
    onSelect,
    onAlign, // (lines: [{type:'v'|'h', at:number}]) → void
    isEditable = true,
    isSelected = false,
    blockStyle, // optional inline style overrides from inspector
    siblings = [], // [{id, x, y, w, h}] of OTHER blocks on the page (in canvas coords)
}) => {
    const [pos, setPos] = useState(initialPos);
    const [size, setSize] = useState(initialSize);

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const dragStart = useRef({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });
    const startSize = useRef({ w: 0, h: 0 });
    const containerRef = useRef(null);

    const currentPos = useRef(pos);
    const currentSize = useRef(size);

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

    // Compute the dragging block's measured w/h. We need real numbers for the
    // alignment-guide math (auto-sized blocks can't be compared by 'auto').
    const measuredSize = () => {
        if (containerRef.current) {
            const r = containerRef.current.getBoundingClientRect();
            return { w: r.width, h: r.height };
        }
        return { w: typeof size.w === 'number' ? size.w : 100, h: typeof size.h === 'number' ? size.h : 40 };
    };

    // Snap the dragged position to grid + to sibling edges/centers.
    // Returns { x, y, lines } where lines is the guide overlay to render.
    const snapAndAlign = (rawX, rawY, freeMode) => {
        const lines = [];
        if (freeMode) return { x: rawX, y: rawY, lines };

        // 1) Grid snap first
        let x = Math.round(rawX / GRID) * GRID;
        let y = Math.round(rawY / GRID) * GRID;

        // 2) Sibling edge/center alignment overrides grid if within threshold
        const { w, h } = measuredSize();
        const xCandidates = {
            [x]: 'left', // current snap
            [x + w]: 'right',
            [x + w / 2]: 'centerX',
        };
        const yCandidates = {
            [y]: 'top',
            [y + h]: 'bottom',
            [y + h / 2]: 'centerY',
        };

        siblings.forEach((sib) => {
            const sibLeft = sib.x;
            const sibRight = sib.x + (typeof sib.w === 'number' ? sib.w : 0);
            const sibCenterX = sib.x + (typeof sib.w === 'number' ? sib.w : 0) / 2;
            const sibTop = sib.y;
            const sibBottom = sib.y + (typeof sib.h === 'number' ? sib.h : 0);
            const sibCenterY = sib.y + (typeof sib.h === 'number' ? sib.h : 0) / 2;

            // Horizontal alignment (vertical guide lines)
            [sibLeft, sibRight, sibCenterX].forEach((sibX) => {
                if (Math.abs(rawX - sibX) <= SNAP_THRESHOLD) {
                    x = sibX;
                    lines.push({ type: 'v', at: sibX });
                }
                if (Math.abs(rawX + w - sibX) <= SNAP_THRESHOLD) {
                    x = sibX - w;
                    lines.push({ type: 'v', at: sibX });
                }
                if (Math.abs(rawX + w / 2 - sibX) <= SNAP_THRESHOLD) {
                    x = sibX - w / 2;
                    lines.push({ type: 'v', at: sibX });
                }
            });
            // Vertical alignment (horizontal guide lines)
            [sibTop, sibBottom, sibCenterY].forEach((sibY) => {
                if (Math.abs(rawY - sibY) <= SNAP_THRESHOLD) {
                    y = sibY;
                    lines.push({ type: 'h', at: sibY });
                }
                if (Math.abs(rawY + h - sibY) <= SNAP_THRESHOLD) {
                    y = sibY - h;
                    lines.push({ type: 'h', at: sibY });
                }
                if (Math.abs(rawY + h / 2 - sibY) <= SNAP_THRESHOLD) {
                    y = sibY - h / 2;
                    lines.push({ type: 'h', at: sibY });
                }
            });
        });

        // Reference xCandidates/yCandidates to keep eslint happy without
        // forcing structural changes — they exist for future use (e.g. when
        // we add multi-axis snap reporting per edge).
        void xCandidates;
        void yCandidates;
        return { x, y, lines };
    };

    // --- DRAG LOGIC ---
    const handleMouseDown = (e) => {
        if (!isEditable) return;
        if (e.target.closest('.resize-handle')) return;

        e.preventDefault();
        e.stopPropagation();
        onSelect?.(id);
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        startPos.current = { ...pos };

        const moveHandler = (ev) => handleDragMove(ev);
        const upHandler = () => handleDragEnd(moveHandler, upHandler);
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    };

    const handleDragMove = (e) => {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        const rawX = startPos.current.x + dx;
        const rawY = startPos.current.y + dy;
        const { x, y, lines } = snapAndAlign(rawX, rawY, e.shiftKey);
        setPos({ x, y });
        onAlign?.(lines);
    };

    const handleDragEnd = (moveHandler, upHandler) => {
        setIsDragging(false);
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        onAlign?.([]);
        if (onUpdate) onUpdate(id, { ...currentPos.current, ...currentSize.current });
    };

    // --- RESIZE LOGIC ---
    const handleResizeStart = (e) => {
        if (!isEditable) return;
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        dragStart.current = { x: e.clientX, y: e.clientY };

        const rect = e.target.closest('.draggable-container').getBoundingClientRect();
        const w = size.w === 'auto' ? rect.width : size.w;
        const h = size.h === 'auto' ? rect.height : size.h;
        startSize.current = { w, h };

        const moveHandler = (ev) => handleResizeMove(ev);
        const upHandler = () => handleResizeEnd(moveHandler, upHandler);
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    };

    const handleResizeMove = (e) => {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        const rawW = Math.max(40, startSize.current.w + dx);
        const rawH = Math.max(16, startSize.current.h + dy);
        const snap = e.shiftKey ? 1 : GRID;
        setSize({
            w: Math.round(rawW / snap) * snap,
            h: Math.round(rawH / snap) * snap,
        });
    };

    const handleResizeEnd = (moveHandler, upHandler) => {
        setIsResizing(false);
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        if (onUpdate) onUpdate(id, { ...currentPos.current, ...currentSize.current });
    };

    // Compose inline style from blockStyle prop (set by the inspector).
    const innerStyle = blockStyle
        ? {
              backgroundColor: blockStyle.bg || undefined,
              border:
                  blockStyle.borderWidth && blockStyle.borderColor
                      ? `${blockStyle.borderWidth}px solid ${blockStyle.borderColor}`
                      : undefined,
              borderRadius: blockStyle.radius != null ? `${blockStyle.radius}px` : undefined,
              padding: blockStyle.padding != null ? `${blockStyle.padding}px` : undefined,
              textAlign: blockStyle.textAlign || undefined,
          }
        : undefined;

    return (
        <div
            id={id}
            ref={containerRef}
            className={`draggable-container absolute group ${
                isEditable
                    ? isSelected
                        ? 'outline outline-2 outline-brand-500 outline-offset-1 rounded-sm'
                        : 'hover:outline hover:outline-2 hover:outline-brand-300 hover:outline-offset-1 rounded-sm'
                    : ''
            }`}
            style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                width: size.w,
                height: size.h,
                transition: isDragging || isResizing ? 'none' : 'transform 0.08s ease-out',
                zIndex: isSelected || isDragging || isResizing ? 50 : 10,
                cursor: isDragging ? 'grabbing' : isEditable ? 'grab' : 'default',
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Per-block style wrapper — bg/border/radius/padding from inspector */}
            <div className="w-full h-full overflow-hidden" style={innerStyle}>
                {children}
            </div>

            {/* Drag handle pip — only on selected block to keep canvas calm */}
            {isEditable && isSelected && (
                <div className="absolute -top-2.5 -left-2.5 bg-brand-600 text-white p-0.5 rounded-full shadow-md z-50 cursor-grab">
                    <Move size={9} />
                </div>
            )}

            {/* Resize handle (bottom-right) */}
            {isEditable && (
                <div
                    className={`resize-handle absolute -bottom-1 -right-1 w-3 h-3 cursor-nwse-resize ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    } z-50`}
                    onMouseDown={handleResizeStart}
                >
                    <div className="w-full h-full bg-brand-600 rounded-sm border-2 border-white shadow-sm" />
                </div>
            )}
        </div>
    );
};

export default DraggableElement;
