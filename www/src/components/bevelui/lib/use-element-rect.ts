"use client";

import * as React from "react";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Media query hook, self-contained so a copied system carries no app imports.
 * Reads synchronously on the client via useSyncExternalStore, so the first
 * paint is already correct — no layout flash while an effect catches up.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false, // server snapshot — assume desktop, corrected on hydration
  );
}

/** True when the user has asked for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True for coarse pointers (touch), where hover-only affordances never appear. */
export function useIsTouch(): boolean {
  return useMediaQuery("(hover: none) and (pointer: coarse)");
}

/**
 * Tracks an element's viewport rect across scroll, resize and mutation.
 *
 * Measurement is coalesced into a single rAF per frame. The original tour
 * overlay called setState directly from a capture-phase scroll listener, so a
 * fast scroll queued a React render per scroll event and the spotlight cutout
 * visibly lagged behind the element it was meant to be tracking.
 */
export function useElementRect(
  selector: string | null,
  enabled: boolean,
  padding = 0,
): Rect | null {
  const [rect, setRect] = React.useState<Rect | null>(null);

  React.useLayoutEffect(() => {
    if (!enabled || !selector) {
      setRect(null);
      return;
    }

    let frame = 0;
    let lastKey = "";

    const read = () => {
      frame = 0;
      const el = document.querySelector(selector);
      if (!el) {
        setRect((prev) => (prev === null ? prev : null));
        return;
      }

      const r = el.getBoundingClientRect();
      const next: Rect = {
        top: r.top - padding,
        left: r.left - padding,
        width: r.width + padding * 2,
        height: r.height + padding * 2,
      };

      // Skip the state update when nothing moved — most scroll frames on a
      // position:fixed anchor produce an identical rect.
      const key = `${next.top}|${next.left}|${next.width}|${next.height}`;
      if (key === lastKey) return;
      lastKey = key;
      setRect(next);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    read();

    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);

    const el = document.querySelector(selector);
    const resizeObserver = new ResizeObserver(schedule);
    if (el) resizeObserver.observe(el);

    // Catch the anchor being added or removed by a route change or conditional
    // render — the original looked the element up once and gave up if missing.
    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [selector, enabled, padding]);

  return rect;
}
