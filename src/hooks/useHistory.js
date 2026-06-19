import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 20;

export function useHistory(initialState) {
  const [history, setHistory] = useState([initialState]);
  const [pointer, setPointer] = useState(0);
  const isUndoRedoRef = useRef(false);

  const state = history[pointer];

  const pushState = useCallback((newState) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    setHistory((prev) => {
      const newHistory = prev.slice(0, pointer + 1);
      newHistory.push(typeof newState === 'function' ? newState(prev[pointer]) : newState);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setPointer((prev) => {
      const next = prev + 1;
      return next >= MAX_HISTORY ? MAX_HISTORY - 1 : next;
    });
  }, [pointer]);

  const undo = useCallback(() => {
    setPointer((prev) => {
      if (prev > 0) {
        isUndoRedoRef.current = true;
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setPointer((prev) => {
      if (prev < history.length - 1) {
        isUndoRedoRef.current = true;
        return prev + 1;
      }
      return prev;
    });
  }, [history.length]);

  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  return { state, pushState, undo, redo, canUndo, canRedo };
}
