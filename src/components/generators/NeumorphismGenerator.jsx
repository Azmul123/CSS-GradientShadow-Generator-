import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ColorPicker from '../shared/ColorPicker.jsx';
import Slider from '../shared/Slider.jsx';
import CodeOutput from '../shared/CodeOutput.jsx';
import PresetManager from '../shared/PresetManager.jsx';
import UndoRedo from '../shared/UndoRedo.jsx';
import ShareButton from '../shared/ShareButton.jsx';
import { useHistory } from '../../hooks/useHistory.js';
import { hexToRgb, rgbToHex } from '../../utils/colorUtils.js';

const defaultState = {
  bgColor: '#e0e5ec', distance: 10, blur: 20, intensity: 40, style: 'flat'
};

export default function NeumorphismGenerator({ initialState }) {
  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory(initialState || defaultState);

  const handleStateChange = useCallback((updates) => {
    pushState({ ...state, ...updates });
  }, [state, pushState]);

  const neumorphismCSS = useMemo(() => {
    const rgb = hexToRgb(state.bgColor);
    const intensity = state.intensity;
    
    const rL = Math.min(255, rgb.r + intensity);
    const gL = Math.min(255, rgb.g + intensity);
    const bL = Math.min(255, rgb.b + intensity);
    const lightShadow = `rgba(${rL}, ${gL}, ${bL}, 1)`;
    
    const rD = Math.max(0, rgb.r - intensity);
    const gD = Math.max(0, rgb.g - intensity);
    const bD = Math.max(0, rgb.b - intensity);
    const darkShadow = `rgba(${rD}, ${gD}, ${bD}, 1)`;

    let shadow;
    const dist = state.distance;
    const blur = state.blur;

    switch (state.style) {
      case 'flat':
        shadow = `${dist}px ${dist}px ${blur}px ${darkShadow}, -${dist}px -${dist}px ${blur}px ${lightShadow}`;
        break;
      case 'concave':
        shadow = `${dist}px ${dist}px ${blur}px ${darkShadow}, -${dist}px -${dist}px ${blur}px ${lightShadow}`;
        break;
      case 'convex':
        shadow = `${dist}px ${dist}px ${blur}px ${darkShadow}, -${dist}px -${dist}px ${blur}px ${lightShadow}`;
        break;
      case 'pressed':
        shadow = `inset ${dist}px ${dist}px ${blur}px ${darkShadow}, inset -${dist}px -${dist}px ${blur}px ${lightShadow}`;
        break;
      default:
        shadow = `${dist}px ${dist}px ${blur}px ${darkShadow}, -${dist}px -${dist}px ${blur}px ${lightShadow}`;
    }
    return shadow;
  }, [state]);

  const previewStyle = useMemo(() => {
    let background = state.bgColor;
    if (state.style === 'concave') {
      const rgb = hexToRgb(state.bgColor);
      const intensity = state.intensity / 2; // subtle gradient
      const rL = Math.min(255, rgb.r + intensity);
      const gL = Math.min(255, rgb.g + intensity);
      const bL = Math.min(255, rgb.b + intensity);
      const rD = Math.max(0, rgb.r - intensity);
      const gD = Math.max(0, rgb.g - intensity);
      const bD = Math.max(0, rgb.b - intensity);
      background = `linear-gradient(145deg, rgba(${rD},${gD},${bD},1), rgba(${rL},${gL},${bL},1))`;
    } else if (state.style === 'convex') {
      const rgb = hexToRgb(state.bgColor);
      const intensity = state.intensity / 2;
      const rL = Math.min(255, rgb.r + intensity);
      const gL = Math.min(255, rgb.g + intensity);
      const bL = Math.min(255, rgb.b + intensity);
      const rD = Math.max(0, rgb.r - intensity);
      const gD = Math.max(0, rgb.g - intensity);
      const bD = Math.max(0, rgb.b - intensity);
      background = `linear-gradient(145deg, rgba(${rL},${gL},${bL},1), rgba(${rD},${gD},${bD},1))`;
    }

    return {
      background,
      boxShadow: neumorphismCSS,
      borderRadius: '24px',
      width: '150px',
      height: '150px',
    };
  }, [state, neumorphismCSS]);

  const outputCSS = useMemo(() => {
    const lines = [];
    lines.push(`border-radius: 24px;`);
    lines.push(`background: ${state.bgColor};`);
    if (state.style === 'concave' || state.style === 'convex') {
      lines.push(`background: ${previewStyle.background};`);
    }
    lines.push(`box-shadow: ${neumorphismCSS};`);
    return `.element {\n  ${lines.join('\n  ')}\n}`;
  }, [state, previewStyle.background, neumorphismCSS]);

  return (
    <div>
      <div className="generator-header">
        <h2 className="generator-title">Neumorphism</h2>
        <p className="generator-subtitle">Generate soft UI / neumorphism styles.</p>
      </div>
      <div className="action-bar mb-lg">
        <UndoRedo canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} />
        <PresetManager namespace="neumorphism" currentState={state} onLoadPreset={(s) => pushState(s)} />
        <ShareButton generatorId="neumorphism" state={state} />
      </div>
      <div className="generator-layout">
        <div className="generator-controls">
          <div className="card">
            <div className="control-group mb-md">
              <label className="control-label">Style</label>
              <div className="toggle-group">
                {['flat', 'concave', 'convex', 'pressed'].map(s => (
                  <button
                    key={s}
                    className={`toggle-btn ${state.style === s ? 'active' : ''}`}
                    onClick={() => handleStateChange({ style: s })}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <ColorPicker
              label="Background Color"
              color={state.bgColor}
              onChange={(c) => handleStateChange({ bgColor: c })}
            />
            <div className="mt-md">
              <Slider
                label="Distance"
                value={state.distance}
                min={1} max={50}
                onChange={(v) => handleStateChange({ distance: v })}
                unit="px"
              />
            </div>
            <div className="mt-md">
              <Slider
                label="Blur"
                value={state.blur}
                min={0} max={100}
                onChange={(v) => handleStateChange({ blur: v })}
                unit="px"
              />
            </div>
            <div className="mt-md">
              <Slider
                label="Intensity"
                value={state.intensity}
                min={1} max={100}
                onChange={(v) => handleStateChange({ intensity: v })}
              />
            </div>
          </div>
        </div>
        <div className="generator-preview-panel">
          <div className="preview-area" style={{ background: state.bgColor, minHeight: '300px' }}>
            <div style={previewStyle}></div>
          </div>
          <CodeOutput fullCSS={outputCSS} formats={false} />
        </div>
      </div>
    </div>
  );
}
