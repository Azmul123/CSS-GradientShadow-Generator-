import React, { useState, useMemo, useCallback } from 'react';
import ColorPicker from '../shared/ColorPicker.jsx';
import Slider from '../shared/Slider.jsx';
import CodeOutput from '../shared/CodeOutput.jsx';
import PresetManager from '../shared/PresetManager.jsx';
import ShareButton from '../shared/ShareButton.jsx';
import { useHistory } from '../../hooks/useHistory.js';
import { randomGradientColors } from '../../utils/colorUtils.js';

const defaultState = {
  colors: ['#e8823f', '#d4850a', '#c0392b', '#4a7c59'],
  duration: 4,
  direction: 'horizontal',
  bgSize: 300,
};

const DIRECTIONS = [
  { id: 'horizontal', label: '↔ Horizontal', angle: 'to right' },
  { id: 'vertical', label: '↕ Vertical', angle: 'to bottom' },
  { id: 'diagonal', label: '↗ Diagonal', angle: '135deg' },
];

const DIRECTION_POSITIONS = {
  horizontal: { from: '0% 50%', to: '100% 50%' },
  vertical: { from: '50% 0%', to: '50% 100%' },
  diagonal: { from: '0% 0%', to: '100% 100%' },
};

export default function GradientAnimationGenerator({ initialState }) {
  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory(initialState || defaultState);

  const updateState = useCallback((updates) => {
    pushState((prev) => ({ ...prev, ...updates }));
  }, [pushState]);

  const handleColorChange = useCallback((index, color) => {
    pushState((prev) => {
      const colors = [...prev.colors];
      colors[index] = color;
      return { ...prev, colors };
    });
  }, [pushState]);

  const handleAddColor = useCallback(() => {
    if (state.colors.length >= 4) return;
    pushState((prev) => ({
      ...prev,
      colors: [...prev.colors, randomGradientColors(1)[0]],
    }));
  }, [pushState, state.colors.length]);

  const handleRemoveColor = useCallback((index) => {
    if (state.colors.length <= 2) return;
    pushState((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  }, [pushState, state.colors.length]);

  const handleRandomize = useCallback(() => {
    const count = state.colors.length;
    updateState({ colors: randomGradientColors(count) });
  }, [updateState, state.colors.length]);

  const dirInfo = DIRECTION_POSITIONS[state.direction];
  const dirAngle = DIRECTIONS.find((d) => d.id === state.direction)?.angle || 'to right';

  const animName = 'gradientAnim';

  const keyframesCSS = useMemo(() => {
    return `@keyframes ${animName} {
  0% { background-position: ${dirInfo.from}; }
  50% { background-position: ${dirInfo.to}; }
  100% { background-position: ${dirInfo.from}; }
}`;
  }, [dirInfo, animName]);

  const gradientValue = useMemo(() => {
    return `linear-gradient(${dirAngle}, ${state.colors.join(', ')})`;
  }, [dirAngle, state.colors]);

  const fullCSS = useMemo(() => {
    return `${keyframesCSS}

.element {
  background: ${gradientValue};
  background-size: ${state.bgSize}% ${state.bgSize}%;
  animation: ${animName} ${state.duration}s ease infinite;
}`;
  }, [keyframesCSS, gradientValue, state.bgSize, state.duration, animName]);

  // Inject a <style> for the live preview animation
  const previewStyleTag = useMemo(() => {
    return `
      @keyframes ${animName} {
        0% { background-position: ${dirInfo.from}; }
        50% { background-position: ${dirInfo.to}; }
        100% { background-position: ${dirInfo.from}; }
      }
    `;
  }, [dirInfo, animName]);

  const previewStyle = useMemo(() => ({
    background: gradientValue,
    backgroundSize: `${state.bgSize}% ${state.bgSize}%`,
    animation: `${animName} ${state.duration}s ease infinite`,
    width: '100%',
    minHeight: '280px',
    borderRadius: 'var(--radius-lg)',
  }), [gradientValue, state.bgSize, state.duration, animName]);

  return (
    <div className="generator-layout">
      {/* Inject keyframes for preview */}
      <style>{previewStyleTag}</style>

      {/* ---- Controls ---- */}
      <div className="generator-controls">
        <div className="generator-header">
          <h2 className="generator-title">Gradient Animation</h2>
          <p className="generator-subtitle">
            Create mesmerizing animated CSS gradients with customizable colors, speed, and direction.
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
          <PresetManager namespace="gradient-animation" currentState={state} onLoadPreset={(s) => pushState(s)} />
          <ShareButton generatorId="gradient-animation" state={state} />
        </div>

        {/* Colors */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Gradient Colors</span>
            {state.colors.length < 4 && (
              <button className="btn btn-secondary btn-sm" onClick={handleAddColor}>+ Add Color</button>
            )}
          </div>
          <div className="color-stops-list">
            {state.colors.map((color, i) => (
              <div key={i} className="color-stop-item">
                <ColorPicker
                  color={color}
                  onChange={(c) => handleColorChange(i, c)}
                  label={`Color ${i + 1}`}
                />
                {state.colors.length > 2 && (
                  <button
                    className="btn btn-danger btn-sm btn-icon"
                    onClick={() => handleRemoveColor(i)}
                    title="Remove color"
                    style={{ marginTop: '24px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Direction */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Direction</span>
          </div>
          <div className="toggle-group">
            {DIRECTIONS.map((dir) => (
              <button
                key={dir.id}
                className={`toggle-btn ${state.direction === dir.id ? 'active' : ''}`}
                onClick={() => updateState({ direction: dir.id })}
              >
                {dir.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animation Settings */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Animation Settings</span>
          </div>
          <Slider
            label="Duration"
            value={state.duration}
            onChange={(v) => updateState({ duration: v })}
            min={1}
            max={10}
            step={0.5}
            unit="s"
          />
          <div className="mt-md">
            <Slider
              label="Background Size"
              value={state.bgSize}
              onChange={(v) => updateState({ bgSize: v })}
              min={200}
              max={400}
              step={10}
              unit="%"
            />
          </div>
        </div>
      </div>

      {/* ---- Preview + Code ---- */}
      <div className="generator-preview-panel">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Preview</span>
            <span className="badge">{state.duration}s · {state.direction}</span>
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
