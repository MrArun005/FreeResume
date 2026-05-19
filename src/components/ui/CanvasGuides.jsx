// Renders alignment guide lines on the Canvas during a drag. The dragging
// block emits lines via `onAlign` and the parent canvas passes them down.
// Lines are dedup'd by axis+at so a single sibling alignment doesn't render
// three overlapping strokes when it's a left-edge AND center-X match.
const dedupe = (lines = []) => {
    const seen = new Set();
    return lines.filter((l) => {
        const k = `${l.type}:${Math.round(l.at)}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
};

const CanvasGuides = ({ lines = [] }) => {
    if (!lines.length) return null;
    return (
        <div className="absolute inset-0 pointer-events-none z-[60] no-print">
            {dedupe(lines).map((l, i) =>
                l.type === 'v' ? (
                    <div
                        key={i}
                        className="absolute top-0 bottom-0 w-px bg-pink-500/80"
                        style={{ left: l.at }}
                    />
                ) : (
                    <div
                        key={i}
                        className="absolute left-0 right-0 h-px bg-pink-500/80"
                        style={{ top: l.at }}
                    />
                )
            )}
        </div>
    );
};

export default CanvasGuides;
