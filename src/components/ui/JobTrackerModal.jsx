import { useEffect, useMemo, useState } from 'react';
import {
    X,
    Briefcase,
    Plus,
    Trash2,
    Download,
    ExternalLink,
    GripVertical,
    Star,
    FileText,
    Calendar,
    Building2,
    Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, PointerSensor, useSensor, useSensors, closestCorners, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    JOB_STATUSES,
    KANBAN_COLUMNS,
    columnOf,
    defaultStatusForColumn,
    relTime,
} from '../../hooks/useJobTracker';

// Job Application Tracker — the differentiator vs. generic resume builders.
// Pattern from Google Cloud's 101 GenAI use cases: nobody on the list serves
// the job seeker side of multi-step paperwork (TurboTax for taxes, ZenBusiness
// for incorporation, Qualia for real-estate closing — all individual-facing).
// We're uniquely positioned because every card here can link to:
//   - the resume profile/version sent (multi-profile store already exists)
//   - the JD analyzed by Smart Tailor (server cached)
//   - the match score we computed for that JD
//   - a timeline of status changes
// Storage is localStorage via useJobTracker — no signup, no DB, offline-OK.

const TONE_STYLES = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-stone-300 border-slate-200 dark:border-slate-700',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    emerald:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
};

// ─── Card ────────────────────────────────────────────────────────────────

