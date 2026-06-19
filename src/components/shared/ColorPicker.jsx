import React, { useCallback } from 'react';

export default function ColorPicker({ color, onChange, label }) {
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleHexInput = useCallback((e) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      onChange(val);
    }
  }, [onChange]);

  return (
    <div className="control-group">
      {label && <label className="control-label">{label}</label>}
      <div className="color-picker-wrapper">
        <div className="color-picker-swatch" style={{ backgroundColor: color }}>
          <input
            type="color"
            className="color-picker-native"
            value={color}
            onChange={handleChange}
          />
        </div>
        <input
          type="text"
          className="color-picker-hex"
          value={color}
          onChange={handleHexInput}
          maxLength={7}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
