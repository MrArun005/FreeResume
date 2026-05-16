import { useState, useCallback } from 'react';

const useHistory = (initialState) => {
    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const state = history[currentIndex];

    const setState = useCallback((action) => {
        setHistory((prevHistory) => {
            const currentHistory = prevHistory.slice(0, currentIndex + 1);
            const currentState = currentHistory[currentHistory.length - 1];

            const newState = typeof action === 'function' ? action(currentState) : action;

            return [...currentHistory, newState];
        });
        setCurrentIndex((prev) => prev + 1);
    }, [currentIndex]);

    const undo = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }, []);

    const redo = useCallback(() => {
        setCurrentIndex((prev) => (prev < history.length - 1 ? prev + 1 : prev));
    }, [history.length]);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    return [state, setState, undo, redo, canUndo, canRedo];
};

export default useHistory;
