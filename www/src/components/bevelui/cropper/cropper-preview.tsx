"use client";

import * as React from "react";
import { useCropper } from "./cropper-context";
import { cn } from "@/lib/utils";

export interface CropperPreviewProps {
  maxSize?: number;
  className?: string;
}

export function CropperPreview({ maxSize = 140, className }: CropperPreviewProps) {
  const { src, region } = useCropper();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  // Load image once, re-draw when region changes
  React.useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { imgRef.current = img; draw(); };
    img.src = src;
  }, [src]); // eslint-disable-line

  function draw() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !region) return;
    const { x, y, width, height } = region;
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    canvas
      .getContext("2d")!
      .drawImage(img, Math.round(x), Math.round(y), Math.round(width), Math.round(height),
        0, 0, canvas.width, canvas.height);
  }

  React.useEffect(() => { draw(); }, [region]); // eslint-disable-line

  if (!region) return null;

  const aspect = region.width / region.height;
  const displayW = aspect >= 1 ? maxSize : Math.round(maxSize * aspect);
  const displayH = aspect >= 1 ? Math.round(maxSize / aspect) : maxSize;

  return (
    <div className={cn("flex flex-col gap-2 shrink-0", className)}>
      <span className="text-bui-2xs font-mono uppercase tracking-wider text-muted-foreground/50">
        Preview
      </span>
      <div
        className="rounded-lg overflow-hidden border border-border/60 bg-background"
        style={{ width: displayW, height: displayH }}
      >
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>
      <span className="text-bui-2xs font-mono text-muted-foreground/40">
        {Math.round(region.width)} × {Math.round(region.height)}px
      </span>
    </div>
  );
}

CropperPreview.displayName = "CropperPreview";