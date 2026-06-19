import React, { useState, useMemo, useCallback } from 'react';
import Slider from '../shared/Slider.jsx';
import CodeOutput from '../shared/CodeOutput.jsx';
import PresetManager from '../shared/PresetManager.jsx';
import ShareButton from '../shared/ShareButton.jsx';
import { useHistory } from '../../hooks/useHistory.js';

const defaultState = {
  topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16,
  unit: 'px', linked: true, blob: null
};

export default function BorderRadiusGenerator({ initialState }) {
  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory(initialState || defaultState);

  const updateState = useCallback((updates) => {
    pushState((prev) => ({ ...prev, ...updates, blob: null }));
  }, [pushState]);

  const handleCornerChange = useCallback((corner, value) => {
    if (state.linked) {
      updateState({ topLeft: value, topRight: value, bottomRight: value, bottomLeft: value });
    } else {
      updateState({ [corner]: value });
    }
  }, [state.linked, updateState]);

  const handleUnitChange = useCallback((unit) => {
    updateState({ unit });
  }, [updateState]);

  const handleLinkedToggle = useCallback(() => {
    if (!state.linked) {
      // When enabling link, set all corners to topLeft value
      pushState((prev) => ({
        ...prev,
        linked: true,
        blob: null,
        topRight: prev.topLeft,
        bottomRight: prev.topLeft,
        bottomLeft: prev.topLeft
      }));
    } else {
      pushState((prev) => ({ ...prev, linked: false, blob: null }));
    }
  }, [state.linked, pushState]);

  const handleBlob = useCallback(() => {
    const rand = () => Math.floor(Math.random() * 61) + 20; // 20-80
    const r1 = rand(), r2 = rand(), r3 = rand(), r4 = rand();
    const blob = `${r1}% ${100 - r1}% ${r2}% ${100 - r2}% / ${r3}% ${r4}% ${100 - r4}% ${100 - r3}%`;
    pushState((prev) => ({ ...prev, blob, linked: false }));
  }, [pushState]);

  const handleRandomize = useCallback(() => {
    const max = state.unit === '%' ? 50 : 100;
    const rand = () => Math.floor(Math.random() * (max + 1));
    updateState({
      topLeft: rand(), topRight: rand(), bottomRight: rand(), bottomLeft: rand(), linked: false
    });
  }, [state.unit, updateState]);

  const handleReset = useCallback(() => {
    pushState(defaultState);
  }, [pushState]);

  const handleLoadPreset = useCallback((preset) => {
    pushState(preset);
  }, [pushState]);

  const borderRadiusCSS = useMemo(() => {
    if (state.blob) return state.blob;
    const u = state.unit;
    return `${state.topLeft}${u} ${state.topRight}${u} ${state.bottomRight}${u} ${state.bottomLeft}${u}`;
  }, [state]);

  const maxVal = state.unit === '%' ? 100 : 200;

  return (
    <div className="generator-enter">
      <div className="generator-header">
        <h2 className="generator-title">Border Radius</h2>
        <p className="generator-subtitle">Design custom corner rounding with precision controls and organic blob shapes.</p>
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
              <button className="btn btn-primary btn-sm" onClick={handleBlob} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"/><path d="M12 6a6 6 0 0 1 6 6c0 3.314-2.686 6-6 6s-6-2.686-6-6a6 6 0 0 1 6-6z"/></svg>
                Blob Shape
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleRandomize} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                Randomize
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleReset} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                Reset
              </button>
              <PresetManager namespace="border-radius" currentState={state} onLoadPreset={handleLoadPreset} />
              <ShareButton generatorId="border-radius" state={state} />
            </div>
          </div>

          {/* Unit & Link Toggles */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Options</span>
            </div>

            <div className="flex items-center justify-between gap-md mb-lg">
              <span className="control-label" style={{ marginBottom: 0 }}>Unit</span>
              <div className="toggle-group">
                <button className={`toggle-btn ${state.unit === 'px' ? 'active' : ''}`} onClick={() => handleUnitChange('px')}>px</button>
                <button className={`toggle-btn ${state.unit === '%' ? 'active' : ''}`} onClick={() => handleUnitChange('%')}>%</button>
              </div>
            </div>

            <div
              className="switch-wrapper"
              onClick={handleLinkedToggle}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLinkedToggle()}
            >
              <div className={`switch ${state.linked ? 'active' : ''}`}>
                <div className="switch-knob" />
              </div>
              <span className="switch-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Link all corners
              </span>
            </div>
          </div>

          {/* Corner Sliders */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Corners</span>
              {state.blob && <span className="badge">Blob Mode Active</span>}
            </div>

            <div className="flex flex-col gap-md">
              <Slider
                label="Top Left"
                value={state.blob ? 0 : state.topLeft}
                onChange={(v) => handleCornerChange('topLeft', v)}
                min={0}
                max={maxVal}
                unit={state.unit}
                disabled={!!state.blob}
              />
              <Slider
                label="Top Right"
                value={state.blob ? 0 : state.topRight}
                onChange={(v) => handleCornerChange('topRight', v)}
                min={0}
                max={maxVal}
                unit={state.unit}
                disabled={!!state.blob}
              />
              <Slider
                label="Bottom Right"
                value={state.blob ? 0 : state.bottomRight}
                onChange={(v) => handleCornerChange('bottomRight', v)}
                min={0}
                max={maxVal}
                unit={state.unit}
                disabled={!!state.blob}
              />
              <Slider
                label="Bottom Left"
                value={state.blob ? 0 : state.bottomLeft}
                onChange={(v) => handleCornerChange('bottomLeft', v)}
                min={0}
                max={maxVal}
                unit={state.unit}
                disabled={!!state.blob}
              />
            </div>
          </div>
        </div>

        {/* Preview & Output */}
        <div className="generator-preview-panel">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Preview</span>
              <span className="badge font-mono text-xs">{borderRadiusCSS}</span>
            </div>

            <div className="preview-area preview-checkerboard" style={{ minHeight: 280, padding: 'var(--space-xl)' }}>
              <div
                style={{
                  width: 200,
                  height: 200,
                  background: 'var(--accent-gradient)',
                  borderRadius: borderRadiusCSS,
                  transition: 'border-radius var(--transition-base)',
                  boxShadow: 'var(--accent-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Corner labels */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: '1fr 1fr',
                  padding: 12,
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600
                }}>
                  <span style={{ alignSelf: 'start', justifySelf: 'start' }}>
                    {state.blob ? '•' : `${state.topLeft}${state.unit}`}
                  </span>
                  <span style={{ alignSelf: 'start', justifySelf: 'end' }}>
                    {state.blob ? '•' : `${state.topRight}${state.unit}`}
                  </span>
                  <span style={{ alignSelf: 'end', justifySelf: 'start' }}>
                    {state.blob ? '•' : `${state.bottomLeft}${state.unit}`}
                  </span>
                  <span style={{ alignSelf: 'end', justifySelf: 'end' }}>
                    {state.blob ? '•' : `${state.bottomRight}${state.unit}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Generated CSS</span>
            </div>
            <CodeOutput css={borderRadiusCSS} property="border-radius" />
          </div>
        </div>
      </div>
    </div>
  );
}
