import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Live-typing hero demo. Cycles through a handful of bullets, typing each
// one out, pausing, then deleting and moving to the next. Designed to feel
// like watching someone polish a real bullet in the editor.
//
// Cheap on the GPU: a single setTimeout chain, no springs, no measurement.
// The blinking cursor is a CSS animation on a 1px-wide span.

const PHRASES = [
    'Built distributed payment system processing $5M / day.',
    'Cut p99 latency 47% by sharding the hot Postgres tables.',
    'Shipped onboarding redesign that lifted activation 22%.',
    'Led migration from monolith → 7 services, zero downtime.',
];

const TYPE_MS = 38;
const DELETE_MS = 18;
const HOLD_MS = 1400;

const LiveTypingDemo = ({ className = '' }) => {
    const [index, setIndex] = useState(0);
    const [text, setText] = useState('');
    const [phase, setPhase] = useState('typing'); // typing | holding | deleting

    useEffect(() => {
        const target = PHRASES[index];
        let timer;

        if (phase === 'typing') {
            if (text.length < target.length) {
                timer = setTimeout(() => setText(target.slice(0, text.length + 1)), TYPE_MS);
            } else {
                timer = setTimeout(() => setPhase('holding'), 0);
            }
        } else if (phase === 'holding') {
            timer = setTimeout(() => setPhase('deleting'), HOLD_MS);
        } else if (phase === 'deleting') {
            if (text.length > 0) {
                timer = setTimeout(() => setText(target.slice(0, text.length - 1)), DELETE_MS);
            } else {
                // Defer the phrase advance + phase reset out of the effect
                // body. Calling setState() synchronously inside an effect
                // triggers cascading renders and trips the React Hooks lint
                // rule; using a 0ms timeout schedules it as a separate task
                // so React batches both updates.
                timer = setTimeout(() => {
                    setIndex((i) => (i + 1) % PHRASES.length);
                    setPhase('typing');
                }, 0);
            }
        }
        return () => clearTimeout(timer);
    }, [text, phase, index]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={`relative rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 shadow-sm overflow-hidden ${className}`}
        >
            {/* Mock editor chrome — three dots + a faint title */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-200/70 dark:border-slate-800/70">
                <span className="w-2.5 h-2.5 rounded-full bg-red-300/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300/80" />
                <span className="ml-3 text-[11px] font-medium text-slate-400 dark:text-stone-500 tracking-tight">
                    resume.json — Highlights
                </span>
            </div>
            {/* Mock bullets above the live one */}
            <div className="px-5 py-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-stone-300">
                <div className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 dark:bg-stone-500 shrink-0" />
                    <span className="text-slate-400 dark:text-stone-500 line-through">
                        Worked on payments stuff.
                    </span>
                </div>
                <div className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                    <span className="font-medium text-slate-900 dark:text-stone-100">
                        {text}
                        <span className="inline-block w-[2px] h-4 bg-brand-500 align-middle ml-0.5 animate-pulse" />
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default LiveTypingDemo;
