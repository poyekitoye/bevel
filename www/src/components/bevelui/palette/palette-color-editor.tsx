import * as React from "react";
import { usePalette } from "./palette-context";
import {
  hexToHsv,
  hsvToHex,
  normalizeHex,
  toHslString,
  toRgbString,
} from "./palette-utils";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SatValPickerProps {
  hue: number;
  sat: number;
  val: number;
  onChange: (s: number, v: number) => void;
}

function SatValPicker({ hue, sat, val, onChange }: SatValPickerProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  function read(e: React.PointerEvent) {
    const rect = ref.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    onChange(Math.round(x * 100), Math.round((1 - y) * 100));
  }

  return (
    <div
      ref={ref}
      className="relative w-full h-36 rounded-lg cursor-crosshair select-none overflow-hidden"
      style={{
        background: `
          linear-gradient(to top, #000, transparent),
          linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
        `,
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        read(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) read(e);
      }}
    >
      <div
        className="absolute w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${sat}%`,
          top: `${100 - val}%`,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

function HueSlider({
  hue,
  onChange,
}: {
  hue: number;
  onChange: (h: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  function read(e: React.PointerEvent) {
    const rect = ref.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(Math.round(x * 360));
  }

  return (
    <div
      ref={ref}
      className="relative h-3 rounded-full cursor-pointer select-none"
      style={{
        background:
          "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        read(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) read(e);
      }}
    >
      <div
        className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${(hue / 360) * 100}%`,
          background: `hsl(${hue}, 100%, 50%)`,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

export function PaletteColorEditor() {
  const { colors, editingId, update, stopEdit } = usePalette();
  const color = colors.find((c) => c.id === editingId);

  const [hsv, setHsv] = React.useState<[number, number, number]>(() =>
    color ? hexToHsv(color.hex) : [0, 0, 100],
  );
  const [hexInput, setHexInput] = React.useState(color?.hex ?? "#ffffff");
  const [nameInput, setNameInput] = React.useState(color?.name ?? "");

  React.useEffect(() => {
    if (!color) return;
    setHsv(hexToHsv(color.hex));
    setHexInput(color.hex);
    setNameInput(color.name ?? "");
  }, [editingId]);

  const [h, s, v] = hsv;
  const previewHex = hsvToHex(h, s, v);

  function applyHsv(next: [number, number, number]) {
    setHsv(next);
    const hex = hsvToHex(...next);
    setHexInput(hex);
    update(editingId!, { hex });
  }

  function handleHexInput(raw: string) {
    setHexInput(raw);
    const norm = normalizeHex(raw);
    if (norm) {
      setHsv(hexToHsv(norm));
      update(editingId!, { hex: norm });
    }
  }

  function handleName(name: string) {
    setNameInput(name);
    update(editingId!, { name: name || undefined });
  }

  return (
    <Popover open={!!color || !!editingId} onOpenChange={stopEdit}>
      <PopoverTrigger />
      <PopoverContent align="start">
        <div className="flex flex-col gap-4 ">
          <div className="flex items-center justify-between">
            <span>Edit color</span>
          </div>

          <SatValPicker
            hue={h}
            sat={s}
            val={v}
            onChange={(ns, nv) => applyHsv([h, ns, nv])}
          />

          <HueSlider hue={h} onChange={(nh) => applyHsv([nh, s, v])} />

          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-md border border-border shrink-0"
              style={{ backgroundColor: previewHex }}
            />
            <Input
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              className={cn(
                "flex-1 h-9 px-2 rounded-md bg-muted/50 border border-border",
                "text-bui-sm  text-foreground outline-none",
                "focus:ring-1 focus:ring-primary transition",
              )}
              spellCheck={false}
              aria-label="Hex value"
            />
          </div>

          <Input
            value={nameInput}
            onChange={(e) => handleName(e.target.value)}
            placeholder="Color name (optional)"
            className={cn(
              "h-9 px-2 rounded-md bg-muted/50 border border-border",
              "text-bui-sm text-foreground outline-none placeholder:text-muted-foreground/40",
              "focus:ring-1 focus:ring-primary transition",
            )}
          />

          <div className="flex flex-col gap-1.5 pt-1 border-t border-border/60">
            {[
              { label: "HEX", value: previewHex },
              { label: "HSL", value: toHslString(previewHex) },
              { label: "RGB", value: toRgbString(previewHex) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-xs   w-8 shrink-0">{label}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(value)}
                  className="relative text-xs  hover:text-foreground text-right truncate transition-all p-1 px-2 rounded-full border border-border ease-out z-0"
                  title={`Copy ${value}`}
                >
                  <div
                    style={{ backgroundColor: value }}
                    className=" absolute inset-0 opacity-20 -z-1"
                  />
                  {value}
                </button>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

PaletteColorEditor.displayName = "PaletteColorEditor";
