"use client";

import * as React from "react";
import { useCropper } from "./cropper-context";
import {
  computeTransform,
  applyHandleDrag,
  getHandlePositions,
  hitTest,
  type HandleId,
} from "./crop-engine";
import type { CropRegion, CanvasTransform } from "./types";
import { cn } from "@/lib/utils";

const HANDLE_SIZE = 8;

const CURSOR_MAP: Record<HandleId, string> = {
  nw: "nw-resize",
  n: "n-resize",
  ne: "ne-resize",
  e: "e-resize",
  se: "se-resize",
  s: "s-resize",
  sw: "sw-resize",
  w: "w-resize",
  move: "move",
};

interface DragState {
  handle: HandleId;
  startX: number;
  startY: number;
  startRegion: CropRegion;
}

export interface CropperCanvasProps {
  className?: string;
}

export function CropperCanvas({ className }: CropperCanvasProps) {
  const {
    src,
    imageSize,
    region,
    aspectRatio,
    config,
    setImageSize,
    setRegion,
  } = useCropper();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = React.useState<{
    w: number;
    h: number;
  } | null>(null);
  const dragRef = React.useRef<DragState | null>(null);
  const [cursor, setCursor] = React.useState("default");

  // Unique mask ID — avoid collisions with multiple instances
  const maskId = React.useId().replace(/:/g, "m");

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const transform: CanvasTransform | null =
    containerSize && imageSize
      ? computeTransform(
          containerSize.w,
          containerSize.h,
          imageSize.width,
          imageSize.height,
        )
      : null;

  const cropBox =
    region && transform
      ? {
          x: transform.offsetX + region.x * transform.scale,
          y: transform.offsetY + region.y * transform.scale,
          w: region.width * transform.scale,
          h: region.height * transform.scale,
        }
      : null;

  const imgStyle: React.CSSProperties = transform
    ? {
        position: "absolute",
        left: transform.offsetX,
        top: transform.offsetY,
        width: imageSize!.width * transform.scale,
        height: imageSize!.height * transform.scale,
        pointerEvents: "none",
        userSelect: "none",
      }
    : { position: "absolute", opacity: 0 };

  // ── Pointer handlers on SVG ────────────────────────────────────────────────

  function onSvgPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (!cropBox || !region) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const handle = hitTest(px, py, cropBox);
    if (!handle) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRegion: { ...region },
    };
    setCursor(CURSOR_MAP[handle]);
    e.preventDefault();
  }

  function onSvgPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (dragRef.current) {
      if (!imageSize || !transform) return;
      const { handle, startX, startY, startRegion } = dragRef.current;
      const dxImg = (e.clientX - startX) / transform.scale;
      const dyImg = (e.clientY - startY) / transform.scale;
      setRegion(
        applyHandleDrag(
          startRegion,
          handle,
          dxImg,
          dyImg,
          imageSize.width,
          imageSize.height,
          aspectRatio,
          config.minSize,
        ),
      );
    } else if (cropBox) {
      const rect = e.currentTarget.getBoundingClientRect();
      const handle = hitTest(
        e.clientX - rect.left,
        e.clientY - rect.top,
        cropBox,
      );
      setCursor(handle ? CURSOR_MAP[handle] : "default");
    }
  }

  function onSvgPointerUp() {
    dragRef.current = null;
    setCursor("default");
  }

  const showGrid = config.showGrid !== false;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-lg  bg-background select-none",
        "h-[420px]",
        className,
      )}
    >
      <img
        src={src}
        alt=""
        style={imgStyle}
        draggable={false}
        crossOrigin="anonymous"
        onLoad={(e) => {
          const img = e.currentTarget;
          setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        }}
      />

      {cropBox && (
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ cursor }}
          onPointerDown={onSvgPointerDown}
          onPointerMove={onSvgPointerMove}
          onPointerUp={onSvgPointerUp}
          onPointerCancel={onSvgPointerUp}
        >
          <defs>
            <mask id={maskId}>
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={cropBox.x}
                y={cropBox.y}
                width={cropBox.w}
                height={cropBox.h}
                fill="black"
              />
            </mask>
          </defs>

          {/* Shade */}
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.55)"
            mask={`url(#${maskId})`}
          />

          {/* Rule-of-thirds */}
          {showGrid && (
            <g stroke="rgba(255,255,255,0.18)" strokeWidth={0.5}>
              {[1 / 3, 2 / 3].map((t) => (
                <React.Fragment key={t}>
                  <line
                    x1={cropBox.x + cropBox.w * t}
                    y1={cropBox.y}
                    x2={cropBox.x + cropBox.w * t}
                    y2={cropBox.y + cropBox.h}
                    className="stroke-white"
                  />
                  <line
                    x1={cropBox.x}
                    y1={cropBox.y + cropBox.h * t}
                    x2={cropBox.x + cropBox.w}
                    y2={cropBox.y + cropBox.h * t}
                    className="stroke-white"
                  />
                </React.Fragment>
              ))}
            </g>
          )}

          {/* Crop border */}
          <rect
            x={cropBox.x}
            y={cropBox.y}
            width={cropBox.w}
            height={cropBox.h}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={1.5}
          />

          {/* Handles */}
          {getHandlePositions(cropBox).map(({ id, x, y }) => (
            <rect
              key={id}
              x={x - HANDLE_SIZE / 2}
              y={y - HANDLE_SIZE / 2}
              width={HANDLE_SIZE}
              height={HANDLE_SIZE}
              fill="white"
              // stroke="rgba(0,0,0,0.25)"
              className="stroke-primary fill-primary"
              strokeWidth={1}
              rx={1.5}
              style={{ pointerEvents: "none" }}
            />
          ))}
        </svg>
      )}

      {!imageSize && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-bui-xs font-mono text-muted-foreground/40">
            Loading…
          </span>
        </div>
      )}
    </div>
  );
}

CropperCanvas.displayName = "CropperCanvas";
