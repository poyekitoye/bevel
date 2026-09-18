"use client";

import * as React from "react";
import { useEventCallback } from "../lib/use-controllable-state";
import type { TourContextValue, TourEndReason, TourStepDef } from "./types";

const TourContext = React.createContext<TourContextValue | undefined>(undefined);

export function useTour(): TourContextValue {
  const ctx = React.useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within <TourProvider>");
  return ctx;
}

export interface TourProviderProps {
  children: React.ReactNode;
  steps: TourStepDef[];
  /** Dim and cut out the page behind the card. Default true. */
  showOverlay?: boolean;
  /** Start the tour automatically on mount. */
  defaultOpen?: boolean;
  /** Fired only when the user reaches the end and confirms. */
  onComplete?: () => void;
  /** Fired only when the user abandons the tour. */
  onSkip?: () => void;
  /** Fired on any exit, with the reason. */
  onEnd?: (reason: TourEndReason) => void;
  /** Scroll the anchor into view when a step becomes active. Default true. */
  scrollToAnchor?: boolean;
}

/** Ignore global arrow keys while the user is typing or in a rich-text field. */
function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.isContentEditable
  );
}

export function TourProvider({
  children,
  steps,
  showOverlay = true,
  defaultOpen = false,
  onComplete,
  onSkip,
  onEnd,
  scrollToAnchor = true,
}: TourProviderProps) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [isAnchorMissing, setIsAnchorMissing] = React.useState(false);

  // Sorted once so `steps` may arrive in any order and `next` still advances
  // through them predictably.
  const ordered = React.useMemo(
    () => [...steps].sort((a, b) => a.step - b.step),
    [steps],
  );
  const totalSteps = ordered.length;

  const emitComplete = useEventCallback(onComplete);
  const emitSkip = useEventCallback(onSkip);
  const emitEnd = useEventCallback(onEnd);

  const currentStepDef = ordered.find((s) => s.step === currentStep);

  // Exit is a plain callback rather than something fired from inside a state
  // updater. The original called onComplete() within setCurrentStep's updater,
  // which React runs twice under StrictMode — firing the consumer's completion
  // handler twice per tour.
  const end = React.useCallback(
    (reason: TourEndReason) => {
      setIsOpen(false);
      if (reason === "completed") emitComplete();
      if (reason === "skipped") emitSkip();
      emitEnd(reason);
    },
    [emitComplete, emitSkip, emitEnd],
  );

  const start = React.useCallback(() => {
    setCurrentStep(ordered[0]?.step ?? 1);
    setIsOpen(true);
  }, [ordered]);

  const stop = React.useCallback(() => end("stopped"), [end]);
  const skip = React.useCallback(() => end("skipped"), [end]);

  const next = React.useCallback(() => {
    const index = ordered.findIndex((s) => s.step === currentStep);
    const following = ordered[index + 1];
    if (following) setCurrentStep(following.step);
    else end("completed");
  }, [ordered, currentStep, end]);

  const prev = React.useCallback(() => {
    const index = ordered.findIndex((s) => s.step === currentStep);
    const preceding = ordered[index - 1];
    if (preceding) setCurrentStep(preceding.step);
  }, [ordered, currentStep]);

  const goTo = React.useCallback(
    (step: number) => {
      if (ordered.some((s) => s.step === step)) setCurrentStep(step);
    },
    [ordered],
  );

  // Run the step's beforeEnter hook, then report whether its anchor exists so
  // the card can fall back to a centred dialog instead of pinning to 0,0.
  React.useEffect(() => {
    if (!isOpen || !currentStepDef) return;

    let cancelled = false;

    async function enter() {
      await currentStepDef?.beforeEnter?.();
      if (cancelled) return;

      // Give a beforeEnter-triggered render a frame to commit.
      requestAnimationFrame(() => {
        if (cancelled) return;
        const el = document.querySelector(`[data-tour-step="${currentStep}"]`);
        setIsAnchorMissing(!el);

        if (el && scrollToAnchor) {
          const rect = el.getBoundingClientRect();
          const offscreen =
            rect.top < 0 ||
            rect.left < 0 ||
            rect.bottom > window.innerHeight ||
            rect.right > window.innerWidth;
          if (offscreen) {
            el.scrollIntoView({ block: "center", inline: "center" });
          }
        }
      });
    }

    enter();
    return () => {
      cancelled = true;
    };
  }, [isOpen, currentStep, currentStepDef, scrollToAnchor]);

  React.useEffect(() => {
    if (!isOpen) return;

    function onKey(e: KeyboardEvent) {
      // Escape is handled by the card's dismissable layer so it can respect
      // nesting; here we only own step navigation.
      if (isEditableTarget(e.target)) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, next, prev]);

  const value = React.useMemo<TourContextValue>(
    () => ({
      steps: ordered,
      currentStep,
      totalSteps,
      isOpen,
      showOverlay,
      currentStepDef,
      isAnchorMissing,
      start,
      stop,
      next,
      prev,
      goTo,
      skip,
    }),
    [
      ordered,
      currentStep,
      totalSteps,
      isOpen,
      showOverlay,
      currentStepDef,
      isAnchorMissing,
      start,
      stop,
      next,
      prev,
      goTo,
      skip,
    ],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
