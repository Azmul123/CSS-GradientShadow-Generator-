import React, { useState, useMemo, useCallback } from 'react';
import ColorPicker from '../shared/ColorPicker.jsx';
import Slider from '../shared/Slider.jsx';
import CodeOutput from '../shared/CodeOutput.jsx';
import PresetManager from '../shared/PresetManager.jsx';
import UndoRedo from '../shared/UndoRedo.jsx';
import ShareButton from '../shared/ShareButton.jsx';
import { useHistory } from '../../hooks/useHistory.js';
import { randomHex, hexToRgba } from '../../utils/colorUtils.js';

const MAX_LAYERS = 4;

const defaultState = {
  layers: [
    { x: 2, y: 2, blur: 4, color: '#000000', opacity: 50 }
  ],
  sampleText: 'CSS Visual Generator',
  fontSize: 48
};

export default function TextShadowGenerator({ initialState }) {
  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory(
    initialState || defaultState
  );

  // ---------- helpers ----------
  const updateState = useCallback(
    (updates) => {
      pushState((prev) => ({ ...prev, ...updates }));
    },
    [pushState]
  );

  const updateLayer = useCallback(
    (index, field, value) => {
      pushState((prev) => {
        const layers = prev.layers.map((l, i) =>
          i === index ? { ...l, [field]: value } : l
        );
        return { ...prev, layers };
      });
    },
    [pushState]
  );

  const addLayer = useCallback(() => {
    pushState((prev) => {
      if (prev.layers.length >= MAX_LAYERS) return prev;
      return {
        ...prev,
        layers: [
          ...prev.layers,
          {
            x: Math.round(Math.random() * 10 - 5),
            y: Math.round(Math.random() * 10 - 5),
            blur: Math.round(Math.random() * 15 + 2),
            color: randomHex(),
            opacity: Math.round(Math.random() * 40 + 40)
          }
        ]
      };
    });
  }, [pushState]);

  const removeLayer = useCallback(
    (index) => {
      pushState((prev) => {
        if (prev.layers.length <= 1) return prev;
        return {
          ...prev,
          layers: prev.layers.filter((_, i) => i !== index)
        };
      });
    },
    [pushState]
  );

  const randomize = useCallback(() => {
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 layers
    const layers = Array.from({ length: count }, () => ({
      x: Math.round(Math.random() * 40 - 20),
      y: Math.round(Math.random() * 40 - 20),
      blur: Math.round(Math.random() * 30),
      color: randomHex(),
      opacity: Math.round(Math.random() * 60 + 30)
    }));
    pushState((prev) => ({
      ...prev,
      layers,
      fontSize: Math.round(Math.random() * 60 + 32)
    }));
  }, [pushState]);

  // ---------- CSS generation ----------
  const textShadowCSS = useMemo(() => {
    return state.layers
      .map(
        (l) =>
          `${l.x}px ${l.y}px ${l.blur}px ${hexToRgba(l.color, l.opacity / 100)}`
      )
      .join(',\n    ');
  }, [state.layers]);

  const fullCSS = useMemo(() => {
    return `.element {\n  text-shadow:\n    ${textShadowCSS};\n}`;
  }, [textShadowCSS]);

  // ---------- render ----------
  return (
    <div className="generator-enter">
      {/* Header */}
      <div className="generator-header">
        <h2 className="generator-title">Text Shadow Generator</h2>
        <p className="generator-subtitle">
          Craft layered text shadows with real-time preview
        </p>
      </div>

      {/* Action bar */}
      <div className="action-bar mb-lg">
        <UndoRedo
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
        <PresetManager
          namespace="text-shadow"
          currentState={state}
          onLoadPreset={(s) => pushState(s)}
        />
        <ShareButton generatorId="text-shadow" state={state} />
        <button className="btn btn-primary btn-sm" onClick={randomize} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Randomize
        </button>
      </div>

      {/* Main layout */}
      <div className="generator-layout">
        {/* ===== Controls (left) ===== */}
        <div className="generator-controls">
          {/* Font size */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Preview Settings</span>
            </div>
            <Slider
              label="Font Size"
              value={state.fontSize}
              onChange={(v) => updateState({ fontSize: v })}
              min={12}
              max={120}
              unit="px"
            />
          </div>

          {/* Shadow layers */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                Shadow Layers ({state.layers.length}/{MAX_LAYERS})
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={addLayer}
                disabled={state.layers.length >= MAX_LAYERS}
              >
                + Add Layer
              </button>
            </div>

            <div className="flex flex-col gap-md">
              {state.layers.map((layer, idx) => (
                <div className="layer-card" key={idx}>
                  <div className="layer-header">
                    <span className="layer-title">Layer {idx + 1}</span>
                    {state.layers.length > 1 && (
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => removeLayer(idx)}
                        title="Remove layer"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-md">
                    <Slider
                      label="Horizontal Offset (X)"
                      value={layer.x}
                      onChange={(v) => updateLayer(idx, 'x', v)}
                      min={-50}
                      max={50}
                      unit="px"
                    />
                    <Slider
                      label="Vertical Offset (Y)"
                      value={layer.y}
                      onChange={(v) => updateLayer(idx, 'y', v)}
                      min={-50}
                      max={50}
                      unit="px"
                    />
                    <Slider
                      label="Blur Radius"
                      value={layer.blur}
                      onChange={(v) => updateLayer(idx, 'blur', v)}
                      min={0}
                      max={50}
                      unit="px"
                    />
                    <Slider
                      label="Opacity"
                      value={layer.opacity}
                      onChange={(v) => updateLayer(idx, 'opacity', v)}
                      min={0}
                      max={100}
                      unit="%"
                    />
                    <ColorPicker
                      label="Shadow Color"
                      color={layer.color}
                      onChange={(v) => updateLayer(idx, 'color', v)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Preview + Code (right) ===== */}
        <div className="generator-preview-panel">
          {/* Live preview */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Live Preview</span>
            </div>
            <div
              className="preview-area"
              style={{
                minHeight: 240,
                padding: 'var(--space-xl)',
                background: 'var(--bg-secondary)',
                flexDirection: 'column'
              }}
            >
              <div
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                onBlur={(e) => {
                  const text = e.currentTarget.textContent || '';
                  if (text !== state.sampleText) {
                    updateState({ sampleText: text });
                  }
                }}
                style={{
                  fontSize: `${state.fontSize}px`,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  textShadow: textShadowCSS,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'text',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  maxWidth: '100%',
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'text-shadow var(--transition-base)'
                }}
              >
                {state.sampleText}
              </div>
              <p
                className="text-xs text-muted mt-md"
                style={{ userSelect: 'none' }}
              >
                Click to edit text
              </p>
            </div>
          </div>

          {/* Code output */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Generated CSS</span>
            </div>
            <CodeOutput
              css={`\n    ${textShadowCSS}`}
              property="text-shadow"
              fullCSS={fullCSS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
