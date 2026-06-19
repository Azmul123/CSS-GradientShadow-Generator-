import React, { useState, useMemo, useCallback } from 'react';
import ColorPicker from '../shared/ColorPicker.jsx';
import Slider from '../shared/Slider.jsx';
import CodeOutput from '../shared/CodeOutput.jsx';
import PresetManager from '../shared/PresetManager.jsx';
import ShareButton from '../shared/ShareButton.jsx';
import { useHistory } from '../../hooks/useHistory.js';
import { hexToRgba } from '../../utils/colorUtils.js';

const BG_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

const defaultState = {
  bgOpacity: 20,
  blur: 12,
  borderOpacity: 30,
  borderRadius: 16,
  tintColor: '#ffffff',
  bgPreset: 0,
};

export default function GlassmorphismGenerator({ initialState }) {
  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory(
    initialState || defaultState
  );

  const { bgOpacity, blur, borderOpacity, borderRadius, tintColor, bgPreset } = state;

  const updateField = useCallback(
    (field) => (value) => {
      pushState((prev) => ({ ...prev, [field]: value }));
    },
    [pushState]
  );

  const handleLoadPreset = useCallback(
    (presetState) => {
      pushState(presetState);
    },
    [pushState]
  );

  const handleBgPreset = useCallback(
    (index) => {
      pushState((prev) => ({ ...prev, bgPreset: index }));
    },
    [pushState]
  );

  // Computed CSS values
  const glassBackground = useMemo(
    () => hexToRgba(tintColor, bgOpacity / 100),
    [tintColor, bgOpacity]
  );

  const glassBorder = useMemo(
    () => `rgba(255, 255, 255, ${(borderOpacity / 100).toFixed(2)})`,
    [borderOpacity]
  );

  // Full generated CSS
  const generatedCSS = useMemo(() => {
    const opacityVal = (bgOpacity / 100).toFixed(2);
    const borderOpacityVal = (borderOpacity / 100).toFixed(2);
    return `.glass-card {
  background: ${hexToRgba(tintColor, opacityVal)};
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border: 1px solid rgba(255, 255, 255, ${borderOpacityVal});
  border-radius: ${borderRadius}px;
}`;
  }, [tintColor, bgOpacity, blur, borderOpacity, borderRadius]);

  // Preview glass card inline styles
  const glassCardStyle = useMemo(
    () => ({
      background: glassBackground,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      border: `1px solid ${glassBorder}`,
      borderRadius: `${borderRadius}px`,
      padding: '32px',
      maxWidth: '320px',
      width: '100%',
      color: '#ffffff',
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    }),
    [glassBackground, blur, glassBorder, borderRadius]
  );

  const previewContainerStyle = useMemo(
    () => ({
      background: BG_PRESETS[bgPreset],
      minHeight: '320px',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid var(--border-card)',
    }),
    [bgPreset]
  );

  return (
    <div className="generator-layout">
      {/* Controls Panel */}
      <div className="generator-controls">
        <div className="generator-header">
          <h2 className="generator-title">Glassmorphism</h2>
          <p className="generator-subtitle">
            Create frosted glass effects with backdrop blur and translucent backgrounds
          </p>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <button
            className="btn btn-ghost btn-sm"
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
          >
            ↩ Undo
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
          >
            ↪ Redo
          </button>
          <PresetManager
            namespace="glassmorphism"
            currentState={state}
            onLoadPreset={handleLoadPreset}
          />
          <ShareButton generatorId="glassmorphism" state={state} />
        </div>

        {/* Browser Support Warning */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Browser Support
            </span>
            <span className="text-xs text-muted">
              backdrop-filter requires Chrome 76+, Firefox 103+, Safari 9+
            </span>
          </div>
        </div>

        {/* Background Preset Swatches */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Background</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            {BG_PRESETS.map((bg, i) => (
              <button
                key={i}
                onClick={() => handleBgPreset(i)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: bg,
                  border:
                    bgPreset === i
                      ? '3px solid var(--accent-primary)'
                      : '2px solid var(--border-input)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  outline: 'none',
                  boxShadow:
                    bgPreset === i ? '0 0 0 2px rgba(0, 212, 255, 0.3)' : 'none',
                  flexShrink: 0,
                }}
                title={`Background preset ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Glass Controls */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Glass Properties</span>
          </div>
          <div className="flex flex-col gap-md">
            <ColorPicker
              label="Tint Color"
              color={tintColor}
              onChange={updateField('tintColor')}
            />
            <Slider
              label="Background Opacity"
              value={bgOpacity}
              onChange={updateField('bgOpacity')}
              min={0}
              max={100}
              unit="%"
            />
            <Slider
              label="Blur"
              value={blur}
              onChange={updateField('blur')}
              min={0}
              max={40}
              unit="px"
            />
            <Slider
              label="Border Opacity"
              value={borderOpacity}
              onChange={updateField('borderOpacity')}
              min={0}
              max={100}
              unit="%"
            />
            <Slider
              label="Border Radius"
              value={borderRadius}
              onChange={updateField('borderRadius')}
              min={0}
              max={50}
              unit="px"
            />
          </div>
        </div>
      </div>

      {/* Preview + Output Panel */}
      <div className="generator-preview-panel">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Preview</span>
          </div>
          <div style={previewContainerStyle}>
            {/* Decorative shapes behind the glass */}
            <div
              style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.18)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-15%',
                right: '-5%',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '30%',
                right: '15%',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                pointerEvents: 'none',
              }}
            />

            {/* Glass Card */}
            <div style={glassCardStyle}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#ffffff',
                }}
              >
                Glass Card
              </h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: 'rgba(255, 255, 255, 0.85)',
                  margin: 0,
                }}
              >
                This is a glassmorphism card with frosted glass effect. 
                The content behind is beautifully blurred.
              </p>
            </div>
          </div>
        </div>

        {/* Code Output */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">CSS Code</span>
          </div>
          <CodeOutput fullCSS={generatedCSS} formats={false} />
        </div>
      </div>
    </div>
  );
}
