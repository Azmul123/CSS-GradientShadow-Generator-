import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ColorPicker from '../shared/ColorPicker.jsx';
import Slider from '../shared/Slider.jsx';
import CodeOutput from '../shared/CodeOutput.jsx';
import PresetManager from '../shared/PresetManager.jsx';
import UndoRedo from '../shared/UndoRedo.jsx';
import ShareButton from '../shared/ShareButton.jsx';
import { useHistory } from '../../hooks/useHistory.js';
import { randomHex, hexToRgba } from '../../utils/colorUtils.js';

const MAX_LAYERS = 5;

const defaultState = {
  layers: [
    { x: 5, y: 5, blur: 15, spread: 0, color: '#000000', opacity: 25, inset: false }
  ],
  shape: 'card'
};

const shapes = [
  { id: 'box', label: '◻ Box', icon: '◻' },
  { id: 'circle', label: '● Circle', icon: '●' },
  { id: 'button', label: '▬ Button', icon: '▬' },
  { id: 'card', label: '▭ Card', icon: '▭' },
];

const presetShadows = {
  'Soft Elevation': {
    layers: [
      { x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 10, inset: false },
      { x: 0, y: 10, blur: 15, spread: -3, color: '#000000', opacity: 10, inset: false },
    ],
    shape: 'card',
  },
  'Hard Shadow': {
    layers: [
      { x: 8, y: 8, blur: 0, spread: 0, color: '#000000', opacity: 100, inset: false },
    ],
    shape: 'box',
  },
  'Warm Glow': {
    layers: [
      { x: 0, y: 0, blur: 10, spread: 0, color: '#e8823f', opacity: 80, inset: false },
      { x: 0, y: 0, blur: 40, spread: 0, color: '#e8823f', opacity: 40, inset: false },
      { x: 0, y: 0, blur: 80, spread: 0, color: '#c0392b', opacity: 25, inset: false },
    ],
    shape: 'box',
  },
  'Neumorphism': {
    layers: [
      { x: 6, y: 6, blur: 12, spread: 0, color: '#000000', opacity: 15, inset: false },
      { x: -6, y: -6, blur: 12, spread: 0, color: '#ffffff', opacity: 8, inset: false },
    ],
    shape: 'card',
  },
  'Inner Well': {
    layers: [
      { x: 0, y: 2, blur: 8, spread: 0, color: '#000000', opacity: 30, inset: true },
      { x: 0, y: -2, blur: 4, spread: 0, color: '#ffffff', opacity: 5, inset: true },
    ],
    shape: 'box',
  },
};

