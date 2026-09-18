"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ResizableCtx } from "./resizable-context";
import { useEventCallback } from "../lib/use-controllable-state";
import type { ResizableContextValue, ResizablePanelConfig } from "./types";

export interface ResizableRootProps {
  /** Percentages. Normalised to 100 if they do not already sum to it. */
  defaultSizes: number[];
  direction?: "horizontal" | "vertical";
  panelConfigs?: ResizablePanelConfig[];
  /** Fires on commit (drag end, keyboard step, collapse). */
  onResize?: (sizes: number[]) => void;
  /** Fires on every frame during a drag. */
  onResizing?: (sizes: number[]) => void;
  children: React.ReactNode;
  className?: string;
}

/** "must sum to 100" was only ever a comment; now it is enforced. */
function normalize(sizes: number[]): number[] {
  const total = sizes.reduce((a, b) => a + b, 0);
  if (total <= 0) return sizes.map(() => 100 / Math.max(1, sizes.length));
  if (Math.abs(total - 100) < 0.01) return sizes;
  return sizes.map((s) => (s / total) * 100);
}

export function ResizableRoot({
  defaultSizes,
  direction = "horizontal",
  panelConfigs = [],
  onResize,
  onResizing,
  children,
  className,
}: ResizableRootProps) {
  const [sizes, setSizes] = React.useState<number[]>(() =>
    normalize(defaultSizes),
  );
  const [collapsed, setCollapsed] = React.useState<boolean[]>(() =>
    panelConfigs.map((c) => c.defaultCollapsed ?? false),
  );
  const [isDragging, setIsDragging] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const draggingRef = React.useRef(false);

  const emitResize = useEventCallback(onResize);
  const emitResizing = useEventCallback(onResizing);

  const writeVars = React.useCallback((next: number[]) => {
    const el = containerRef.current;
    if (!el) return;
    next.forEach((size, i) => {
      el.style.setProperty(`--panel-${i}`, `${size}%`);
    });
  }, []);

  // Mirror committed state into the CSS vars — but never mid-drag. The
  // original ran this on every `sizes` change, so any unrelated re-render
  // during a gesture snapped the panels back to their pre-drag widths.
  React.useLayoutEffect(() => {
    if (draggingRef.current) return;
    writeVars(sizes);
  }, [sizes, writeVars]);

  const setSizeDirect = React.useCallback(
    (index: number, size: number) => {
      containerRef.current?.style.setProperty(`--panel-${index}`, `${size}%`);
      emitResizing?.(
        Array.from({ length: sizes.length }, (_, i) =>
          i === index ? size : sizes[i],
        ),
      );
    },
    [emitResizing, sizes],
  );

  const beginDrag = React.useCallback(() => {
    draggingRef.current = true;
    setIsDragging(true);
  }, []);

  const endDrag = React.useCallback(() => {
    draggingRef.current = false;
    setIsDragging(false);
  }, []);

  const commitSizes = React.useCallback(
    (next: number[]) => {
      setSizes(next);
      emitResize(next);
    },
    [emitResize],
  );

  const toggleCollapse = React.useCallback(
    (panelIndex: number) => {
      if (!panelConfigs[panelIndex]?.collapsible) return;
      setCollapsed((prev) => {
        const next = [...prev];
        next[panelIndex] = !prev[panelIndex];
        return next;
      });
    },
    [panelConfigs],
  );

  const value = React.useMemo<ResizableContextValue>(
    () => ({
      sizes,
      collapsed,
      direction,
      containerRef,
      isDragging,
      setSizeDirect,
      commitSizes,
      beginDrag,
      endDrag,
      toggleCollapse,
      panelConfigs,
    }),
    [
      sizes,
      collapsed,
      direction,
      isDragging,
      setSizeDirect,
      commitSizes,
      beginDrag,
      endDrag,
      toggleCollapse,
      panelConfigs,
    ],
  );

  return (
    <ResizableCtx.Provider value={value}>
      <div
        ref={containerRef}
        className={cn(
          "flex overflow-hidden",
          direction === "horizontal" ? "flex-row" : "flex-col",
          // Keeps text from being selected across panels mid-drag.
          isDragging && "select-none",
          className,
        )}
      >
        {children}
      </div>
    </ResizableCtx.Provider>
  );
}

ResizableRoot.displayName = "ResizableRoot";
