import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, X } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

// Resume date-range picker.
//
// UX shape: a single read-only input shows the current range (e.g.
// "Jan 2024 — Present"). Click → popover opens with two month/year
// pickers (start + end) and a "Present" toggle. Click outside or hit Done
// to close. The committed value is a string the rest of the app already
// understands, so PDF/DOCX/preview pipelines need no changes.
//
// We use react-datepicker in `showMonthYearPicker` mode because resumes
// almost never want day-precision and a month grid is far easier to scan.

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_LOOKUP = MONTH_NAMES.reduce((m, n, i) => {
    m[n.toLowerCase()] = i;
    return m;
}, {});

// ── Parsing ──────────────────────────────────────────────────────────────
// Accept any of the common date-range shapes a user (or our older free-text
// editor) might have produced. Returns { start: Date|null, end: Date|null,
// present: bool, unparsed?: true }.

function parseSide(raw) {
    if (!raw) return null;
    const r = raw.trim();
    if (/^(present|ongoing|current|now)$/i.test(r)) return 'present';
    // "Jan 2024" / "January 2024"
    let m = r.match(/^([A-Za-z]+)[\s.,-]+(\d{4})$/);
    if (m) {
        const mi = MONTH_LOOKUP[m[1].slice(0, 3).toLowerCase()];
        if (mi !== undefined) return new Date(parseInt(m[2], 10), mi, 1);
    }
    // "2024"
    m = r.match(/^(\d{4})$/);
    if (m) return new Date(parseInt(m[1], 10), 0, 1);
    // "01/2024", "1-2024"
    m = r.match(/^(\d{1,2})[/-](\d{4})$/);
    if (m) {
        const mi = parseInt(m[1], 10) - 1;
        if (mi >= 0 && mi < 12) return new Date(parseInt(m[2], 10), mi, 1);
    }
    return null;
}

function splitRange(str) {
    const s = (str || '').replace(/\s+/g, ' ').trim();
    if (!s) return [null, null];
    if (/^(present|ongoing|current)$/i.test(s)) return [null, 'present'];
    const idx = s.search(/\s*(?:—|–|-+|to)\s*/i);
    if (idx === -1) return [s, null];
    const left = s.slice(0, idx).trim();
    const right = s
        .slice(idx)
        .replace(/^\s*(?:—|–|-+|to)\s*/i, '')
        .trim();
    return [left, right];
}

function parseDateString(str) {
    const [l, r] = splitRange(str);
    const start = parseSide(l);
    const end = parseSide(r);
    if (start === null && end === null && (str || '').trim()) {
        return { unparsed: true, raw: str };
    }
    const present = end === 'present' || (start && !r);
    return {
        start: start instanceof Date ? start : null,
        end: end instanceof Date ? end : null,
        present,
        unparsed: false,
    };
}

// ── Formatting ───────────────────────────────────────────────────────────
function formatSide(d) {
    if (!d) return '';
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatRange({ start, end, present }) {
    const l = formatSide(start);
    const r = present ? 'Present' : formatSide(end);
    if (!l && !r) return '';
    if (!r) return l;
    if (!l) return r;
    return `${l} — ${r}`;
}

// ── Component ────────────────────────────────────────────────────────────
const DateRangeInput = ({ value, onChange, allowPresent = true, placeholder = 'Click to set dates…' }) => {
    // Track upstream value so prop changes (profile switch, AI rewrite)
    // reset our local state without an effect.
    const [lastSeenValue, setLastSeenValue] = useState(value);
    const [state, setState] = useState(() => parseDateString(value));
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    if (value !== lastSeenValue) {
        setLastSeenValue(value);
        setState(parseDateString(value));
    }

    // Close popover on outside click.
    useEffect(() => {
        if (!open) return;
        const onDocClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [open]);

    const commit = (patch) => {
        const next = { ...state, ...patch };
        setState(next);
        onChange(formatRange(next));
    };

    const displayValue = state.unparsed ? state.raw : formatRange(state);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-[13px] outline-none transition-all border ${
                    open
                        ? 'bg-white border-slate-300'
                        : 'bg-stone-50 border-transparent hover:border-slate-200'
                } ${displayValue ? 'text-slate-900' : 'text-slate-400'}`}
            >
                <span className="truncate text-left">{displayValue || placeholder}</span>
                <Calendar size={14} className="text-slate-400 shrink-0" />
            </button>

            {open && (
                // Anchored to the input's right edge so it extends leftward
                // and stays inside the narrow editor sidebar even when the
                // input itself sits in a 2-col grid cell.
                <div className="absolute right-0 top-full mt-1 w-[280px] bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-3">
                    {state.unparsed ? (
                        <div className="space-y-2">
                            <p className="text-[12px] text-slate-600">
                                Existing value{' '}
                                <span className="font-mono text-[11px] bg-slate-50 px-1.5 py-0.5 rounded">
                                    {state.raw}
                                </span>{' '}
                                doesn't match a known format.
                            </p>
                            <button
                                onClick={() =>
                                    commit({
                                        unparsed: false,
                                        raw: '',
                                        start: null,
                                        end: null,
                                        present: false,
                                    })
                                }
                                className="w-full px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[12px] font-medium transition-colors"
                            >
                                Clear and use the picker
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Start picker */}
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                                    Start
                                </div>
                                <DatePicker
                                    selected={state.start}
                                    onChange={(d) => commit({ start: d })}
                                    dateFormat="MMM yyyy"
                                    showMonthYearPicker
                                    showFullMonthYearPicker
                                    placeholderText="Pick a month"
                                    className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md outline-none focus:border-brand-400 bg-white text-slate-900"
                                    wrapperClassName="w-full"
                                    isClearable
                                    popperPlacement="bottom-start"
                                />
                            </div>

                            {/* End picker */}
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                                    End
                                </div>
                                <DatePicker
                                    selected={state.present ? null : state.end}
                                    onChange={(d) => commit({ end: d })}
                                    dateFormat="MMM yyyy"
                                    showMonthYearPicker
                                    showFullMonthYearPicker
                                    placeholderText={state.present ? 'Present' : 'Pick a month'}
                                    disabled={state.present}
                                    minDate={state.start || undefined}
                                    className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md outline-none focus:border-brand-400 bg-white text-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
                                    wrapperClassName="w-full"
                                    isClearable={!state.present}
                                    popperPlacement="bottom-start"
                                />
                            </div>

                            {allowPresent && (
                                <label className="inline-flex items-center gap-1.5 text-[12px] text-slate-700 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={!!state.present}
                                        onChange={(e) =>
                                            commit({
                                                present: e.target.checked,
                                                end: e.target.checked ? null : state.end,
                                            })
                                        }
                                        className="w-3.5 h-3.5 rounded accent-brand-600"
                                    />
                                    Present (still here)
                                </label>
                            )}

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => commit({ start: null, end: null, present: false })}
                                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 transition-colors"
                                >
                                    <X size={11} /> Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[11px] font-medium transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DateRangeInput;
