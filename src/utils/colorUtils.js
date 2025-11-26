// Color conversion utilities
export const hexToRgba = (hex, alpha = 1) => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    return 'rgba(0, 0, 0, 1)';
  }
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const rgbaToHex = (rgba) => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
  if (!match) return '#000000';
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const isValidColor = (color) => {
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
};

export const normalizeColorInput = (input) => {
  // If it's already a valid color, return as is
  if (isValidColor(input)) {
    return input;
  }
  
  // Try to add # if missing
  if (/^[0-9A-F]{6}$/i.test(input)) {
    return `#${input}`;
  }
  
  if (/^[0-9A-F]{3}$/i.test(input)) {
    return `#${input[0]}${input[0]}${input[1]}${input[1]}${input[2]}${input[2]}`;
  }
  
  return '#000000'; // Default fallback
};