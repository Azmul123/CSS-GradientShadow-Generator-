import React, { useState, useMemo, useCallback } from 'react';
import Slider from '../shared/Slider.jsx';
import CodeOutput from '../shared/CodeOutput.jsx';
import PresetManager from '../shared/PresetManager.jsx';
import ShareButton from '../shared/ShareButton.jsx';
import { useHistory } from '../../hooks/useHistory.js';

const defaultState = {
  blur: 0, brightness: 100, contrast: 100, saturate: 100,
  hueRotate: 0, grayscale: 0, sepia: 0, invert: 0, opacity: 100
};

const filterConfig = [
  { key: 'blur', label: 'Blur', min: 0, max: 20, unit: 'px', step: 0.5, defaultVal: 0, cssFn: (v) => `blur(${v}px)` },
  { key: 'brightness', label: 'Brightness', min: 0, max: 200, unit: '%', step: 1, defaultVal: 100, cssFn: (v) => `brightness(${v}%)` },
  { key: 'contrast', label: 'Contrast', min: 0, max: 200, unit: '%', step: 1, defaultVal: 100, cssFn: (v) => `contrast(${v}%)` },
  { key: 'saturate', label: 'Saturate', min: 0, max: 200, unit: '%', step: 1, defaultVal: 100, cssFn: (v) => `saturate(${v}%)` },
  { key: 'hueRotate', label: 'Hue Rotate', min: 0, max: 360, unit: '°', step: 1, defaultVal: 0, cssFn: (v) => `hue-rotate(${v}deg)` },
  { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, unit: '%', step: 1, defaultVal: 0, cssFn: (v) => `grayscale(${v}%)` },
  { key: 'sepia', label: 'Sepia', min: 0, max: 100, unit: '%', step: 1, defaultVal: 0, cssFn: (v) => `sepia(${v}%)` },
  { key: 'invert', label: 'Invert', min: 0, max: 100, unit: '%', step: 1, defaultVal: 0, cssFn: (v) => `invert(${v}%)` },
  { key: 'opacity', label: 'Opacity', min: 0, max: 100, unit: '%', step: 1, defaultVal: 100, cssFn: (v) => `opacity(${v}%)` },
];

export default function FilterGenerator({ initialState }) {
  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory(initialState || defaultState);

  const updateState = useCallback((updates) => {
    pushState((prev) => ({ ...prev, ...updates }));
  }, [pushState]);

  const handleFilterChange = useCallback((key, value) => {
    updateState({ [key]: value });
  }, [updateState]);

  const handleResetFilter = useCallback((key) => {
    updateState({ [key]: defaultState[key] });
  }, [updateState]);

  const handleResetAll = useCallback(() => {
    pushState(defaultState);
  }, [pushState]);

  const handleRandomize = useCallback(() => {
    const rand = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;
    pushState({
      blur: rand(0, 10),
      brightness: rand(50, 180),
      contrast: rand(50, 180),
      saturate: rand(0, 200),
      hueRotate: Math.floor(Math.random() * 361),
      grayscale: Math.floor(Math.random() * 101),
      sepia: Math.floor(Math.random() * 101),
      invert: Math.floor(Math.random() * 101),
      opacity: rand(40, 100)
    });
  }, [pushState]);

  const handleLoadPreset = useCallback((preset) => {
    pushState(preset);
  }, [pushState]);

  // Build filter CSS from non-default values
  const filterCSS = useMemo(() => {
    const parts = filterConfig
      .filter((cfg) => state[cfg.key] !== cfg.defaultVal)
      .map((cfg) => cfg.cssFn(state[cfg.key]));
    return parts.length > 0 ? parts.join(' ') : 'none';
  }, [state]);

  // Count active (non-default) filters
  const activeCount = useMemo(() => {
    return filterConfig.filter((cfg) => state[cfg.key] !== cfg.defaultVal).length;
  }, [state]);

  return (
    <div className="generator-enter">
      <div className="generator-header">
        <h2 className="generator-title">CSS Filters</h2>
        <p className="generator-subtitle">Apply visual effects like blur, brightness, contrast, and more with real-time preview.</p>
      </div>

      <div className="generator-layout">
        {/* Controls */}
        <div className="generator-controls">
          {/* Action Bar */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Actions</span>
              <div className="action-bar">
                <button className="btn btn-secondary btn-sm" onClick={undo} disabled={!canUndo} title="Undo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
                  Undo
                </button>
                <button className="btn btn-secondary btn-sm" onClick={redo} disabled={!canRedo} title="Redo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
                  Redo
                </button>
              </div>
            </div>
            <div className="action-bar">
              <button className="btn btn-secondary btn-sm" onClick={handleRandomize} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                Randomize
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleResetAll} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                Reset All
              </button>
              <PresetManager namespace="filter" currentState={state} onLoadPreset={handleLoadPreset} />
              <ShareButton generatorId="filter" state={state} />
            </div>
          </div>

          {/* Filter Sliders */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Filters</span>
              {activeCount > 0 && <span className="badge">{activeCount} active</span>}
            </div>

            <div className="flex flex-col gap-md">
              {filterConfig.map((cfg) => {
                const isModified = state[cfg.key] !== cfg.defaultVal;
                return (
                  <div key={cfg.key} style={{ position: 'relative' }}>
                    <div className="flex items-center gap-sm">
                      <div style={{ flex: 1 }}>
                        <Slider
                          label={cfg.label}
                          value={state[cfg.key]}
                          onChange={(v) => handleFilterChange(cfg.key, v)}
                          min={cfg.min}
                          max={cfg.max}
                          step={cfg.step}
                          unit={cfg.unit}
                        />
                      </div>
                      {isModified && (
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleResetFilter(cfg.key)}
                          title={`Reset ${cfg.label}`}
                          style={{
                            flexShrink: 0,
                            alignSelf: 'flex-end',
                            marginBottom: 2,
                            fontSize: '0.85rem',
                            color: 'var(--color-error)',
                            opacity: 0.8
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preview & Output */}
        <div className="generator-preview-panel">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Preview</span>
              {activeCount > 0 && <span className="badge font-mono text-xs">{activeCount} filter{activeCount > 1 ? 's' : ''}</span>}
            </div>

            <div className="preview-area preview-checkerboard" style={{ minHeight: 300, padding: 'var(--space-xl)' }}>
              <div
                className="placeholder-image"
                style={{
                  filter: filterCSS,
                  transition: 'filter var(--transition-base)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Decorative content inside preview */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--warning) 40%, var(--danger) 70%, var(--success) 100%)',
                  opacity: 0.9
                }} />
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white', opacity: 0.9, marginBottom: '4px' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.8)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>
                    Filter Preview
                  </span>
                </div>
              </div>
            </div>

            {/* Before/After comparison hint */}
            {activeCount > 0 && (
              <div className="mt-md" style={{ textAlign: 'center' }}>
                <span className="text-xs text-muted">
                  {filterCSS !== 'none' ? `filter: ${filterCSS}` : ''}
                </span>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Generated CSS</span>
            </div>
            <CodeOutput css={filterCSS} property="filter" />
          </div>
        </div>
      </div>
    </div>
  );
}
