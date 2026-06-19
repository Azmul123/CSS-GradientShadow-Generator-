import React, { useState, useCallback, useMemo } from 'react';
import CopyButton from './CopyButton.jsx';

export default function CodeOutput({ css, property, fullCSS, formats = true }) {
  const [format, setFormat] = useState('css');
  const [useVariable, setUseVariable] = useState(false);

  const formattedCode = useMemo(() => {
    if (fullCSS) return fullCSS;
    
    const prop = property || 'property';
    const varName = prop.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

    if (useVariable) {
      return `:root {\n  --${varName}: ${css};\n}\n\n.element {\n  ${prop}: var(--${varName});\n}`;
    }

    switch (format) {
      case 'tailwind':
        return `/* Tailwind Arbitrary Value */\nclass="[${prop}:${css.replace(/\s+/g, '_')}]"`;
      case 'scss':
        return `// SCSS Variable\n$${varName}: ${css};\n\n.element {\n  ${prop}: $${varName};\n}`;
      default:
        return `.element {\n  ${prop}: ${css};\n}`;
    }
  }, [css, property, fullCSS, format, useVariable]);

  const handleFormatChange = useCallback((f) => {
    setFormat(f);
  }, []);

  return (
    <div className="code-output-wrapper">
      <div className="code-output-header">
        {formats && (
          <div className="code-format-toggle">
            {['css', 'tailwind', 'scss'].map(f => (
              <button
                key={f}
                className={`code-format-btn ${format === f ? 'active' : ''}`}
                onClick={() => handleFormatChange(f)}
              >
                {f}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-sm">
          {formats && (
            <button
              className={`code-format-btn ${useVariable ? 'active' : ''}`}
              onClick={() => setUseVariable(v => !v)}
              title="Output as CSS Variable"
            >
              VAR
            </button>
          )}
          <CopyButton text={formattedCode} />
        </div>
      </div>
      <div className="code-output">
        <pre>{formattedCode}</pre>
      </div>
    </div>
  );
}
