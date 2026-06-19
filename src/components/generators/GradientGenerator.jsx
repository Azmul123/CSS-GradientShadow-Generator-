import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ColorPicker from '../shared/ColorPicker.jsx';
import Slider from '../shared/Slider.jsx';
import CodeOutput from '../shared/CodeOutput.jsx';
import PresetManager from '../shared/PresetManager.jsx';
import UndoRedo from '../shared/UndoRedo.jsx';
import ShareButton from '../shared/ShareButton.jsx';
import { useHistory } from '../../hooks/useHistory.js';
import { randomGradientColors, getContrastRatio } from '../../utils/colorUtils.js';

const defaultState = {
  type: 'linear',
  angle: 135,
  direction: null,
  colors: [
    { color: '#e8823f', position: 0 },
    { color: '#d4850a', position: 100 },
  ],
};

const GRADIENT_TYPES = ['linear', 'radial', 'conic'];

const DIRECTION_GRID = [
  { label: '↖', value: 'to top left' },
  { label: '↑', value: 'to top' },
  { label: '↗', value: 'to top right' },
  { label: '←', value: 'to left' },
  { label: '·', value: null },
  { label: '→', value: 'to right' },
  { label: '↙', value: 'to bottom left' },
  { label: '↓', value: 'to bottom' },
  { label: '↘', value: 'to bottom right' },
];

const MAX_STOPS = 6;
const MIN_STOPS = 2;