function JobCard({ job, profiles, onOpen, isOverlay = false }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: job.id,
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
    };
    const profileName = profiles?.find((p) => p.id === job.resumeProfileId)?.name;
    const statusMeta = JOB_STATUSES.find((s) => s.id === job.status);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all ${
                isOverlay ? 'rotate-2 shadow-2xl ring-2 ring-brand-300' : ''
            }`}
        >
            {/* Drag handle on hover — keeps the rest of the card click-to-open. */}
            <button
                {...attributes}
                {...listeners}
                className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:text-stone-500 cursor-grab active:cursor-grabbing"
                aria-label="Drag to move"
            >
                <GripVertical size={12} />
            </button>
            <button onClick={() => onOpen(job.id)} className="text-left w-full">
                <div className="flex items-start gap-1.5 mb-1 pr-4">
                    <div className="font-semibold text-[13px] text-slate-900 dark:text-stone-100 leading-tight truncate flex-1">
                        {job.company || (
                            <span className="italic text-slate-400 dark:text-stone-500 font-normal">
                                Untitled company
                            </span>
                        )}
                    </div>
                    {typeof job.matchScore === 'number' && (
                        <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            <Star size={9} className="fill-current" />
                            {job.matchScore}%
                        </span>
                    )}
                </div>
                <div className="text-[12px] text-slate-600 dark:text-stone-300 truncate mb-2">
                    {job.role || 'Role / position'}
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                    {/* Status sub-chip — shows offer vs. rejected inside the
                        Closed column so users don't have to open the card. */}
                    {(job.status === 'offer' || job.status === 'rejected') && (
                        <span
                            className={`px-1.5 py-0.5 rounded border ${TONE_STYLES[statusMeta?.tone || 'slate']}`}
                        >
                            {statusMeta?.label}
                        </span>
                    )}
                    {profileName && (
                        <span className="px-1.5 py-0.5 rounded border bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/30 inline-flex items-center gap-0.5">
                            <FileText size={9} /> {profileName}
                        </span>
                    )}
                    {job.appliedDate && (
                        <span className="text-slate-400 dark:text-stone-500">{job.appliedDate}</span>
                    )}
                </div>
            </button>
        </div>
    );
}

// ─── Column ──────────────────────────────────────────────────────────────

function Column({ column, jobs, profiles, onOpen, onAdd }) {
    return (
        <div className="flex flex-col bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 min-h-0 min-w-0">
            <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 backdrop-blur z-10 rounded-t-xl">
                <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-stone-300 truncate">
                        {column.label}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-stone-500 px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-800 shrink-0">
                        {jobs.length}
                    </span>
                </div>
                {column.id === 'saved' && (
                    <button
                        onClick={onAdd}
                        className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                        title="Add application"
                    >
                        <Plus size={14} />
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[180px] max-h-[60vh]">
                <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} profiles={profiles} onOpen={onOpen} />
                    ))}
                </SortableContext>
                {jobs.length === 0 && (
                    <div className="text-[11px] text-slate-400 dark:text-stone-500 italic text-center py-8 px-2">
                        {column.id === 'saved'
                            ? 'Save roles you want to apply to.'
                            : column.id === 'applied'
                              ? 'Drag a card here when you apply.'
                              : column.id === 'interview'
                                ? 'Active interviews land here.'
                                : 'Outcomes: offers + rejections.'}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Detail Drawer ───────────────────────────────────────────────────────

function DetailDrawer({ job, profiles, onClose, onUpdate, onSetStatus, onAddNote, onDelete }) {
    const [noteDraft, setNoteDraft] = useState('');

    if (!job) return null;

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-slate-900 shadow-2xl z-[60] flex flex-col border-l border-slate-200 dark:border-slate-800"
        >
            <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
                <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-stone-100 truncate">
                        {job.company || 'Untitled'}
                    </h3>
                    <p className="text-[12px] text-slate-500 dark:text-stone-400 truncate">
                        {job.role || 'Role'}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-stone-200"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* Status pipeline pills */}
                <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-stone-500 mb-2">
                        Status
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {JOB_STATUSES.map((s) => {
                            const isActive = job.status === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => onSetStatus(job.id, s.id)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                                        isActive
                                            ? `${TONE_STYLES[s.tone]} ring-2 ring-offset-1 ring-slate-300 dark:ring-slate-600`
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-stone-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    {s.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Editable fields */}
                <div className="space-y-2">
                    <Field
                        icon={<Building2 size={12} />}
                        label="Company"
                        value={job.company}
                        onChange={(v) => onUpdate(job.id, { company: v })}
                    />
                    <Field
                        icon={<Briefcase size={12} />}
                        label="Role"
                        value={job.role}
                        onChange={(v) => onUpdate(job.id, { role: v })}
                    />
                    <Field
                        label="Job URL"
                        value={job.jdLink}
                        onChange={(v) => onUpdate(job.id, { jdLink: v })}
                        rightSlot={
                            job.jdLink ? (
                                <a
                                    href={job.jdLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-stone-200"
                                    aria-label="Open posting"
                                >
                                    <ExternalLink size={12} />
                                </a>
                            ) : null
                        }
                    />
                    <Field
                        label="Applied on"
                        type="date"
                        value={job.appliedDate}
                        onChange={(v) => onUpdate(job.id, { appliedDate: v })}
                    />
                </div>

                {/* Resume profile link — the differentiator */}
                <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-stone-500 mb-1.5 flex items-center gap-1">
                        <FileText size={10} /> Resume sent
                    </label>
                    <select
                        value={job.resumeProfileId || ''}
                        onChange={(e) => onUpdate(job.id, { resumeProfileId: e.target.value || null })}
                        className="w-full text-[13px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-stone-200"
                    >
                        <option value="">— Not yet picked —</option>
                        {profiles?.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Match score — read-only badge; filled by Smart Tailor later */}
                <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-stone-500 mb-1.5 flex items-center gap-1">
                        <Sparkles size={10} /> Smart Tailor match
                    </label>
                    <div className="text-[13px] text-slate-700 dark:text-stone-200">
                        {typeof job.matchScore === 'number' ? (
                            <>
                                <span className="font-bold text-amber-700 dark:text-amber-400">
                                    {job.matchScore}%
                                </span>{' '}
                                match
                            </>
                        ) : (
                            <span className="text-slate-400 dark:text-stone-500 italic">
                                Run Smart Tailor on this JD to score it.
                            </span>
                        )}
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-stone-500 mb-1.5">
                        Notes
                    </label>
                    <textarea
                        value={job.notes}
                        onChange={(e) => onUpdate(job.id, { notes: e.target.value })}
                        placeholder="Recruiter contact, prep links, follow-up cadence…"
                        rows={3}
                        className="w-full text-[13px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-stone-200 resize-none"
                    />
                </div>

                {/* Timeline */}
                <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-stone-500 mb-2 flex items-center gap-1">
                        <Calendar size={10} /> Timeline
                    </label>
                    <ol className="space-y-2 text-[12px]">
                        {[...(job.timeline || [])].reverse().map((event) => (
                            <li
                                key={event.id}
                                className="flex gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                            >
                                <div className="w-16 shrink-0 text-[10px] text-slate-400 dark:text-stone-500 pt-0.5">
                                    {relTime(event.at)}
                                </div>
                                <div className="flex-1 text-slate-700 dark:text-stone-300">{event.text}</div>
                            </li>
                        ))}
                    </ol>

                    {/* Quick add a timeline note (e.g. "Recruiter Joana replied", "F/up sent") */}
                    <div className="mt-3 flex gap-2">
                        <input
                            type="text"
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="Add a quick note…"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && noteDraft.trim()) {
                                    onAddNote(job.id, noteDraft.trim());
                                    setNoteDraft('');
                                }
                            }}
                            className="flex-1 text-[12px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
                        />
                        <button
                            onClick={() => {
                                if (!noteDraft.trim()) return;
                                onAddNote(job.id, noteDraft.trim());
                                setNoteDraft('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex justify-between items-center">
                <button
                    onClick={() => {
                        if (window.confirm(`Delete "${job.company || 'this application'}"?`)) {
                            onDelete(job.id);
                            onClose();
                        }
                    }}
                    className="text-[12px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5"
                >
                    <Trash2 size={12} /> Delete
                </button>
                <button
                    onClick={onClose}
                    className="text-[12px] text-slate-700 dark:text-stone-200 px-3 py-1.5 rounded-lg font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                    Done
                </button>
            </div>
        </motion.div>
    );
}

function Field({ icon, label, value, onChange, type = 'text', rightSlot }) {
    return (
        <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-stone-500 mb-1 flex items-center gap-1">
                {icon} {label}
            </label>
            <div className="relative">
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full text-[13px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-stone-200 ${rightSlot ? 'pr-8' : ''}`}
                />
                {rightSlot && <div className="absolute right-1 top-1/2 -translate-y-1/2">{rightSlot}</div>}
            </div>
        </div>
    );
}

