import { useCallback, useEffect, useState } from 'react';

// Job application tracker. Lives entirely in localStorage — no signup, no DB,
// no network. The user owns the data; export-as-JSON gives a portable backup
// they can re-import (e.g. when switching machines).

const STORAGE_KEY = 'resume_job_tracker_v1';

export const JOB_STATUSES = [
    { id: 'saved', label: 'Saved', tone: 'slate' },
    { id: 'applied', label: 'Applied', tone: 'sky' },
    { id: 'interview', label: 'Interview', tone: 'amber' },
    { id: 'offer', label: 'Offer', tone: 'emerald' },
    { id: 'rejected', label: 'Rejected', tone: 'rose' },
];

const STATUS_IDS = new Set(JOB_STATUSES.map((s) => s.id));

function makeId() {
    return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function loadInitial() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Defensive normalization — drop malformed entries instead of crashing
        // the modal. Imported JSON from older versions might be missing fields.
        return parsed
            .filter((j) => j && typeof j === 'object' && typeof j.id === 'string')
            .map((j) => ({
                id: j.id,
                company: typeof j.company === 'string' ? j.company : '',
                role: typeof j.role === 'string' ? j.role : '',
                status: STATUS_IDS.has(j.status) ? j.status : 'saved',
                jdLink: typeof j.jdLink === 'string' ? j.jdLink : '',
                notes: typeof j.notes === 'string' ? j.notes : '',
                appliedDate: typeof j.appliedDate === 'string' ? j.appliedDate : '',
                // ── differentiator fields (back-fill for older entries) ──
                // Link to the resume profile (multi-profile store) sent for
                // this app. Lets the Kanban card show *which* version went
                // out and lets users diff later if they want.
                resumeProfileId: typeof j.resumeProfileId === 'string' ? j.resumeProfileId : null,
                // Match score from Smart Tailor for this JD. null = never analyzed.
                matchScore: typeof j.matchScore === 'number' ? j.matchScore : null,
                // Status-change history. Older entries with no timeline get
                // a synthetic "created" event so the detail view still shows
                // something useful.
                timeline: Array.isArray(j.timeline)
                    ? j.timeline
                    : [
                          {
                              id: `t_${j.id}_seed`,
                              type: 'created',
                              at: typeof j.createdAt === 'number' ? j.createdAt : Date.now(),
                              text: 'Added to tracker',
                          },
                      ],
                createdAt: typeof j.createdAt === 'number' ? j.createdAt : Date.now(),
            }));
    } catch (err) {
        console.warn('[useJobTracker] failed to load:', err?.message || err);
        return [];
    }
}

