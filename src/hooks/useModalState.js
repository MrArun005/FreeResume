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
// Every key defaults to false. Unknown keys are silently no-ops on close
// so we never accidentally crash on a typo in a button handler.

const KNOWN_KEYS = [
    'ats',
    'theme',
    'jobAssistant',
    'onboarding',
    'share',
    'tutorial',
    'featureTour',
    'aiMenu',
    'exportMenu',
    'roast',
    'coverLetter',
];

const initialState = Object.fromEntries(KNOWN_KEYS.map((k) => [k, false]));

function reducer(state, action) {
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

export function useModalState() {
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