// ─── Main modal ──────────────────────────────────────────────────────────

const JobTrackerModal = ({ onClose, profiles, tracker }) => {
    const { jobs, addJob, updateJob, removeJob, exportJson, setStatus, addNote } = tracker;
    const [openId, setOpenId] = useState(null);
    const [activeDragId, setActiveDragId] = useState(null);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key !== 'Escape') return;
            // If a detail drawer is open, close that first; only the outer
            // Escape press should dismiss the whole modal.
            if (openId) setOpenId(null);
            else onClose?.();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, openId]);

    const buckets = useMemo(() => {
        const out = Object.fromEntries(KANBAN_COLUMNS.map((c) => [c.id, []]));
        for (const j of jobs) {
            const col = columnOf(j.status);
            if (out[col]) out[col].push(j);
        }
        return out;
    }, [jobs]);

    const stats = useMemo(() => {
        const total = jobs.length;
        const applied = jobs.filter((j) => j.status !== 'saved' || !!j.appliedDate).length;
        const interview = jobs.filter((j) => j.status === 'interview').length;
        const offers = jobs.filter((j) => j.status === 'offer').length;
        return { total, applied, interview, offers };
    }, [jobs]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    const handleQuickAdd = () => {
        const id = addJob();
        setOpenId(id);
    };

    const handleDragStart = (event) => setActiveDragId(event.active.id);
    const handleDragEnd = (event) => {
        setActiveDragId(null);
        const { active, over } = event;
        if (!over) return;
        const activeJob = jobs.find((j) => j.id === active.id);
        if (!activeJob) return;

        // Resolve destination column: drop-on-column or drop-on-card.
        let destCol = KANBAN_COLUMNS.find((c) => c.id === over.id)?.id;
        if (!destCol) {
            const overJob = jobs.find((j) => j.id === over.id);
            if (overJob) destCol = columnOf(overJob.status);
        }
        if (!destCol) return;
        const newStatus = defaultStatusForColumn(destCol, activeJob.status);
        if (newStatus !== activeJob.status) setStatus(active.id, newStatus);
    };

    const openJob = openId ? jobs.find((j) => j.id === openId) : null;
    const activeJob = activeDragId ? jobs.find((j) => j.id === activeDragId) : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-6 bg-slate-950/60 dark:bg-slate-950/75 backdrop-blur-sm no-print"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-7xl max-h-[94vh] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 shadow-2xl flex flex-col"
            >
                <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-500/10 dark:to-indigo-500/10">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-brand-600 rounded-lg text-white shadow-lg shrink-0">
                            <Briefcase size={20} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-stone-100 m-0 truncate">
                                Job Tracker
                            </h2>
                            <p className="text-[12px] text-slate-500 dark:text-stone-400 m-0 truncate">
                                Each application linked to its resume version &amp; JD analysis.
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[11px]">
                        <Stat label="Total" value={stats.total} />
                        <Stat label="Applied" value={stats.applied} />
                        <Stat label="Interview" value={stats.interview} />
                        <Stat label="Offers" value={stats.offers} tone="emerald" />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleQuickAdd}
                            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                        >
                            <Plus size={14} /> Add
                        </button>
                        <button
                            onClick={exportJson}
                            disabled={jobs.length === 0}
                            className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-stone-200 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Export as JSON backup"
                        >
                            <Download size={13} />
                            <span className="hidden lg:inline">Export</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-stone-200"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden p-4">
                    {jobs.length === 0 ? (
                        <EmptyState onQuickAdd={handleQuickAdd} />
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 min-h-0">
                                {KANBAN_COLUMNS.map((col) => (
                                    <Column
                                        key={col.id}
                                        column={col}
                                        jobs={buckets[col.id] || []}
                                        profiles={profiles}
                                        onOpen={setOpenId}
                                        onAdd={handleQuickAdd}
                                    />
                                ))}
                            </div>
                            <DragOverlay>
                                {activeJob && (
                                    <JobCard
                                        job={activeJob}
                                        profiles={profiles}
                                        onOpen={() => {}}
                                        isOverlay
                                    />
                                )}
                            </DragOverlay>
                        </DndContext>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {openJob && (
                    <DetailDrawer
                        key={openJob.id}
                        job={openJob}
                        profiles={profiles}
                        onClose={() => setOpenId(null)}
                        onUpdate={updateJob}
                        onSetStatus={setStatus}
                        onAddNote={addNote}
                        onDelete={removeJob}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

function Stat({ label, value, tone }) {
    return (
        <div className="text-center">
            <div
                className={`text-base font-bold ${
                    tone === 'emerald'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-stone-100'
                }`}
            >
                {value}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-stone-400">
                {label}
            </div>
        </div>
    );
}

function EmptyState({ onQuickAdd }) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-100 to-indigo-100 text-brand-700 mb-4">
                <Briefcase size={36} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-stone-100 mb-2">
                Track every job you&apos;re chasing
            </h3>
            <p className="text-sm text-slate-600 dark:text-stone-300 max-w-md mb-6">
                Save roles, drag them through Applied → Interview → Closed, link each one to the resume
                version you sent, and stop losing track of follow-ups.
            </p>
            <button
                onClick={onQuickAdd}
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
                <Plus size={14} /> Add your first
            </button>
        </div>
    );
}

export default JobTrackerModal;
