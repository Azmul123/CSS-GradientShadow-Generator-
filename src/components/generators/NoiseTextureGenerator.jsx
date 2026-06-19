import React, { useState, useMemo, useCallback } from 'react';
import ColorPicker from '../shared/ColorPicker.jsx';
import Slider from '../shared/Slider.jsx';
import CodeOutput from '../shared/CodeOutput.jsx';
import PresetManager from '../shared/PresetManager.jsx';
import UndoRedo from '../shared/UndoRedo.jsx';
import ShareButton from '../shared/ShareButton.jsx';
import { useHistory } from '../../hooks/useHistory.js';
import { hexToRgba } from '../../utils/colorUtils.js';

const defaultState = {
  opacity: 15, size: 2, tintColor: '#000000',
  bgType: 'solid', bgColor: '#1a1a2e'
};

export default function NoiseTextureGenerator({ initialState }) {
  const { state, pushState, undo, redo, canUndo, canRedo } = useHistory(initialState || defaultState);

  const handleStateChange = useCallback((updates) => {
    pushState({ ...state, ...updates });
  }, [state, pushState]);

  const svgDataUri = useMemo(() => {
    const opacity = state.opacity / 100;
    const baseFrequency = (1 / state.size).toFixed(2);
    
    // Creating the SVG string for the noise
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="${opacity}"/><rect width="100%" height="100%" fill="${state.tintColor}" style="mix-blend-mode: color;" opacity="${opacity}"/></svg>`;
    
    // Base64 encode for data URI
    return `data:image/svg+xml;base64,${btoa(svgStr)}`;
  }, [state.opacity, state.size, state.tintColor]);

  const previewBackground = useMemo(() => {
    if (state.bgType === 'gradient') {
      return `linear-gradient(135deg, ${state.bgColor} 0%, var(--accent) 100%)`;
    }
    return state.bgColor;
  }, [state.bgType, state.bgColor]);

  const outputCSS = useMemo(() => {
    return `.element {
  position: relative;
  background: ${previewBackground};
}

.element::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("${svgDataUri}");
  pointer-events: none;
}`;
  }, [previewBackground, svgDataUri]);

  return (
    <div>
      <div className="generator-header">
        <h2 className="generator-title">Noise Texture</h2>
        <p className="generator-subtitle">Add grain and noise overlays to your designs.</p>
      </div>
      <div className="action-bar mb-lg">
        <UndoRedo canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} />
        <PresetManager namespace="noise" currentState={state} onLoadPreset={(s) => pushState(s)} />
        <ShareButton generatorId="noise-texture" state={state} />
      </div>
      <div className="generator-layout">
        <div className="generator-controls">
          <div className="card">
            <Slider
              label="Noise Opacity"
              value={state.opacity}
              min={0} max={100}
              onChange={(v) => handleStateChange({ opacity: v })}
              unit="%"
            />
            <div className="mt-md">
              <Slider
                label="Noise Size"
                value={state.size}
                min={1} max={10}
                onChange={(v) => handleStateChange({ size: v })}
              />
            </div>
            <div className="mt-md">
              <ColorPicker
                label="Noise Tint Color"
                color={state.tintColor}
                onChange={(c) => handleStateChange({ tintColor: c })}
              />
            </div>
            
            <div className="mt-lg">
              <div className="control-group mb-md">
                <label className="control-label">Background Type</label>
                <div className="toggle-group">
                  <button
                    className={`toggle-btn ${state.bgType === 'solid' ? 'active' : ''}`}
                    onClick={() => handleStateChange({ bgType: 'solid' })}
                  >
                    Solid
                  </button>
                  <button
                    className={`toggle-btn ${state.bgType === 'gradient' ? 'active' : ''}`}
                    onClick={() => handleStateChange({ bgType: 'gradient' })}
                  >
                    Gradient
                  </button>
                </div>
              </div>
              <ColorPicker
                label="Base Background Color"
                color={state.bgColor}
                onChange={(c) => handleStateChange({ bgColor: c })}
              />
            </div>
          </div>
        </div>
        <div className="generator-preview-panel">
          <div 
            className="preview-area" 
            style={{ 
              background: previewBackground,
              minHeight: '300px',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("${svgDataUri}")`,
                pointerEvents: 'none'
              }}
            ></div>
            <h3 style={{ position: 'relative', zIndex: 1, color: '#fff', fontSize: '2rem', mixBlendMode: 'difference' }}>
              Text with Noise
            </h3>
          </div>
          <CodeOutput fullCSS={outputCSS} formats={false} />
        </div>
      </div>
    </div>
  );
}
