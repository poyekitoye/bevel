"use client";

import * as React from "react";
import { useCropper } from "./cropper-context";
import { IconCrop, IconRefresh } from "@tabler/icons-react";
import type { AspectRatioPreset } from "./types";
import { cn } from "@/lib/utils";
import {Button} from "@/components/ui/button"
const AR_PRESETS: AspectRatioPreset[] = ["free", "1:1", "4:3", "16:9", "3:2", "9:16"];
const AR_LABELS: Record<AspectRatioPreset, string> = {
  free: "Free",
  "1:1": "1:1",
  "4:3": "4:3",
  "16:9": "16:9",
  "3:2": "3:2",
  "9:16": "9:16",
};

export interface CropperToolbarProps {
  /** Override for the Crop button's action — useful when you need custom blob handling. */
  onCrop?: (blob: Blob) => void;
  className?: string;
}

export function CropperToolbar({ onCrop, className }: CropperToolbarProps) {
  const { aspectRatioPreset, setAspectRatioPreset, crop, reset, region } = useCropper();
  const [busy, setBusy] = React.useState(false);

  async function handleCrop() {
    setBusy(true);
    try {
      const blob = await crop();
      onCrop?.(blob);
    } finally {
      setBusy(false);
    }
  }

  const dims = region
    ? `${Math.round(region.width)} × ${Math.round(region.height)}`
    : null;

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* AR presets */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-background">
        {AR_PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            onClick={() => setAspectRatioPreset(preset)}
            variant={aspectRatioPreset === preset ? 'default' : 'secondary'}
          >
            {AR_LABELS[preset]}
          </Button>
        ))}
      </div>

      {dims && (
        <span className="text-bui-xs font-mono text-muted-foreground/50">{dims}px</span>
      )}

      <div className="flex-1" />

      <Button
        type="button"
        onClick={reset}
        variant={'outline'}
      >
        <IconRefresh size={13} strokeWidth={1.8} />
        Reset
      </Button>

      <Button
        type="button"
        onClick={handleCrop}
        disabled={busy || !region}
      >
        <IconCrop size={13} strokeWidth={1.8} />
        {busy ? "Processing…" : "Crop"}
      </Button>
    </div>
  );
}

CropperToolbar.displayName = "CropperToolbar";