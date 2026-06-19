// ---- CSS STRING GENERATORS ----

export function generateGradientCSS(state) {
  const { type, colors, angle, direction } = state;
  const stops = colors.map(c => `${c.color} ${c.position}%`).join(', ');

  if (type === 'linear') {
    const dir = direction || `${angle}deg`;
    return `linear-gradient(${dir}, ${stops})`;
  }
  if (type === 'radial') {
    return `radial-gradient(circle, ${stops})`;
  }
  if (type === 'conic') {
    return `conic-gradient(from ${angle}deg, ${stops})`;
  }
  return '';
}

export function generateBoxShadowCSS(layers) {
  return layers
    .map(l => {
      const inset = l.inset ? 'inset ' : '';
      return `${inset}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px rgba(${hexToRgbNums(l.color)}, ${l.opacity / 100})`;
    })
    .join(',\n    ');
}

export function generateTextShadowCSS(layers) {
  return layers
    .map(l => `${l.x}px ${l.y}px ${l.blur}px rgba(${hexToRgbNums(l.color)}, ${l.opacity / 100})`)
    .join(',\n    ');
}

export function generateBorderRadiusCSS(state) {
  const { unit } = state;
  const u = unit || 'px';
  return `${state.topLeft}${u} ${state.topRight}${u} ${state.bottomRight}${u} ${state.bottomLeft}${u}`;
}

export function generateFilterCSS(state) {
  const parts = [];
  if (state.blur !== 0) parts.push(`blur(${state.blur}px)`);
  if (state.brightness !== 100) parts.push(`brightness(${state.brightness}%)`);
  if (state.contrast !== 100) parts.push(`contrast(${state.contrast}%)`);
  if (state.saturate !== 100) parts.push(`saturate(${state.saturate}%)`);
  if (state.hueRotate !== 0) parts.push(`hue-rotate(${state.hueRotate}deg)`);
  if (state.grayscale !== 0) parts.push(`grayscale(${state.grayscale}%)`);
  if (state.sepia !== 0) parts.push(`sepia(${state.sepia}%)`);
  if (state.invert !== 0) parts.push(`invert(${state.invert}%)`);
  if (state.opacity !== 100) parts.push(`opacity(${state.opacity}%)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
}

export function generateGlassmorphismCSS(state) {
  const { bgOpacity, blur, borderOpacity, borderRadius, tintColor } = state;
  const rgb = hexToRgbNums(tintColor);
  return {
    background: `rgba(${rgb}, ${bgOpacity / 100})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(255, 255, 255, ${borderOpacity / 100})`,
    borderRadius: `${borderRadius}px`,
  };
}

export function generateNeumorphismCSS(state) {
  const { bgColor, distance, blur, intensity, style } = state;
  const rgb = hexToRgbNums(bgColor);
  const lightShadow = `rgba(${Math.min(255, parseInt(rgb.split(', ')[0]) + intensity)}, ${Math.min(255, parseInt(rgb.split(', ')[1]) + intensity)}, ${Math.min(255, parseInt(rgb.split(', ')[2]) + intensity)}, 1)`;
  const darkShadow = `rgba(${Math.max(0, parseInt(rgb.split(', ')[0]) - intensity)}, ${Math.max(0, parseInt(rgb.split(', ')[1]) - intensity)}, ${Math.max(0, parseInt(rgb.split(', ')[2]) - intensity)}, 1)`;

  let shadow;
  switch (style) {
    case 'flat':
      shadow = `${distance}px ${distance}px ${blur}px ${darkShadow}, -${distance}px -${distance}px ${blur}px ${lightShadow}`;
      break;
    case 'concave':
      shadow = `${distance}px ${distance}px ${blur}px ${darkShadow}, -${distance}px -${distance}px ${blur}px ${lightShadow}`;
      break;
    case 'convex':
      shadow = `${distance}px ${distance}px ${blur}px ${darkShadow}, -${distance}px -${distance}px ${blur}px ${lightShadow}`;
      break;
    case 'pressed':
      shadow = `inset ${distance}px ${distance}px ${blur}px ${darkShadow}, inset -${distance}px -${distance}px ${blur}px ${lightShadow}`;
      break;
    default:
      shadow = `${distance}px ${distance}px ${blur}px ${darkShadow}, -${distance}px -${distance}px ${blur}px ${lightShadow}`;
  }
  return { background: bgColor, boxShadow: shadow };
}

function hexToRgbNums(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

// ---- FORMAT CONVERTERS ----

export function toCSSVariable(name, value) {
  return `--${name}: ${value};`;
}

export function toTailwindArbitrary(property, value) {
  const cleanValue = value.replace(/\s+/g, '_');
  const propMap = {
    'background': 'bg',
    'box-shadow': 'shadow',
    'text-shadow': '[text-shadow]',
    'border-radius': 'rounded',
    'filter': '[filter]',
    'backdrop-filter': '[backdrop-filter]',
  };
  const prefix = propMap[property] || `[${property}]`;
  return `${prefix}-[${cleanValue}]`;
}

export function toSCSSVariable(name, value) {
  return `$${name}: ${value};`;
}

export function formatCSSOutput(property, value, format = 'css', varName = '') {
  const name = varName || property.replace(/([A-Z])/g, '-$1').toLowerCase();
  switch (format) {
    case 'tailwind':
      return `/* Tailwind Arbitrary Value */\nclass="${toTailwindArbitrary(property, value)}"`;
    case 'scss':
      return `// SCSS Variable\n${toSCSSVariable(name, value)}\n\n.element {\n  ${property}: $${name};\n}`;
    case 'cssvar':
      return `/* CSS Custom Property */\n:root {\n  ${toCSSVariable(name, value)}\n}\n\n.element {\n  ${property}: var(--${name});\n}`;
    default:
      return `.element {\n  ${property}: ${value};\n}`;
  }
}
