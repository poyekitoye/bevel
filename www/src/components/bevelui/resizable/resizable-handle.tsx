"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useResizable } from "./resizable-context";

export interface ResizableHandleProps {
  /** Which gap this handle controls: between panel[index] and panel[index+1]. */
  index: number;
  className?: string;
  /** Percentage moved per arrow key press. */
  keyboardStep?: number;
  "aria-label"?: string;
}

export function ResizableHandle({
  index,
  className,
  keyboardStep = 2,
  "aria-label": ariaLabel,
}: ResizableHandleProps) {
  const {
    sizes,
    direction,
    containerRef,
    setSizeDirect,
    commitSizes,
    beginDrag,
    endDrag,
    panelConfigs,
  } = useResizable();

  const drag = React.useRef<{
    pointerId: number;
    startPointer: number;
    startA: number;
    startB: number;
    containerSize: number;
  } | null>(null);

  const isHorizontal = direction === "horizontal";

  const minA = panelConfigs[index]?.minSize ?? 5;
  const minB = panelConfigs[index + 1]?.minSize ?? 5;
  const maxA = panelConfigs[index]?.maxSize ?? 95;
  const maxB = panelConfigs[index + 1]?.maxSize ?? 95;

  /** Shared clamp so the drag preview and the committed value cannot diverge. */
  const resolve = React.useCallback(
    (startA: number, startB: number, deltaPercent: number) => {
      const total = startA + startB;
      let a = Math.max(minA, Math.min(maxA, startA + deltaPercent));
      let b = total - a;

      if (b < minB) {
        b = minB;
        a = total - b;
      } else if (b > maxB) {
        b = maxB;
        a = total - b;
      }

      return [a, b] as const;
    },
    [minA, maxA, minB, maxB],
  );

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const container = containerRef.current;
    if (!container) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = container.getBoundingClientRect();
    drag.current = {
      pointerId: e.pointerId,
      startPointer: isHorizontal ? e.clientX : e.clientY,
      startA: sizes[index],
      startB: sizes[index + 1],
      containerSize: isHorizontal ? rect.width : rect.height,
    };

    // Tells the root to stop mirroring React state into the CSS vars, so an
    // unrelated re-render mid-gesture can no longer snap the panels back.
    beginDrag();
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    // Pointer capture already guarantees this element owns the gesture, so
    // there is no need for the original's `e.buttons !== 1` guard, which
    // broke touch and pen input.
    if (!state || state.pointerId !== e.pointerId) return;

    const pointer = isHorizontal ? e.clientX : e.clientY;
    const delta = ((pointer - state.startPointer) / state.containerSize) * 100;
    const [a, b] = resolve(state.startA, state.startB, delta);

    setSizeDirect(index, a);
    setSizeDirect(index + 1, b);
  }

  function finishDrag(e: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state || state.pointerId !== e.pointerId) return;

    const pointer = isHorizontal ? e.clientX : e.clientY;
    const delta = ((pointer - state.startPointer) / state.containerSize) * 100;
    const [a, b] = resolve(state.startA, state.startB, delta);

    const next = [...sizes];
    next[index] = a;
    next[index + 1] = b;

    drag.current = null;
    endDrag();
    commitSizes(next);
  }

  /** Arrow keys move the divider — a separator with no keyboard path is not
      operable, whatever role it claims. */
  function onKeyDown(e: React.KeyboardEvent) {
    const forward = isHorizontal ? "ArrowRight" : "ArrowDown";
    const backward = isHorizontal ? "ArrowLeft" : "ArrowUp";

    let delta = 0;
    if (e.key === forward) delta = keyboardStep;
    else if (e.key === backward) delta = -keyboardStep;
    else if (e.key === "Home") delta = -100;
    else if (e.key === "End") delta = 100;
    else return;

    e.preventDefault();
    const [a, b] = resolve(sizes[index], sizes[index + 1], delta);
    const next = [...sizes];
    next[index] = a;
    next[index + 1] = b;
    commitSizes(next);
  }

  const value = Math.round(sizes[index] ?? 0);

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={isHorizontal ? "vertical" : "horizontal"}
      aria-valuenow={value}
      aria-valuemin={Math.round(minA)}
      aria-valuemax={Math.round(maxA)}
      aria-label={ariaLabel ?? `Resize panel ${index + 1}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishDrag}
      // Without this, an interrupted gesture (alt-tab, browser back-swipe)
      // left the drag state armed and the size never committed.
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
      onKeyDown={onKeyDown}
      className={cn(
        "group relative flex shrink-0 select-none items-center justify-center",
        "bg-transparent transition-colors duration-100",
        "hover:bg-primary/30 active:bg-primary/60",
        "focus-visible:outline-none focus-visible:bg-primary/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
        // The original applied cursor-col-resize unconditionally *and* again
        // per-direction, so a vertical handle carried both cursors at once.
        isHorizontal
          ? "hit-target-x w-1 cursor-col-resize"
          : "hit-target-y h-1 cursor-row-resize",
        className,
      )}
    >
      {/* Grip dots. Faintly visible at rest — a 4px transparent strip with
          hover-only dots gave no hint that the divider could be dragged. */}
      <div
        aria-hidden
        className={cn(
          "flex gap-0.5 opacity-40 transition-opacity",
          "group-hover:opacity-100 group-focus-visible:opacity-100",
          isHorizontal ? "flex-col" : "flex-row",
        )}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className="size-[3px] rounded-full bg-muted-foreground/60"
          />
        ))}
      </div>
    </div>
  );
}

ResizableHandle.displayName = "ResizableHandle";
