import React, { useState, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';

export default function PresetManager({ namespace, currentState, onLoadPreset }) {
  const [presets, setPresets] = useLocalStorage(`css-gen-presets-${namespace}`, []);
  const [showModal, setShowModal] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleSave = useCallback(() => {
    if (!presetName.trim()) return;
    const newPreset = {
      id: Date.now(),
      name: presetName.trim(),
      state: currentState,
      createdAt: new Date().toISOString(),
    };
    setPresets(prev => [...prev, newPreset]);
    setPresetName('');
    setShowModal(false);
  }, [presetName, currentState, setPresets]);

  const handleDelete = useCallback((id) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  }, [setPresets]);

  const handleLoad = useCallback((preset) => {
    onLoadPreset(preset.state);
    setShowModal(false);
  }, [onLoadPreset]);

  return (
    <>
      <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Presets
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-lg">
              <h3 className="modal-title" style={{ marginBottom: 0 }}>Presets</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="flex gap-sm mb-lg">
              <input
                type="text"
                className="text-input"
                placeholder="Preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!presetName.trim()}>
                Save
              </button>
            </div>

            {presets.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                <p className="text-muted text-sm">No saved presets yet</p>
              </div>
            ) : (
              <div className="preset-list">
                {presets.map(preset => (
                  <div key={preset.id} className="preset-item">
                    <span className="preset-name" onClick={() => handleLoad(preset)} style={{ cursor: 'pointer', flex: 1 }}>
                      {preset.name}
                    </span>
                    <button
                      className="btn btn-danger btn-sm btn-icon"
                      onClick={() => handleDelete(preset.id)}
                      title="Delete preset"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
