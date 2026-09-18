/**
 * Colour helpers shared by every system that paints text over a colour the
 * consumer supplied. Previously `getContrastColor` lived only in palette-utils
 * while cursors, chip-select and the command palette each hardcoded
 * `text-white` over arbitrary user colours — unreadable on light values.
 */

export type RGB = [number, number, number];

/** Parses #rgb, #rrggbb, #rrggbbaa, rgb()/rgba(). Returns null if unparseable. */
export function parseColor(input: string): RGB | null {
  const value = input.trim();

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const [r, g, b] = hex.slice(0, 3).split("");
      return [
        parseInt(r + r, 16),
        parseInt(g + g, 16),
        parseInt(b + b, 16),
      ];
    }
    if (hex.length === 6 || hex.length === 8) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
    return null;
  }

  const rgb = value.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i,
  );
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }

  return null;
}

/** WCAG relative luminance (0–1). */
export function relativeLuminance([r, g, b]: RGB): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Readable foreground for an arbitrary background, chosen by WCAG contrast
 * ratio rather than a luminance guess — so mid-tone brand colours land on the
 * side that actually passes.
 */
export function getContrastColor(background: string): "#000000" | "#ffffff" {
  const rgb = parseColor(background);
  if (!rgb) return "#ffffff";

  const lum = relativeLuminance(rgb);
  const contrastWithWhite = 1.05 / (lum + 0.05);
  const contrastWithBlack = (lum + 0.05) / 0.05;

  return contrastWithBlack >= contrastWithWhite ? "#000000" : "#ffffff";
}

/** Same decision, as a Tailwind-friendly rgb() string with alpha support. */
export function contrastOverlay(background: string, alpha: number): string {
  return getContrastColor(background) === "#000000"
    ? `rgb(0 0 0 / ${alpha})`
    : `rgb(255 255 255 / ${alpha})`;
}

/** Normalises any accepted colour input to #rrggbb, or null. */
export function normalizeHex(raw: string): string | null {
  const rgb = parseColor(raw);
  if (!rgb) return null;
  return (
    "#" +
    rgb
      .map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0"))
      .join("")
  );
}
