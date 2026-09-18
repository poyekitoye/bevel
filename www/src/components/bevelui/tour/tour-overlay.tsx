"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useTour } from "./tour-context";
import {
  useElementRect,
  useMediaQuery,
  usePrefersReducedMotion,
} from "../lib/use-element-rect";
import { useMounted } from "../lib/use-dismissable-layer";

const DEFAULT_PADDING = 8;

/**
 * Dims the page and cuts a hole around the current anchor.
 *
 * Rewritten from the original in three ways:
 *  - measurement is rAF-coalesced (see useElementRect) instead of one setState
 *    per scroll event, which made the cutout visibly lag the element
 *  - the mask id is unique per instance, so two tours on a page no longer
 *    collide on a document-global SVG id
 *  - the highlight ring is actually drawn; the original rendered an empty
 *    motion.div with no border, background or children
 */
export function TourOverlay() {
  const { currentStep, isOpen, skip, showOverlay, currentStepDef } = useTour();
  const mounted = useMounted();
  const reduceMotion = usePrefersReducedMotion();
  const isCompact = useMediaQuery("(max-width: 640px)");

  const padding = currentStepDef?.highlightPadding ?? DEFAULT_PADDING;
  const interactive = currentStepDef?.interactive ?? false;

  const rect = useElementRect(
    isOpen ? `[data-tour-step="${currentStep}"]` : null,
    isOpen && showOverlay,
    padding,
  );

  // Unique per mounted overlay — SVG ids are global to the document.
  const maskId = React.useId().replace(/:/g, "");

  if (!mounted || !showOverlay) return null;

  const spring = reduceMotion
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 380, damping: 34 } as const);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="tour-overlay"
          className="fixed inset-0"
          style={{ zIndex: "var(--z-bui-overlay)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          aria-hidden
        >
          {/* The dimmer. Clicking it abandons the tour, except on an
              interactive step where the click belongs to the page. */}
          <svg
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            onClick={interactive ? undefined : skip}
            style={{ pointerEvents: interactive ? "none" : "auto" }}
          >
            <defs>
              <mask id={maskId}>
                <rect width="100%" height="100%" fill="white" />
                {rect && (
                  <motion.rect
                    rx={10}
                    fill="black"
                    initial={false}
                    animate={{
                      x: rect.left,
                      y: rect.top,
                      width: rect.width,
                      height: rect.height,
                    }}
                    transition={spring}
                  />
                )}
              </mask>
            </defs>

            <rect
              width="100%"
              height="100%"
              fill="rgb(0 0 0 / 0.65)"
              mask={`url(#${maskId})`}
            />
          </svg>

          {/* Highlight ring. Never intercepts pointer events, so an
              interactive step can still receive the user's click. */}
          {rect && (
            <motion.div
              className="pointer-events-none absolute rounded-[10px] ring-2 ring-primary ring-offset-0"
              initial={false}
              animate={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
              }}
              transition={spring}
              style={{
                boxShadow: interactive
                  ? "0 0 0 4px rgb(var(--tour-ring-glow, 0 0 0) / 0)"
                  : undefined,
              }}
            />
          )}

          {/* On phones the card is a bottom sheet, so reserve its space to
              stop the cutout sitting underneath it. */}
          {isCompact && <div className="absolute inset-x-0 bottom-0 h-0" />}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

TourOverlay.displayName = "TourOverlay";
