"use client";

import * as React from "react";
import { IconPencil } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { usePalette } from "./palette-context";
import { getContrastColor } from "../lib/color";

export interface PaletteSwatchProps {
  id: string;
  className?: string;
}

export function PaletteSwatch({ id, className }: PaletteSwatchProps) {
  const { colors, selectedId, editingId, select, startEdit } = usePalette();
  const color = colors.find((c) => c.id === id);
  if (!color) return null;

  const isSelected = selectedId === id;
  const isEditing = editingId === id;
  const foreground = getContrastColor(color.hex);

  return (
    <button
      type="button"
      title={color.name ? `${color.name} · ${color.hex}` : color.hex}
      aria-label={`${color.name ?? color.hex}. Press Enter to select, E to edit.`}
      aria-pressed={isSelected}
      onClick={() => select(id)}
      onDoubleClick={() => startEdit(id)}
      onKeyDown={(e) => {
        // Editing used to be double-click only, which left keyboard users able
        // to select a colour but never open it.
        if (e.key === "e" || e.key === "E" || e.key === "F2") {
          e.preventDefault();
          startEdit(id);
        }
      }}
      style={{ backgroundColor: color.hex, color: foreground }}
      className={cn(
        "group relative flex size-9 items-center justify-center rounded-sm border-2 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        isSelected
          ? "z-10 scale-110 border-primary/50 shadow-md"
          : "border-transparent hover:scale-105 hover:border-border",
        isEditing && "ring-2 ring-primary/20 ring-offset-1",
        className,
      )}
    >
      {/* getContrastColor was computed and then never used — the swatch had no
          foreground content at all. An edit affordance gives it a purpose and
          proves the contrast choice is right. */}
      <IconPencil
        size={12}
        aria-hidden
        className={cn(
          "opacity-0 transition-opacity",
          "group-hover:opacity-70 group-focus-visible:opacity-70",
          isEditing && "opacity-100",
        )}
      />
    </button>
  );
}

PaletteSwatch.displayName = "PaletteSwatch";
