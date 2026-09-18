"use client";

import * as React from "react";
import { useCursors } from "./cursors-context";
import { throttle } from "./cursor-utils";
import type { CursorMeta } from "./types";
import { cn } from "@/lib/utils";
import { getContrastColor } from "../lib/color";

// ─── Cursor arrow SVG ─────────────────────────────────────────────────────────
// Hotspot at (0, 0) — the tip of the arrow.

function CursorArrow({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="20"
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ pointerEvents: "none", display: "block" }}
    >
      <path
        d="M0 0 L0 16 L4.5 12.5 L7 19.5 L9.5 18.5 L7 11.5 L12.5 11.5 Z"
        fill={color}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── CursorElement ────────────────────────────────────────────────────────────
// Renders a single remote cursor + label.
// Registers its DOM refs so CursorsRoot can update positions directly.
// Applies its initial position from positionsRef on mount (handles the race
// between updateCursor being called and the React render completing).

function CursorElement({ meta }: { meta: CursorMeta }) {
  const { containerRef, positionsRef, cursorElsRef, labelElsRef } =
    useCursors();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const labelRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const label = labelRef.current;
    if (!wrapper || !label) return;

    // Register with Root so imperative updates can reach these elements
    cursorElsRef.current.set(meta.userId, wrapper);
    labelElsRef.current.set(meta.userId, label);

    // Apply initial position if updateCursor was called before this element mounted
    const pos = positionsRef.current.get(meta.userId);
    const container = containerRef.current;
    if (pos && container) {
      const x = Math.round(pos.x * container.offsetWidth);
      const y = Math.round(pos.y * container.offsetHeight);
      wrapper.style.transform = `translate(${x}px, ${y}px)`;
    }

    return () => {
      cursorElsRef.current.delete(meta.userId);
      labelElsRef.current.delete(meta.userId);
    };
  }, [meta.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={wrapperRef}
      className={cn(
        // Position at top-left; transform moves it to cursor coords
        "absolute top-0 left-0 will-change-transform pointer-events-none",
        // Fade idle cursors; re-appearing cursors fade back in
        "transition-opacity duration-500 ease-in-out",
        meta.isIdle ? "opacity-0" : "opacity-100",
      )}
      // Hidden off-screen until first position is applied
      style={{ transform: "translate(-200px, -200px)" }}
      aria-hidden
    >
      {/* Arrow at hotspot (0,0) */}
      <CursorArrow color={meta.color} />

      {/* Name label — natural offset from cursor tip.
          Transform is overridden by the overlap resolver each frame. */}
      <div
        ref={labelRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{ transform: "translate(12px, 8px)" }}
      >
        {/* Foreground derived from the user colour rather than a hardcoded
            text-white, which was unreadable on any light presence colour. */}
        <span
          className={cn(
            "block rounded px-1.5 py-0.5 text-bui-xs font-medium",
            "whitespace-nowrap leading-4 shadow-sm",
          )}
          style={{
            backgroundColor: meta.color,
            color: getContrastColor(meta.color),
          }}
        >
          {meta.userName}
        </span>
      </div>
    </div>
  );
}

// ─── CursorCanvas ─────────────────────────────────────────────────────────────
// The shared surface. Wrap your page content with this.
//
// Responsibilities:
//  - Tracks the local cursor via mousemove, throttles, normalizes, calls onMove
//  - Renders a pointer-events-none overlay containing all remote cursors
//  - Sets containerRef so CursorsRoot can compute normalized positions

export interface CursorCanvasProps {
  children?: React.ReactNode;
  className?: string;
}

export function CursorCanvas({ children, className }: CursorCanvasProps) {
  const { localUser, cursors, config, onMove, containerRef } = useCursors();

  // Keep a stable ref to the throttled handler so re-renders don't re-create it
  const moveHandlerRef = React.useRef<((e: MouseEvent) => void) | null>(null);

  // Rebuild the throttled handler when throttleMs or onMove changes
  React.useEffect(() => {
    const ms = config.throttleMs ?? 50;
    moveHandlerRef.current = throttle((e: MouseEvent) => {
      const container = containerRef.current;
      if (!container || !onMove) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      // Ignore movement outside the canvas bounds
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      onMove({ x, y });
    }, ms);
  }, [config.throttleMs, onMove]); // eslint-disable-line react-hooks/exhaustive-deps

  // Attach the mousemove listener to the container after mount
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: MouseEvent) => moveHandlerRef.current?.(e);
    container.addEventListener("mousemove", handler, { passive: true });
    return () => container.removeEventListener("mousemove", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter which cursors to render
  const visibleCursors = React.useMemo<CursorMeta[]>(() => {
    const all = Array.from(cursors.values());
    return config.showSelf
      ? all
      : all.filter((c) => c.userId !== localUser.userId);
  }, [cursors, config.showSelf, localUser.userId]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {children}

      {/* Cursor overlay — renders above content, no pointer events */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        {visibleCursors.map((meta) => (
          <CursorElement key={meta.userId} meta={meta} />
        ))}
      </div>
    </div>
  );
}

CursorCanvas.displayName = "CursorCanvas";
