import { useState, useCallback, useRef, useEffect } from 'react';

// State container with undo/redo. Setters are STABLE across renders (refs
// hold the latest currentIndex/history) so any downstream useCallback or
// useEffect that depends on `setState` doesn't get invalidated on every
// edit. Previously `setState` redeclared its `useCallback` with
// `[currentIndex]` deps, which made wrapped setters (like App's normalize-
// before-set wrapper) re-create on each keystroke — that ref change
// cascaded through every effect that depended on the wrapped setter,
// triggering spurious pagination re-runs and the "content jumps after 1s"
// symptom users were seeing.
const useHistory = (initialState) => {
    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentIndexRef = useRef(currentIndex);
    const historyRef = useRef(history);
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);
    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    const state = history[currentIndex];

    const setState = useCallback((action) => {
        setHistory((prevHistory) => {
            const ci = currentIndexRef.current;
            const currentHistory = prevHistory.slice(0, ci + 1);
            const currentState = currentHistory[currentHistory.length - 1];
            const newState = typeof action === 'function' ? action(currentState) : action;
            return [...currentHistory, newState];
        });
        setCurrentIndex((prev) => prev + 1);
    }, []);

    const undo = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }, []);

    const redo = useCallback(() => {
        setCurrentIndex((prev) => (prev < historyRef.current.length - 1 ? prev + 1 : prev));
    }, []);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    return [state, setState, undo, redo, canUndo, canRedo];
};

export default useHistory;
