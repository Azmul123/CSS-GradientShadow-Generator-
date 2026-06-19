import React from 'react';

export default function UndoRedo({ canUndo, canRedo, onUndo, onRedo }) {
  return (
    <div className="btn-group">
      <button
        className="btn btn-secondary btn-sm"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
        Undo
      </button>
      <button
        className="btn btn-secondary btn-sm"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
        Redo
      </button>
    </div>
  );
}
