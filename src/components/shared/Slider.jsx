import React, { useCallback } from 'react';

export default function Slider({ label, value, onChange, min = 0, max = 100, step = 1, unit = '', showValue = true }) {
  const handleSliderChange = useCallback((e) => {
    onChange(Number(e.target.value));
  }, [onChange]);

  const handleInputChange = useCallback((e) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val);
    }
  }, [onChange, min, max]);

  return (
    <div className="control-group">
      {label && (
        <label className="control-label">
          <span>{label}</span>
          {showValue && <span className="control-value">{value}{unit}</span>}
        </label>
      )}
      <div className="slider-wrapper">
        <input
          type="range"
          className="slider-input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
        />
        <input
          type="number"
          className="slider-number-input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