export default function GradientGenerator({ initialState }) {
  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory(
    initialState || defaultState
  );

  const [textColor, setTextColor] = useState('#ffffff');

  // ---- Gradient CSS generation ----
  const gradientCSS = useMemo(() => {
    const stops = state.colors.map((c) => `${c.color} ${c.position}%`).join(', ');
    if (state.type === 'linear') {
      const dir = state.direction || `${state.angle}deg`;
      return `linear-gradient(${dir}, ${stops})`;
    }
    if (state.type === 'radial') return `radial-gradient(circle, ${stops})`;
    if (state.type === 'conic') return `conic-gradient(from ${state.angle}deg, ${stops})`;
    return '';
  }, [state]);

  // ---- Full CSS for CodeOutput ----
  const fullCSS = useMemo(() => {
    return `background: ${gradientCSS};`;
  }, [gradientCSS]);

  // ---- Contrast ratio ----
  const contrastInfo = useMemo(() => {
    const isValidHex = /^#[0-9a-fA-F]{6}$/.test(textColor);
    if (!isValidHex) return null;
    const ratio = getContrastRatio(textColor, state.colors[0].color);
    return {
      ratio: ratio.toFixed(2),
      aa: ratio >= 4.5,
      aaa: ratio >= 7.0,
    };
  }, [textColor, state.colors]);

  // ---- Handlers ----
  const handleTypeChange = useCallback(
    (type) => {
      pushState({ ...state, type });
    },
    [state, pushState]
  );

  const handleAngleChange = useCallback(
    (angle) => {
      pushState({ ...state, angle, direction: null });
    },
    [state, pushState]
  );

  const handleDirectionChange = useCallback(
    (dir) => {
      if (dir === null) return; // center dot — no action
      pushState({ ...state, direction: dir });
    },
    [state, pushState]
  );

  const handleColorChange = useCallback(
    (index, newColor) => {
      const colors = state.colors.map((c, i) =>
        i === index ? { ...c, color: newColor } : c
      );
      pushState({ ...state, colors });
    },
    [state, pushState]
  );

  const handlePositionChange = useCallback(
    (index, newPos) => {
      const colors = state.colors.map((c, i) =>
        i === index ? { ...c, position: newPos } : c
      );
      pushState({ ...state, colors });
    },
    [state, pushState]
  );

  const handleAddStop = useCallback(() => {
    if (state.colors.length >= MAX_STOPS) return;
    const lastColor = state.colors[state.colors.length - 1];
    const secondLast = state.colors[state.colors.length - 2];
    const newPos = Math.min(100, Math.round((lastColor.position + secondLast.position) / 2));
    const newColor = {
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      position: newPos,
    };
    const colors = [...state.colors, newColor].sort((a, b) => a.position - b.position);
    pushState({ ...state, colors });
  }, [state, pushState]);

  const handleRemoveStop = useCallback(
    (index) => {
      if (state.colors.length <= MIN_STOPS) return;
      const colors = state.colors.filter((_, i) => i !== index);
      pushState({ ...state, colors });
    },
    [state, pushState]
  );

  const handleRandomize = useCallback(() => {
    const count = 2 + Math.floor(Math.random() * 3); // 2-4 colors
    const randomColors = randomGradientColors(count);
    const step = 100 / (count - 1);
    const colors = randomColors.map((c, i) => ({
      color: c,
      position: Math.round(i * step),
    }));
    const angle = Math.floor(Math.random() * 360);
    const types = GRADIENT_TYPES;
    const type = types[Math.floor(Math.random() * types.length)];
    pushState({ type, angle, direction: null, colors });
  }, [pushState]);

  const handleLoadPreset = useCallback(
    (presetState) => {
      pushState(presetState);
    },
    [pushState]
  );

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="generator-enter">
      {/* Header */}
      <div className="generator-header">
        <h2 className="generator-title">Gradient Generator</h2>
        <p className="generator-subtitle">
          Create beautiful linear, radial, and conic gradients with full control over colors, stops, and direction.
        </p>
      </div>

      {/* Action Bar */}
      <div className="action-bar mb-lg">
        <UndoRedo canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} />
        <PresetManager
          namespace="gradient"
          currentState={state}
          onLoadPreset={handleLoadPreset}
        />
        <ShareButton generatorId="gradient" state={state} />
        <button className="btn btn-primary btn-sm" onClick={handleRandomize} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Randomize
        </button>
      </div>

      {/* Main layout */}
      <div className="generator-layout">
        {/* ==================== LEFT: CONTROLS ==================== */}
        <div className="generator-controls">
          {/* Gradient Type Toggle */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Gradient Type</span>
            </div>
            <div className="toggle-group">
              {GRADIENT_TYPES.map((t) => (
                <button
                  key={t}
                  className={`toggle-btn ${state.type === t ? 'active' : ''}`}
                  onClick={() => handleTypeChange(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Direction / Angle Controls */}
          {(state.type === 'linear' || state.type === 'conic') && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">
                  {state.type === 'linear' ? 'Direction & Angle' : 'Start Angle'}
                </span>
              </div>

              {/* Direction Grid — only for linear */}
              {state.type === 'linear' && (
                <div className="control-group mb-md">
                  <label className="control-label">Direction</label>
                  <div className="direction-grid">
                    {DIRECTION_GRID.map((d, i) => (
                      <button
                        key={i}
                        className={`direction-btn${
                          d.value === null ? ' direction-center' : ''
                        }${state.direction === d.value && d.value !== null ? ' active' : ''}`}
                        onClick={() => handleDirectionChange(d.value)}
                        title={d.value || ''}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Angle slider */}
              <Slider
                label="Angle"
                value={state.angle}
                onChange={handleAngleChange}
                min={0}
                max={360}
                step={1}
                unit="°"
              />
            </div>
          )}

          {/* Color Stops */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Color Stops</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleAddStop}
                disabled={state.colors.length >= MAX_STOPS}
              >
                + Add Stop
              </button>
            </div>

            <div className="color-stops-list">
              {state.colors.map((stop, index) => (
                <div key={index} className="color-stop-item">
                  <ColorPicker
                    color={stop.color}
                    onChange={(c) => handleColorChange(index, c)}
                  />
                  <div className="color-stop-position">
                    <Slider
                      value={stop.position}
                      onChange={(p) => handlePositionChange(index, p)}
                      min={0}
                      max={100}
                      step={1}
                      unit="%"
                      showValue={true}
                    />
                  </div>
                  <button
                    className="btn btn-danger btn-sm btn-icon"
                    onClick={() => handleRemoveStop(index)}
                    disabled={state.colors.length <= MIN_STOPS}
                    title="Remove stop"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Color Palette</span>
            </div>
            <div className="flex flex-wrap gap-sm">
              {state.colors.map((stop, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: stop.color,
                      border: '2px solid var(--border-input)',
                    }}
                  />
                  <span className="text-xs font-mono text-muted">{stop.color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contrast Checker */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Contrast Checker</span>
            </div>
            <div className="control-group mb-md">
              <label className="control-label">Text Color</label>
              <div className="color-picker-wrapper">
                <div
                  className="color-picker-swatch"
                  style={{ backgroundColor: textColor }}
                >
                  <input
                    type="color"
                    className="color-picker-native"
                    value={/^#[0-9a-fA-F]{6}$/.test(textColor) ? textColor : '#ffffff'}
                    onChange={(e) => setTextColor(e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  className="color-picker-hex"
                  value={textColor}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!val.startsWith('#')) val = '#' + val;
                    setTextColor(val);
                  }}
                  maxLength={7}
                  spellCheck={false}
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {contrastInfo && (
              <>
                <p className="text-sm text-muted mb-sm">
                  Contrast Ratio:{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {contrastInfo.ratio}:1
                  </strong>{' '}
                  <span className="text-xs text-muted">
                    (vs {state.colors[0].color})
                  </span>
                </p>
                <div className="contrast-result">
                  <span
                    className={`contrast-badge ${contrastInfo.aa ? 'pass' : 'fail'}`}
                  >
                    AA {contrastInfo.aa ? '✓ Pass' : '✗ Fail'}
                  </span>
                  <span
                    className={`contrast-badge ${contrastInfo.aaa ? 'pass' : 'fail'}`}
                  >
                    AAA {contrastInfo.aaa ? '✓ Pass' : '✗ Fail'}
                  </span>
                </div>
              </>
            )}

            {!contrastInfo && (
              <p className="text-sm text-muted">
                Enter a valid hex color above to check contrast.
              </p>
            )}
          </div>
        </div>

        {/* ==================== RIGHT: PREVIEW + CODE ==================== */}
        <div className="generator-preview-panel">
          {/* Live Preview */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Preview</span>
            </div>
            <div
              className="preview-area"
              style={{
                minHeight: 250,
                background: gradientCSS,
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {/* Text preview for contrast checker */}
              {contrastInfo && (
                <span
                  style={{
                    color: textColor,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textShadow: 'none',
                    padding: 'var(--space-lg)',
                    textAlign: 'center',
                    userSelect: 'none',
                  }}
                >
                  Sample Text Preview
                </span>
              )}
            </div>
          </div>

          {/* Gradient Bar (mini strip showing the gradient) */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Gradient Strip</span>
            </div>
            <div
              style={{
                height: 32,
                borderRadius: 'var(--radius-md)',
                background: (() => {
                  const stops = state.colors
                    .map((c) => `${c.color} ${c.position}%`)
                    .join(', ');
                  return `linear-gradient(to right, ${stops})`;
                })(),
                border: '1px solid var(--border-card)',
              }}
            />
          </div>

          {/* CSS Code Output */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">CSS Code</span>
            </div>
            <CodeOutput css={gradientCSS} property="background" />
          </div>
        </div>
      </div>
    </div>
  );
}
