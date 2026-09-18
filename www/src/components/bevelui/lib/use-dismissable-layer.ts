"use client";

import * as React from "react";

/** SSR-safe layout effect — silences the server warning without losing sync timing. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** True once mounted on the client. For portals that must not run during SSR. */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/** Counts open layers so nested overlays don't each fight over body overflow. */
let scrollLockCount = 0;
let previousBodyStyle: { overflow: string; paddingRight: string } | null = null;

function lockScroll() {
  if (scrollLockCount++ > 0) return;
  const body = document.body;
  previousBodyStyle = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  };
  // Compensate for the disappearing scrollbar so the page doesn't jump.
  const gap = window.innerWidth - document.documentElement.clientWidth;
  if (gap > 0) body.style.paddingRight = `${gap}px`;
  body.style.overflow = "hidden";
}

function unlockScroll() {
  if (--scrollLockCount > 0) return;
  scrollLockCount = 0;
  const body = document.body;
  body.style.overflow = previousBodyStyle?.overflow ?? "";
  body.style.paddingRight = previousBodyStyle?.paddingRight ?? "";
  previousBodyStyle = null;
}

export interface DismissableLayerOptions {
  open: boolean;
  onDismiss: () => void;
  /** Close when Escape is pressed. Default true. */
  closeOnEscape?: boolean;
  /** Prevent page scroll behind the layer. Default true. */
  lockScroll?: boolean;
  /** Trap Tab within the layer and restore focus on close. Default true. */
  trapFocus?: boolean;
  /** Element to focus when the layer opens. Defaults to the first focusable. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Everything a modal surface owes the user: Escape to dismiss, a focus trap,
 * focus restored to whatever opened it, and a scroll lock that survives nested
 * layers. None of the original overlays (command palette, spotlight, lightbox,
 * tour) did any of this — each was a bare `fixed` div.
 *
 * Returns a ref to spread onto the layer's outermost element.
 */
export function useDismissableLayer<T extends HTMLElement = HTMLDivElement>({
  open,
  onDismiss,
  closeOnEscape = true,
  lockScroll: shouldLockScroll = true,
  trapFocus = true,
  initialFocusRef,
}: DismissableLayerOptions): React.RefObject<T | null> {
  const ref = React.useRef<T | null>(null);
  const restoreFocusRef = React.useRef<HTMLElement | null>(null);

  // Keep onDismiss fresh without re-binding listeners on every parent render.
  const dismissRef = React.useRef(onDismiss);
  React.useEffect(() => {
    dismissRef.current = onDismiss;
  });

  React.useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    if (shouldLockScroll) lockScroll();

    const node = ref.current;
    if (trapFocus && node) {
      // Defer one frame so the element has laid out and children have mounted.
      const raf = requestAnimationFrame(() => {
        const target =
          initialFocusRef?.current ?? focusableWithin(node)[0] ?? node;
        if (!node.contains(document.activeElement)) {
          target.focus({ preventScroll: true });
        }
      });

      return () => {
        cancelAnimationFrame(raf);
        if (shouldLockScroll) unlockScroll();
        restoreFocusRef.current?.focus({ preventScroll: true });
      };
    }

    return () => {
      if (shouldLockScroll) unlockScroll();
      restoreFocusRef.current?.focus({ preventScroll: true });
    };
  }, [open, shouldLockScroll, trapFocus, initialFocusRef]);

  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (closeOnEscape && event.key === "Escape") {
        event.stopPropagation();
        dismissRef.current();
        return;
      }

      if (!trapFocus || event.key !== "Tab") return;

      const node = ref.current;
      if (!node) return;

      const focusable = focusableWithin(node);
      if (focusable.length === 0) {
        event.preventDefault();
        node.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !node.contains(active))) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, closeOnEscape, trapFocus]);

  return ref;
}
