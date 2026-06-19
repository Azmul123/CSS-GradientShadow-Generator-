import React, { useState, useMemo, useCallback } from 'react';
import ColorPicker from '../shared/ColorPicker.jsx';
import Slider from '../shared/Slider.jsx';
import CodeOutput from '../shared/CodeOutput.jsx';
import PresetManager from '../shared/PresetManager.jsx';
import ShareButton from '../shared/ShareButton.jsx';
import { useHistory } from '../../hooks/useHistory.js';
import { randomHex } from '../../utils/colorUtils.js';

const defaultState = {
  points: [
    { color: '#ff6b6b', x: 20, y: 30 },
    { color: '#4ecdc4', x: 80, y: 20 },
    { color: '#45b7d1', x: 50, y: 80 },
    { color: '#96ceb4', x: 10, y: 70 },
  ],
};

const MAX_POINTS = 6;
const MIN_POINTS = 2;

export default function MeshGradientGenerator({ initialState }) {
  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory(initialState || defaultState);

  const updatePoint = useCallback((index, updates) => {
    pushState((prev) => {
      const points = prev.points.map((p, i) =>
        i === index ? { ...p, ...updates } : p
      );
      return { ...prev, points };
    });
  }, [pushState]);

  const handleAddPoint = useCallback(() => {
    if (state.points.length >= MAX_POINTS) return;
    pushState((prev) => ({
      ...prev,
      points: [
        ...prev.points,
        {
          color: randomHex(),
          x: Math.round(Math.random() * 100),
          y: Math.round(Math.random() * 100),
        },
      ],
    }));
  }, [pushState, state.points.length]);

  const handleRemovePoint = useCallback((index) => {
    if (state.points.length <= MIN_POINTS) return;
    pushState((prev) => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index),
    }));
  }, [pushState, state.points.length]);

  const handleRandomize = useCallback(() => {
    const count = state.points.length;
    const newPoints = Array.from({ length: count }, () => ({
      color: randomHex(),
      x: Math.round(Math.random() * 100),
      y: Math.round(Math.random() * 100),
    }));
    pushState((prev) => ({ ...prev, points: newPoints }));
  }, [pushState, state.points.length]);

  const meshCSS = useMemo(() => {
    return state.points
      .map(
        (p) =>
          `radial-gradient(at ${p.x}% ${p.y}%, ${p.color} 0px, transparent 50%)`
      )
      .join(',\n    ');
  }, [state.points]);

  const fallbackColor = state.points.length > 0 ? state.points[0].color : '#1a1a2e';

  const fullCSS = useMemo(() => {
    return `.element {
  background-color: ${fallbackColor};
  background-image:
    ${meshCSS};
  min-height: 400px;
}`;
  }, [fallbackColor, meshCSS]);

  const previewStyle = useMemo(
    () => ({
      backgroundColor: fallbackColor,
      backgroundImage: state.points
        .map(
          (p) =>
            `radial-gradient(at ${p.x}% ${p.y}%, ${p.color} 0px, transparent 50%)`
        )
        .join(', '),
      width: '100%',
      minHeight: '280px',
      borderRadius: 'var(--radius-lg)',
      transition: 'background 0.3s ease',
    }),
    [state.points, fallbackColor]
  );

  return (
    <div className="generator-layout">
      {/* ---- Controls ---- */}
      <div className="generator-controls">
        <div className="generator-header">
          <h2 className="generator-title">Mesh Gradient</h2>
          <p className="generator-subtitle">
            Build beautiful layered radial gradients that mimic mesh-style backgrounds.
          </p>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <button className="btn btn-secondary btn-sm" onClick={undo} disabled={!canUndo} title="Undo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
            Undo
          </button>
          <button className="btn btn-secondary btn-sm" onClick={redo} disabled={!canRedo} title="Redo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
            Redo
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleRandomize} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Randomize
          </button>
          <PresetManager namespace="mesh-gradient" currentState={state} onLoadPreset={(s) => pushState(s)} />
          <ShareButton generatorId="mesh-gradient" state={state} />
        </div>

        {/* Points */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Mesh Points ({state.points.length}/{MAX_POINTS})</span>
            {state.points.length < MAX_POINTS && (
              <button className="btn btn-secondary btn-sm" onClick={handleAddPoint}>
                + Add Point
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {state.points.map((point, i) => (
              <div key={i} className="layer-card">
                <div className="layer-header">
                  <span className="layer-title">Point {i + 1}</span>
                  {state.points.length > MIN_POINTS && (
                    <button
                      className="btn btn-danger btn-sm btn-icon"
                      onClick={() => handleRemovePoint(i)}
                      title="Remove point"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <ColorPicker
                  color={point.color}
                  onChange={(c) => updatePoint(i, { color: c })}
                />

                <div className="mt-md">
                  <Slider
                    label="X Position"
                    value={point.x}
                    onChange={(v) => updatePoint(i, { x: v })}
                    min={0}
                    max={100}
                    step={1}
                    unit="%"
                  />
                </div>

                <div className="mt-sm">
                  <Slider
                    label="Y Position"
                    value={point.y}
                    onChange={(v) => updatePoint(i, { y: v })}
                    min={0}
                    max={100}
                    step={1}
                    unit="%"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Preview + Code ---- */}
      <div className="generator-preview-panel">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Preview</span>
            <span className="badge">{state.points.length} points</span>
          </div>
          <div className="preview-area" style={{ border: 'none', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
            <div style={previewStyle} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Generated CSS</span>
          </div>
          <CodeOutput fullCSS={fullCSS} formats={false} />
        </div>
      </div>
    </div>
  );
}
