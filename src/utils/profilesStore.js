// Multi-resume profile store. Each user can keep several tailored resumes
// side-by-side (e.g. "Backend", "Frontend", "Manager") and switch between
// them without losing data. Persistence is plain localStorage so the editor
// stays fully offline.
//
// On-disk shape:
//   resumeProfiles_v1: {
//     profiles: [{ id, name, resume, updatedAt }],
//     activeId: string,
//   }
//
// Migration: if the user has an old single-resume blob under `resumeData`,
// we wrap it into a "My Resume" profile on first load and leave the legacy
// key in place as a one-way backup.

const STORE_KEY = 'resumeProfiles_v1';
const LEGACY_KEY = 'resumeData';

const safeRead = (key) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};
const safeWrite = (key, value) => {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
};

// Cheap unique id. Date.now()+random keeps collisions unlikely without
// dragging in a uuid dependency.
const makeId = () => `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const blankStore = () => ({ profiles: [], activeId: null });

// Load the profiles store. Handles three shapes:
//   1. New shape exists → return as-is.
//   2. Legacy `resumeData` exists but no new shape → wrap into a single
//      "My Resume" profile and persist immediately.
//   3. Neither exists → return empty store; caller seeds a default.
export function loadProfilesStore() {
    const raw = safeRead(STORE_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.profiles)) return parsed;
        } catch {
            /* fall through to legacy migration */
        }
    }

    const legacy = safeRead(LEGACY_KEY);
    if (legacy) {
        try {
            const resume = JSON.parse(legacy);
            const id = makeId();
            const store = {
                profiles: [{ id, name: 'My Resume', resume, updatedAt: Date.now() }],
                activeId: id,
            };
            safeWrite(STORE_KEY, JSON.stringify(store));
            return store;
        } catch {
            /* corrupted legacy → ignore */
        }
    }

    return blankStore();
}

// Persist the entire store. The caller is expected to mutate first and then
// pass the new object — we don't merge.
export function saveProfilesStore(store) {
    if (!store || !Array.isArray(store.profiles)) return false;
    return safeWrite(STORE_KEY, JSON.stringify(store));
}

// Patch the active profile's resume without re-writing the entire store
// surface. Used by the autosave loop on every change.
export function patchActiveResume(store, nextResume) {
    if (!store?.profiles?.length || !store.activeId) return store;
    const next = {
        ...store,
        profiles: store.profiles.map((p) =>
            p.id === store.activeId ? { ...p, resume: nextResume, updatedAt: Date.now() } : p
        ),
    };
    saveProfilesStore(next);
    return next;
}

// Create a new profile from a seed resume. Returns the new store + id.
export function createProfile(store, name, seedResume) {
    const id = makeId();
    const next = {
        ...store,
        profiles: [
            ...store.profiles,
            { id, name: name?.trim() || 'Untitled', resume: seedResume, updatedAt: Date.now() },
        ],
        activeId: id,
    };
    saveProfilesStore(next);
    return { store: next, id };
}

// Duplicate the named profile and switch to the copy.
export function duplicateProfile(store, id) {
    const src = store.profiles.find((p) => p.id === id);
    if (!src) return { store, id: null };
    // Deep-clone via JSON so the copy doesn't share resume refs with the source.
    const cloned = JSON.parse(JSON.stringify(src.resume));
    return createProfile(store, `${src.name} (Copy)`, cloned);
}

// Rename a profile.
export function renameProfile(store, id, newName) {
    const next = {
        ...store,
        profiles: store.profiles.map((p) =>
            p.id === id ? { ...p, name: newName?.trim() || p.name, updatedAt: Date.now() } : p
        ),
    };
    saveProfilesStore(next);
    return next;
}

// Delete a profile. Cannot delete the only remaining one — the caller is
// expected to disable the UI in that case but we guard here anyway.
export function deleteProfile(store, id) {
    if (store.profiles.length <= 1) return store;
    const remaining = store.profiles.filter((p) => p.id !== id);
    const nextActive = store.activeId === id ? remaining[0].id : store.activeId;
    const next = { ...store, profiles: remaining, activeId: nextActive };
    saveProfilesStore(next);
    return next;
}

// Switch the active profile pointer.
export function switchActive(store, id) {
    if (!store.profiles.some((p) => p.id === id)) return store;
    const next = { ...store, activeId: id };
    saveProfilesStore(next);
    return next;
}

// Convenience helpers for the UI.
export const getActiveProfile = (store) => store?.profiles?.find((p) => p.id === store.activeId) || null;
