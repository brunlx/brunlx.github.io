export const SKIN_BASE = '#edb88c';
export const SKIN_TANNED = '#c9956a';

export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

export function lerpColor(c1, c2, t) {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const t2 = Math.max(0, Math.min(1, t));
  return rgbToHex(r1 + (r2 - r1) * t2, g1 + (g2 - g1) * t2, b1 + (b2 - b1) * t2);
}

export function darken(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

export function lighten(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

export function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}

/** @param {CanvasRenderingContext2D} ctx */
export function ensureRoundRect(ctx) {
  if (CanvasRenderingContext2D.prototype.roundRect) return;

  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (typeof r === 'number') r = [r];
    const radii = r.map((v) => Math.min(v, Math.min(w, h) / 2));
    const tl = radii[0] || 0;
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tl, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tl);
    this.lineTo(x + w, y + h - tl);
    this.quadraticCurveTo(x + w, y + h, x + w - tl, y + h);
    this.lineTo(x + tl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - tl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
  };
}
