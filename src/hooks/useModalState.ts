import { useReducer, useMemo } from 'react';

// Centralized modal/menu state for the editor view.
//
// App.jsx used to carry 11 independent `useState` flags — one per modal —
// which made it hard to enforce invariants like "only one menu open at a
// time" and noisy to read. We consolidate them into a single reducer
// keyed by modal id. Callers do:
//
//   const modals = useModalState();
//   modals.open('ats');
//   modals.close('ats');
//   modals.toggle('exportMenu');
//   modals.is('ats');         // boolean
//
// Unknown keys are silently no-ops on close/open so a typo in a button
// handler never crashes.

export type ModalKey =
    | 'ats'
    | 'theme'
    | 'jobAssistant'
    | 'autoTailor'
    | 'onboarding'
    | 'share'
    | 'tutorial'
    | 'featureTour'
    | 'aiMenu'
    | 'exportMenu'
    | 'roast'
    | 'coverLetter'
    | 'shortcuts'
    | 'jobTracker';

const KNOWN_KEYS: ModalKey[] = [
    'ats',
    'theme',
    'jobAssistant',
    'autoTailor',
    'onboarding',
    'share',
    'tutorial',
    'featureTour',
    'aiMenu',
    'exportMenu',
    'roast',
    'coverLetter',
    'shortcuts',
    'jobTracker',
];

type ModalState = Record<ModalKey, boolean>;

const initialState: ModalState = KNOWN_KEYS.reduce((acc, k) => ({ ...acc, [k]: false }), {} as ModalState);

type Action =
    | { type: 'OPEN'; key: ModalKey }
    | { type: 'CLOSE'; key: ModalKey }
    | { type: 'TOGGLE'; key: ModalKey }
    | { type: 'SET'; key: ModalKey; value: boolean }
    | { type: 'CLOSE_ALL' };

function reducer(state: ModalState, action: Action): ModalState {
    switch (action.type) {
        case 'OPEN':
            if (!(action.key in state)) return state;
            return { ...state, [action.key]: true };
        case 'CLOSE':
            if (!(action.key in state)) return state;
            return { ...state, [action.key]: false };
        case 'TOGGLE':
            if (!(action.key in state)) return state;
            return { ...state, [action.key]: !state[action.key] };
        case 'SET':
            if (!(action.key in state)) return state;
            return { ...state, [action.key]: !!action.value };
        case 'CLOSE_ALL':
            return initialState;
        default:
            return state;
    }
}

export interface ModalStateApi {
    state: ModalState;
    is: (key: ModalKey) => boolean;
    open: (key: ModalKey) => void;
    close: (key: ModalKey) => void;
    toggle: (key: ModalKey) => void;
    set: (key: ModalKey, value: boolean) => void;
    closeAll: () => void;
}

export function useModalState(): ModalStateApi {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Memoize the public surface so referential identity is stable across
    // renders — handlers passed to children don't trigger re-renders.
    return useMemo(
        () => ({
            state,
            is: (key) => !!state[key],
            open: (key) => dispatch({ type: 'OPEN', key }),
            close: (key) => dispatch({ type: 'CLOSE', key }),
            toggle: (key) => dispatch({ type: 'TOGGLE', key }),
            set: (key, value) => dispatch({ type: 'SET', key, value }),
            closeAll: () => dispatch({ type: 'CLOSE_ALL' }),
        }),
        [state]
    );
}