export function useJobTracker() {
    const [jobs, setJobs] = useState(loadInitial);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
        } catch (err) {
            // Quota exceeded, private browsing, etc. — log and move on. Better
            // to keep editing in-memory than to crash the modal.
            console.warn('[useJobTracker] failed to persist:', err?.message || err);
        }
    }, [jobs]);

    const addJob = useCallback((partial = {}) => {
        const now = Date.now();
        const status = partial.status && STATUS_IDS.has(partial.status) ? partial.status : 'saved';
        const next = {
            id: makeId(),
            company: '',
            role: '',
            status,
            jdLink: '',
            notes: '',
            appliedDate: status === 'applied' ? new Date(now).toISOString().slice(0, 10) : '',
            resumeProfileId: null,
            matchScore: null,
            timeline: [
                {
                    id: `t_${makeId()}`,
                    type: 'created',
                    at: now,
                    text: status === 'saved' ? 'Saved this role' : `Logged as ${status}`,
                },
            ],
            createdAt: now,
            ...partial,
        };
        setJobs((prev) => [next, ...prev]);
        return next.id;
    }, []);

    const updateJob = useCallback((id, patch) => {
        setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
    }, []);

    // Status change is a first-class operation — it appends a timeline entry
    // and stamps `appliedDate` the first time the user transitions into the
    // "applied" status. Pure field edits should keep going through updateJob.
    const setStatus = useCallback((id, newStatus, options = {}) => {
        if (!STATUS_IDS.has(newStatus)) return;
        const now = Date.now();
        setJobs((prev) =>
            prev.map((j) => {
                if (j.id !== id || j.status === newStatus) return j;
                const wasApplied = !!j.appliedDate;
                const isFirstApply = !wasApplied && newStatus === 'applied';
                return {
                    ...j,
                    status: newStatus,
                    appliedDate: isFirstApply ? new Date(now).toISOString().slice(0, 10) : j.appliedDate,
                    timeline: [
                        ...(j.timeline || []),
                        {
                            id: `t_${makeId()}`,
                            type: 'status',
                            at: now,
                            from: j.status,
                            to: newStatus,
                            text:
                                options.note ||
                                `Moved to ${JOB_STATUSES.find((s) => s.id === newStatus)?.label}`,
                        },
                    ],
                };
            })
        );
    }, []);

    // Append a free-form note to an application's timeline.
    const addNote = useCallback((id, text) => {
        if (!text || !text.trim()) return;
        const now = Date.now();
        setJobs((prev) =>
            prev.map((j) =>
                j.id === id
                    ? {
                          ...j,
                          timeline: [
                              ...(j.timeline || []),
                              {
                                  id: `t_${makeId()}`,
                                  type: 'note',
                                  at: now,
                                  text: text.trim(),
                              },
                          ],
                      }
                    : j
            )
        );
    }, []);

    const removeJob = useCallback((id) => {
        setJobs((prev) => prev.filter((j) => j.id !== id));
    }, []);

    const exportJson = useCallback(() => {
        const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job-tracker-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [jobs]);

    return { jobs, addJob, updateJob, removeJob, exportJson, setStatus, addNote };
}

// ─── Kanban view helpers ──────────────────────────────────────────────────
// Four-column layout: Saved → Applied → Interview → Closed.
// Offer + Rejected both land in "Closed" so the funnel stays scannable
// but the underlying status is preserved (color-coded in the card meta).
export const KANBAN_COLUMNS = [
    { id: 'saved', label: 'Saved', statuses: ['saved'] },
    { id: 'applied', label: 'Applied', statuses: ['applied'] },
    { id: 'interview', label: 'Interview', statuses: ['interview'] },
    { id: 'closed', label: 'Closed', statuses: ['offer', 'rejected'] },
];

const STATUS_TO_COLUMN = Object.fromEntries(KANBAN_COLUMNS.flatMap((c) => c.statuses.map((s) => [s, c.id])));

// Default status when a card is dropped into a column. "closed" preserves
// whatever closed substatus was already set; new arrivals default to
// "rejected" because that's far more common than "offer" in practice.
export function defaultStatusForColumn(colId, currentStatus) {
    if (colId === 'saved') return 'saved';
    if (colId === 'applied') return 'applied';
    if (colId === 'interview') return 'interview';
    if (colId === 'closed') {
        return currentStatus === 'offer' || currentStatus === 'rejected' ? currentStatus : 'rejected';
    }
    return currentStatus;
}

export function columnOf(status) {
    return STATUS_TO_COLUMN[status] || 'saved';
}

// Friendly relative-time formatter for card metadata.
export function relTime(ts) {
    if (!ts) return '';
    const diff = ts - Date.now();
    const abs = Math.abs(diff);
    const day = 86_400_000;
    const hr = 3_600_000;
    const min = 60_000;
    let n;
    let unit;
    if (abs >= day) {
        n = Math.round(abs / day);
        unit = 'd';
    } else if (abs >= hr) {
        n = Math.round(abs / hr);
        unit = 'h';
    } else {
        n = Math.max(1, Math.round(abs / min));
        unit = 'm';
    }
    return diff < 0 ? `${n}${unit} ago` : `in ${n}${unit}`;
}
