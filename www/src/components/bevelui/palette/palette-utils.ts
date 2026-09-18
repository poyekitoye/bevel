import { ExportFormat, PaletteColor } from "./types";

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

export function rgbToHsv(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [
    Math.round(h * 360),
    Math.round(max === 0 ? 0 : (d / max) * 100),
    Math.round(max * 100),
  ];
}

export function hsvToRgb(
  h: number,
  s: number,
  v: number,
): [number, number, number] {
  s /= 100;
  v /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) =>
    v * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return [
    Math.round(f(5) * 255),
    Math.round(f(3) * 255),
    Math.round(f(1) * 255),
  ];
}

export function hexToHsv(hex: string): [number, number, number] {
  return rgbToHsv(...hexToRgb(hex));
}

export function hsvToHex(h: number, s: number, v: number): string {
  return rgbToHex(...hsvToRgb(h, s, v));
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255) as [
    number,
    number,
    number,
  ];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Re-exported from the shared colour helper so the palette and every other
// system that paints text over a caller-supplied colour agree on one WCAG
// contrast calculation — this module used to own a luminance approximation
// that nothing outside the palette could reach.
export { getContrastColor } from "../lib/color";

export function normalizeHex(raw: string): string | null {
  const h = raw.trim().replace(/^#/, "");
  if (h.length === 3) {
    const expanded = h
      .split("")
      .map((c) => c + c)
      .join("");
    return `#${expanded.toLowerCase()}`;
  }
  if (h.length === 6 && /^[0-9a-fA-F]{6}$/.test(h)) {
    return `#${h.toLowerCase()}`;
  }
  return null;
}

export function toHslString(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function toRgbString(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

const FILE_EXTENSIONS: Record<ExportFormat, string> = {
  "hex-array": "json",
  "hsl-array": "json",
  "css-vars": "css",
  tailwind: "js",
};

export function generateColor(
  format: ExportFormat,
  colors: PaletteColor[],
): string {
  if (colors.length === 0) return "";
  switch (format) {
    case "hex-array":
      return JSON.stringify(
        colors.map((c) => c.hex),
        null,
        2,
      );

    case "hsl-array":
      return JSON.stringify(
        colors.map((c) => {
          const [h, s, l] = hexToHsl(c.hex);
          return `hsl(${h}, ${s}%, ${l}%)`;
        }),
        null,
        2,
      );

    case "css-vars": {
      const lines = colors.map((c, i) => {
        const name = c.name
          ? c.name.toLowerCase().replace(/\s+/g, "-")
          : `color-${i + 1}`;
        return `  --color-${name}: ${c.hex};`;
      });
      return `:root {\n${lines.join("\n")}\n}`;
    }

    case "tailwind": {
      const entries = colors.map((c, i) => {
        const name = c.name
          ? `"${c.name.toLowerCase().replace(/\s+/g, "-")}"`
          : `"color-${i + 1}"`;
        return `  ${name}: "${c.hex}",`;
      });
      return `// tailwind.config.js\ncolors: {\n${entries.join("\n")}\n}`;
    }
    default: {
      return "";
    }
  }
}

export function downloadColor(format: ExportFormat, colors: PaletteColor[]) {
  const text = generateColor(format, colors);
  if (!text) return;

  const ext = FILE_EXTENSIONS[format];
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `palette-${format}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}
