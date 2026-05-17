import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Copy, Pencil, Trash2, Check } from 'lucide-react';

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
    const containerRef = useRef(null);

    const active = profiles.find((p) => p.id === activeProfileId);

    // Close on outside click.
    useEffect(() => {
        if (!open) return;
        const onDocClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setRenamingId(null);
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

    const handleCreate = () => {
        const name = window.prompt('Name this resume profile:', `Resume ${profiles.length + 1}`);
        if (name && name.trim() && onCreateProfile) {
            onCreateProfile(name.trim());
            setOpen(false);
        }
    };

    const handleDelete = (profile, e) => {
        e.stopPropagation();
        if (profiles.length <= 1) return;
        const ok = window.confirm(`Delete "${profile.name}"? This cannot be undone.`);
        if (ok && onDeleteProfile) onDeleteProfile(profile.id);
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 max-w-[200px] px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="Switch resume profile"
            >
                <span className="truncate">{active?.name || 'My Resume'}</span>
                <ChevronDown size={12} className="text-slate-500 shrink-0" />
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg border border-slate-200 shadow-lg z-50 overflow-hidden">
                    <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
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
                                        isActive ? 'bg-brand-50' : 'hover:bg-slate-50'
                                    }`}
                                    onClick={() => {
                                        if (isRenaming) return;
                                        if (!isActive && onSwitchProfile) onSwitchProfile(profile.id);
                                        setOpen(false);
                                    }}
                                >
                                    {isActive ? (
                                        <Check size={13} className="text-brand-600 shrink-0" />
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
                                            className="flex-1 text-[12px] bg-white border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:border-brand-400"
                                        />
                                    ) : (
                                        <span
                                            className={`flex-1 text-[12px] truncate ${isActive ? 'text-brand-900 font-semibold' : 'text-slate-700'}`}
                                        >
                                            {profile.name}
                                        </span>
                                    )}
                                    {!isRenaming && (
                                        <span className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => beginRename(profile, e)}
                                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
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
                                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                                                title="Duplicate"
                                            >
                                                <Copy size={11} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(profile, e)}
                                                disabled={profiles.length <= 1}
                                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
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
                    <div className="border-t border-slate-100 p-1">
                        <button
                            onClick={handleCreate}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-brand-700 hover:bg-brand-50 transition-colors font-medium"
                        >
                            <Plus size={13} /> New resume
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilesMenu;
