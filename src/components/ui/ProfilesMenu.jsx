import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Copy, Pencil, Trash2, Check, FileText } from 'lucide-react';

// Compact profile switcher rendered in the editor sidebar header. Shows
// the active profile name as a pill button; clicking opens a dropdown with
// every saved profile + actions (new, duplicate, rename, delete).
//
// Each row in the open menu has a small inline rename mode triggered by the
// pencil icon so the user can rename without leaving the dropdown.
const ProfilesMenu = ({
    profiles = [],
    activeProfileId,
    onSwitchProfile,
    onCreateProfile,
    onDuplicateProfile,
    onRenameProfile,
    onDeleteProfile,
}) => {
    const [open, setOpen] = useState(false);
    const [renamingId, setRenamingId] = useState(null);
    const [renameDraft, setRenameDraft] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createDraft, setCreateDraft] = useState('');
    const containerRef = useRef(null);

    const active = profiles.find((p) => p.id === activeProfileId);

    // Close on outside click.
    useEffect(() => {
        if (!open) return;
        const onDocClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setRenamingId(null);
                setIsCreating(false);
                setCreateDraft('');
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [open]);

    const beginRename = (profile, e) => {
        e.stopPropagation();
        setRenamingId(profile.id);
        setRenameDraft(profile.name);
    };

    const commitRename = (id) => {
        const next = renameDraft.trim();
        if (next && onRenameProfile) onRenameProfile(id, next);
        setRenamingId(null);
        setRenameDraft('');
    };

    const beginCreate = () => {
        // Pre-fill with a sensible default so a user who just hits Enter
        // gets a profile created (without having to type anything).
        setCreateDraft(`Resume ${profiles.length + 1}`);
        setIsCreating(true);
    };

    const commitCreate = () => {
        const name = createDraft.trim();
        if (name && onCreateProfile) {
            onCreateProfile(name);
        }
        setIsCreating(false);
        setCreateDraft('');
        setOpen(false);
    };

    const cancelCreate = () => {
        setIsCreating(false);
        setCreateDraft('');
    };

    const handleDelete = (profile, e) => {
        e.stopPropagation();
        if (profiles.length <= 1) return;
        const ok = window.confirm(`Delete "${profile.name}"? This cannot be undone.`);
        if (ok && onDeleteProfile) onDeleteProfile(profile.id);
    };

    const hasMultiple = profiles.length > 1;

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 max-w-[240px] px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-stone-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm ${
                    open
                        ? 'ring-2 ring-brand-200 dark:ring-brand-500/30 border-brand-300 dark:border-brand-500/40'
                        : ''
                }`}
                title="Switch resume profile"
                aria-expanded={open}
                aria-haspopup="menu"
            >
                <FileText size={14} className="text-slate-500 dark:text-stone-400 shrink-0" />
                <span className="truncate">{active?.name || 'My Resume'}</span>
                {hasMultiple && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 shrink-0 leading-none">
                        {profiles.length}
                    </span>
                )}
                <ChevronDown
                    size={14}
                    className={`text-slate-500 dark:text-stone-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg dark:shadow-black/40 z-50 overflow-hidden">
                    <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-400 dark:text-stone-500 font-bold border-b border-slate-100 dark:border-slate-700">
                        Resumes ({profiles.length})
                    </div>
                    <ul className="max-h-72 overflow-y-auto py-1">
                        {profiles.map((profile) => {
                            const isActive = profile.id === activeProfileId;
                            const isRenaming = renamingId === profile.id;
                            return (
                                <li
                                    key={profile.id}
                                    className={`group flex items-center gap-1.5 px-2 py-1.5 mx-1 rounded-md cursor-pointer transition-colors ${
                                        isActive
                                            ? 'bg-brand-50 dark:bg-brand-500/15'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                    onClick={() => {
                                        if (isRenaming) return;
                                        if (!isActive && onSwitchProfile) onSwitchProfile(profile.id);
                                        setOpen(false);
                                    }}
                                >
                                    {isActive ? (
                                        <Check
                                            size={13}
                                            className="text-brand-600 dark:text-brand-400 shrink-0"
                                        />
                                    ) : (
                                        <span className="w-[13px] shrink-0" />
                                    )}
                                    {isRenaming ? (
                                        <input
                                            autoFocus
                                            value={renameDraft}
                                            onChange={(e) => setRenameDraft(e.target.value)}
                                            onBlur={() => commitRename(profile.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') commitRename(profile.id);
                                                if (e.key === 'Escape') {
                                                    setRenamingId(null);
                                                    setRenameDraft('');
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex-1 text-[12px] bg-white dark:bg-slate-900 text-slate-900 dark:text-stone-100 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 outline-none focus:border-brand-400"
                                        />
                                    ) : (
                                        <span
                                            className={`flex-1 text-[12px] truncate ${isActive ? 'text-brand-900 dark:text-brand-200 font-semibold' : 'text-slate-700 dark:text-stone-300'}`}
                                        >
                                            {profile.name}
                                        </span>
                                    )}
                                    {!isRenaming && (
                                        <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => beginRename(profile, e)}
                                                className="p-1 text-slate-400 dark:text-stone-500 hover:text-slate-700 dark:hover:text-stone-200 hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
                                                title="Rename"
                                            >
                                                <Pencil size={11} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onDuplicateProfile) onDuplicateProfile(profile.id);
                                                    setOpen(false);
                                                }}
                                                className="p-1 text-slate-400 dark:text-stone-500 hover:text-slate-700 dark:hover:text-stone-200 hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
                                                title="Duplicate"
                                            >
                                                <Copy size={11} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(profile, e)}
                                                disabled={profiles.length <= 1}
                                                className="p-1 text-slate-400 dark:text-stone-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 dark:disabled:hover:text-stone-500"
                                                title={
                                                    profiles.length <= 1
                                                        ? 'Cannot delete the only profile'
                                                        : 'Delete'
                                                }
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    <div className="border-t border-slate-100 dark:border-slate-700 p-1">
                        {isCreating ? (
                            // Inline create — same UX shape as inline rename.
                            // Replaces the old window.prompt() flow that felt
                            // jarring and got blocked in some embedded contexts.
                            <div className="flex items-center gap-1 px-2 py-1.5">
                                <Plus size={13} className="text-brand-600 dark:text-brand-400 shrink-0" />
                                <input
                                    autoFocus
                                    value={createDraft}
                                    onChange={(e) => setCreateDraft(e.target.value)}
                                    onBlur={commitCreate}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') commitCreate();
                                        if (e.key === 'Escape') cancelCreate();
                                    }}
                                    placeholder="Resume name"
                                    className="flex-1 text-[12px] bg-white dark:bg-slate-900 text-slate-900 dark:text-stone-100 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 outline-none focus:border-brand-400"
                                />
                            </div>
                        ) : (
                            <button
                                onClick={beginCreate}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors font-medium"
                            >
                                <Plus size={13} /> New resume
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilesMenu;
