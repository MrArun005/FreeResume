import { useEffect, useState } from 'react';
import { Loader, FileText, Search, Sparkles, CheckCircle2 } from 'lucide-react';

// Resume-upload loading screen. The actual server call takes 15–30s on
// average (Gemini + PDF parse over a free-tier connection). The original
// copy promised "a few seconds" — users would bail at 10s. This rotates
// honest progress messages so the wait feels like work-being-done, not a
// hung screen. The bar also fills smoothly toward the expected window so
// users have a visual anchor.

const STAGES = [
    { icon: FileText, label: 'Reading your PDF…', sub: 'Pulling text out of the document.' },
    { icon: Search, label: 'Extracting experience…', sub: 'Finding roles, companies, and dates.' },
    { icon: Search, label: 'Identifying skills & education…', sub: 'Sorting them into the right buckets.' },
    { icon: Sparkles, label: 'Cleaning up the structure…', sub: 'Making sure nothing got mangled.' },
    { icon: CheckCircle2, label: 'Almost there…', sub: 'Wrapping up the final pass.' },
];

// Total expected duration in ms — used to time the rotating messages and
// the progress bar. Slightly over-estimated so the bar doesn't hit 100%
// before the response actually arrives (we cap it at 92% until done).
const EXPECTED_MS = 28000;
const CAP = 0.92;

const ParsingLoader = ({ active }) => {
    const [elapsed, setElapsed] = useState(0);
    const [stageIdx, setStageIdx] = useState(0);

    useEffect(() => {
        if (!active) return undefined;
        // Reset on a fresh activation by resetting from the timer's first tick
        // (avoids calling setState directly inside the effect body, which
        // react-hooks/set-state-in-effect flags). The first tick lands within
        // 200ms which is imperceptible.
        const start = Date.now();
        const tick = setInterval(() => {
            const ms = Date.now() - start;
            setElapsed(ms);
            const idx = Math.min(STAGES.length - 1, Math.floor(ms / (EXPECTED_MS / STAGES.length)));
            setStageIdx(idx);
        }, 200);
        return () => {
            clearInterval(tick);
            // Cleanup runs after the effect tears down (either active flipped
            // off or component unmounted) — safe to call setState here.
            setElapsed(0);
            setStageIdx(0);
        };
    }, [active]);

    if (!active) return null;

    const progress = Math.min(CAP, elapsed / EXPECTED_MS);
    const stage = STAGES[stageIdx];
    const Icon = stage.icon;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white px-6">
            <div className="w-full max-w-md flex flex-col items-center text-center">
                <div className="relative mb-5">
                    <Loader className="w-12 h-12 animate-spin text-brand-400" />
                    <Icon size={18} className="absolute inset-0 m-auto text-white/90" />
                </div>

                <h2 className="text-xl font-bold mb-1">{stage.label}</h2>
                <p className="text-sm text-stone-300 mb-5">{stage.sub}</p>

                {/* Honest progress bar */}
                <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden mb-2">
                    <div
                        className="h-full bg-brand-400 transition-[width] duration-200 ease-out"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>
                <p className="text-[11px] text-stone-400 font-mono">
                    Usually takes 15–30 seconds · {Math.round(elapsed / 1000)}s
                </p>
            </div>
        </div>
    );
};

export default ParsingLoader;