export default function BoxShadowGenerator({ initialState }) {
  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory(
    initialState || defaultState
  );

  const [collapsedLayers, setCollapsedLayers] = useState({});

  // ---- Shadow CSS generation ----
  const shadowCSS = useMemo(() => {
    return state.layers.map(l => {
      const inset = l.inset ? 'inset ' : '';
      return `${inset}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity / 100)}`;
    }).join(',\n    ');
  }, [state.layers]);

  const fullCSS = useMemo(() => {
    return `.element {\n  box-shadow:\n    ${shadowCSS};\n}`;
  }, [shadowCSS]);

  // ---- Layer CRUD handlers ----
  const updateLayer = useCallback((index, key, value) => {
    pushState(prev => ({
      ...prev,
      layers: prev.layers.map((l, i) =>
        i === index ? { ...l, [key]: value } : l
      ),
    }));
  }, [pushState]);

  const addLayer = useCallback(() => {
    pushState(prev => {
      if (prev.layers.length >= MAX_LAYERS) return prev;
      return {
        ...prev,
        layers: [
          ...prev.layers,
          { x: 0, y: 4, blur: 10, spread: 0, color: randomHex(), opacity: 30, inset: false },
        ],
      };
    });
  }, [pushState]);

  const removeLayer = useCallback((index) => {
    pushState(prev => {
      if (prev.layers.length <= 1) return prev;
      return {
        ...prev,
        layers: prev.layers.filter((_, i) => i !== index),
      };
    });
  }, [pushState]);

  const duplicateLayer = useCallback((index) => {
    pushState(prev => {
      if (prev.layers.length >= MAX_LAYERS) return prev;
      const dup = { ...prev.layers[index] };
      const newLayers = [...prev.layers];
      newLayers.splice(index + 1, 0, dup);
      return { ...prev, layers: newLayers };
    });
  }, [pushState]);

  const moveLayer = useCallback((index, direction) => {
    pushState(prev => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.layers.length) return prev;
      const newLayers = [...prev.layers];
      [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
      return { ...prev, layers: newLayers };
    });
  }, [pushState]);

  // ---- Shape handler ----
  const setShape = useCallback((shape) => {
    pushState(prev => ({ ...prev, shape }));
  }, [pushState]);

  // ---- Toggle collapse ----
  const toggleCollapse = useCallback((index) => {
    setCollapsedLayers(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  // ---- Randomize ----
  const randomize = useCallback(() => {
    const layerCount = Math.floor(Math.random() * 3) + 1;
    const layers = Array.from({ length: layerCount }, () => ({
      x: Math.floor(Math.random() * 40) - 20,
      y: Math.floor(Math.random() * 40) - 20,
      blur: Math.floor(Math.random() * 60),
      spread: Math.floor(Math.random() * 20) - 10,
      color: randomHex(),
      opacity: Math.floor(Math.random() * 60) + 10,
      inset: Math.random() > 0.75,
    }));
    pushState(prev => ({ ...prev, layers }));
  }, [pushState]);

  // ---- Preset load ----
  const handleLoadPreset = useCallback((presetState) => {
    pushState(presetState);
  }, [pushState]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // ---- Preview shape styles ----
  const previewShapeStyle = useMemo(() => {
    const base = {
      boxShadow: shadowCSS,
      background: 'var(--bg-card)',
      transition: 'box-shadow var(--transition-base)',
    };

    switch (state.shape) {
      case 'box':
        return { ...base, width: 150, height: 150, borderRadius: 'var(--radius-md)' };
      case 'circle':
        return { ...base, width: 150, height: 150, borderRadius: '50%' };
      case 'button':
        return {
          ...base,
          padding: '16px 32px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.95rem',
          fontWeight: 600,
          fontFamily: 'var(--font-primary)',
          color: '#fff',
          background: 'var(--accent-gradient)',
          border: 'none',
          cursor: 'pointer',
        };
      case 'card':
      default:
        return {
          ...base,
          width: 200,
          minHeight: 140,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
        };
    }
  }, [state.shape, shadowCSS]);

  // ---- Inline styles (scoped) ----
  const styles = useMemo(() => ({
    previewContainer: {
      minHeight: 280,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-card)',
      padding: 'var(--space-2xl)',
      transition: 'background var(--transition-base), border-color var(--transition-base)',
    },
    cardContentTitle: {
      width: '60%',
      height: 10,
      borderRadius: 4,
      background: 'var(--text-tertiary)',
      opacity: 0.5,
    },
    cardContentLine1: {
      width: '90%',
      height: 6,
      borderRadius: 3,
      background: 'var(--text-tertiary)',
      opacity: 0.25,
    },
    cardContentLine2: {
      width: '70%',
      height: 6,
      borderRadius: 3,
      background: 'var(--text-tertiary)',
      opacity: 0.25,
    },
    layerControls: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-md)',
      paddingTop: 'var(--space-md)',
    },
    layerHeaderActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-xs)',
    },
    layerNumber: {
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: 'var(--accent-gradient)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.7rem',
      fontWeight: 700,
      flexShrink: 0,
    },
    layerTitleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      cursor: 'pointer',
      flex: 1,
    },
    layerPreviewDot: {
      width: 16,
      height: 16,
      borderRadius: 4,
      flexShrink: 0,
      border: '1px solid var(--border-input)',
    },
    insetRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
    },
    addLayerBtn: {
      border: '2px dashed var(--border-input)',
      background: 'transparent',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-md)',
      color: 'var(--text-tertiary)',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: 600,
      fontFamily: 'var(--font-primary)',
      transition: 'all var(--transition-fast)',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-sm)',
      minHeight: 48,
    },
    layerCount: {
      fontSize: '0.75rem',
      color: 'var(--text-tertiary)',
      fontWeight: 500,
    },
  }), []);

  return (
    <div className="generator-enter">
      {/* Header */}
      <div className="generator-header">
        <h1 className="generator-title">Box Shadow Generator</h1>
        <p className="generator-subtitle">
          Create beautiful layered box shadows with live preview
        </p>
      </div>

      {/* Action Bar */}
      <div className="action-bar mb-lg">
        <UndoRedo canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} />
        <PresetManager
          namespace="box-shadow"
          currentState={state}
          onLoadPreset={handleLoadPreset}
        />
        <ShareButton generatorId="box-shadow" state={state} />
        <button className="btn btn-secondary btn-sm" onClick={randomize} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Randomize
        </button>
      </div>

      {/* Main Layout */}
      <div className="generator-layout">
        {/* Controls Panel */}
        <div className="generator-controls">
          {/* Shadow Layers */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Shadow Layers</span>
              <span style={styles.layerCount}>
                {state.layers.length} / {MAX_LAYERS}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {state.layers.map((layer, index) => {
                const isCollapsed = collapsedLayers[index];
                const shadowPreview = `${layer.inset ? 'inset ' : ''}${layer.x}px ${layer.y}px ${layer.blur}px ${hexToRgba(layer.color, layer.opacity / 100)}`;

                return (
                  <div key={index} className="layer-card">
                    {/* Layer Header */}
                    <div className="layer-header" style={{ marginBottom: isCollapsed ? 0 : undefined }}>
                      <div
                        style={styles.layerTitleRow}
                        onClick={() => toggleCollapse(index)}
                      >
                        <span style={styles.layerNumber}>{index + 1}</span>
                        <span
                          style={{
                            ...styles.layerPreviewDot,
                            boxShadow: shadowPreview,
                            background: 'var(--bg-card)',
                          }}
                        />
                        <span className="layer-title">
                          {layer.inset ? 'Inset' : 'Shadow'} {index + 1}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                          {isCollapsed ? '▸' : '▾'}
                        </span>
                      </div>

                      <div style={styles.layerHeaderActions}>
                        {/* Move up */}
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => moveLayer(index, -1)}
                          disabled={index === 0}
                          title="Move up"
                          style={{ fontSize: '0.75rem' }}
                        >
                          ▲
                        </button>
                        {/* Move down */}
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => moveLayer(index, 1)}
                          disabled={index === state.layers.length - 1}
                          title="Move down"
                          style={{ fontSize: '0.75rem' }}
                        >
                          ▼
                        </button>
                        {/* Duplicate */}
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => duplicateLayer(index)}
                          disabled={state.layers.length >= MAX_LAYERS}
                          title="Duplicate layer"
                          style={{ fontSize: '0.75rem' }}
                        >
                          ⧉
                        </button>
                        {/* Delete */}
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => removeLayer(index)}
                          disabled={state.layers.length <= 1}
                          title="Remove layer"
                          style={{ fontSize: '0.75rem' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Layer Controls (collapsible) */}
                    {!isCollapsed && (
                      <div style={styles.layerControls}>
                        <Slider
                          label="Horizontal Offset"
                          value={layer.x}
                          onChange={(v) => updateLayer(index, 'x', v)}
                          min={-50}
                          max={50}
                          unit="px"
                        />
                        <Slider
                          label="Vertical Offset"
                          value={layer.y}
                          onChange={(v) => updateLayer(index, 'y', v)}
                          min={-50}
                          max={50}
                          unit="px"
                        />
                        <Slider
                          label="Blur Radius"
                          value={layer.blur}
                          onChange={(v) => updateLayer(index, 'blur', v)}
                          min={0}
                          max={100}
                          unit="px"
                        />
                        <Slider
                          label="Spread"
                          value={layer.spread}
                          onChange={(v) => updateLayer(index, 'spread', v)}
                          min={-50}
                          max={50}
                          unit="px"
                        />

                        <ColorPicker
                          label="Shadow Color"
                          color={layer.color}
                          onChange={(v) => updateLayer(index, 'color', v)}
                        />

                        <Slider
                          label="Opacity"
                          value={layer.opacity}
                          onChange={(v) => updateLayer(index, 'opacity', v)}
                          min={0}
                          max={100}
                          unit="%"
                        />

                        {/* Inset Toggle */}
                        <div style={styles.insetRow}>
                          <div
                            className={`switch ${layer.inset ? 'active' : ''}`}
                            onClick={() => updateLayer(index, 'inset', !layer.inset)}
                          >
                            <div className="switch-knob" />
                          </div>
                          <span className="switch-label">Inset Shadow</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Layer Button */}
              {state.layers.length < MAX_LAYERS && (
                <button
                  style={styles.addLayerBtn}
                  onClick={addLayer}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-input)';
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }}
                >
                  ＋ Add Shadow Layer
                </button>
              )}
            </div>
          </div>

          {/* Built-in Presets */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Quick Presets</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              {Object.entries(presetShadows).map(([name, preset]) => (
                <button
                  key={name}
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleLoadPreset(preset)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview + Code Panel */}
        <div className="generator-preview-panel">
          {/* Shape Switcher */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Preview Shape</span>
            </div>
            <div className="toggle-group">
              {shapes.map(s => (
                <button
                  key={s.id}
                  className={`toggle-btn ${state.shape === s.id ? 'active' : ''}`}
                  onClick={() => setShape(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Live Preview</span>
              <span className="badge">
                {state.layers.length} layer{state.layers.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={styles.previewContainer}>
              {state.shape === 'button' ? (
                <button style={previewShapeStyle}>
                  Button
                </button>
              ) : state.shape === 'card' ? (
                <div style={previewShapeStyle}>
                  <div style={styles.cardContentTitle} />
                  <div style={{ ...styles.cardContentLine1, marginTop: 'var(--space-sm)' }} />
                  <div style={styles.cardContentLine2} />
                </div>
              ) : (
                <div style={previewShapeStyle} />
              )}
            </div>
          </div>

          {/* Code Output */}
          <CodeOutput
            css={shadowCSS}
            property="box-shadow"
            fullCSS={fullCSS}
          />
        </div>
      </div>
    </div>
  );
}
