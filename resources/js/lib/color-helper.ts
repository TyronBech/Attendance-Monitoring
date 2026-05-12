/**
 * Helper class to generate color palettes from hex values.
 * Ported from legacy PHP ColorHelper.
 */
export class ColorHelper {
  public static generatePalette(hex: string): Record<number, string> {
    const [r, g, b] = this.parseHex(hex);
    const [h, s, l0] = this.rgbToHsl(r, g, b);

    const scale: Record<number, number> = {
      50: 0.95,
      100: 0.85,
      200: 0.70,
      300: 0.50,
      400: 0.25,
      500: 0.00,
      600: -0.15,
      700: -0.30,
      800: -0.50,
      900: -0.70,
    };

    const palette: Record<number, string> = {};

    for (const [keyStr, delta] of Object.entries(scale)) {
      const key = parseInt(keyStr);
      let l = delta > 0 ? l0 + (1 - l0) * delta : l0 * (1 + delta);

      // clamp
      l = Math.max(0, Math.min(1, l));

      // Slight desaturation for extremes
      let sAdj = s;
      if (key <= 100) sAdj *= 0.8;
      else if (key >= 800) sAdj *= 0.9;

      const [rr, gg, bb] = this.hslToRgb(h, sAdj, l);
      palette[key] = `${rr} ${gg} ${bb}`;
    }

    return palette;
  }

  private static rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let l = (max + min) / 2;
    let h = 0,
      s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h, s, l];
  }

  private static hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = this.hueToRgb(p, q, h + 1 / 3);
      g = this.hueToRgb(p, q, h);
      b = this.hueToRgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  private static hueToRgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  private static parseHex(hex: string): [number, number, number] {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
  }
}
