"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  size,
  FloatingArrow,
  limitShift,
  type Placement,
} from "@floating-ui/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  IconArrowLeft,
  IconArrowRight,
  IconX,
  IconPlayerPlay,
  IconPlayerPause,
} from "@tabler/icons-react";
import { useTour } from "./tour-context";
import {
  useMediaQuery,
  usePrefersReducedMotion,
} from "../lib/use-element-rect";
import {
  useDismissableLayer,
  useMounted,
} from "../lib/use-dismissable-layer";
import type { TourContextValue, TourMedia } from "./types";

// ─── Media ────────────────────────────────────────────────────────────────────

function TourMediaBlock({ media }: { media: TourMedia }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);

  // Track the element's real state rather than assuming autoplay succeeded —
  // browsers block it often enough that the original's optimistic `true`
  // showed a pause icon over a stopped video.
  React.useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const sync = () => setPlaying(!el.paused);
    el.addEventListener("play", sync);
    el.addEventListener("pause", sync);
    sync();
    return () => {
      el.removeEventListener("play", sync);
      el.removeEventListener("pause", sync);
    };
  }, [media.src]);

  if (media.type === "image" || media.type === "gif") {
    return (
      <div className="-mx-4 -mt-4 mb-1 overflow-hidden rounded-t-xl border-b border-border/60">
        <img
          src={media.src}
          alt={media.alt ?? ""}
          className="max-h-40 w-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div className="group relative -mx-4 -mt-4 mb-1 overflow-hidden rounded-t-xl border-b border-border/60 bg-black">
        <video
          ref={videoRef}
          src={media.src}
          poster={media.poster}
          autoPlay
          loop
          muted
          playsInline
          className="max-h-40 w-full object-cover"
        />
        {/* Always visible on touch, where there is no hover to reveal it. */}
        <button
          type="button"
          aria-label={playing ? "Pause video" : "Play video"}
          onClick={() => {
            const el = videoRef.current;
            if (!el) return;
            if (el.paused) el.play();
            else el.pause();
          }}
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/30 text-white transition-opacity",
            "opacity-0 focus-visible:opacity-100 group-hover:opacity-100",
            "[@media(hover:none)]:opacity-100",
          )}
        >
          {playing ? (
            <IconPlayerPause size={28} />
          ) : (
            <IconPlayerPlay size={28} />
          )}
        </button>
      </div>
    );
  }

  return null;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

function ProgressDots({
  steps,
  current,
  onGoTo,
}: {
  steps: { step: number }[];
  current: number;
  onGoTo: (step: number) => void;
}) {
  const total = steps.length;
  return (
    <div className="flex items-center gap-1.5" role="tablist" aria-label="Tour steps">
      {steps.map(({ step }) => {
        const isCurrent = step === current;
        return (
          <button
            key={step}
            type="button"
            role="tab"
            aria-selected={isCurrent}
            aria-label={`Step ${step} of ${total}`}
            onClick={() => onGoTo(step)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isCurrent
                ? "w-4 bg-primary"
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60",
            )}
          />
        );
      })}
    </div>
  );
}

// ─── Card body ────────────────────────────────────────────────────────────────

interface CardBodyProps {
  showArrow: boolean;
  arrowRef: React.RefObject<SVGSVGElement | null>;
  arrowContext: ReturnType<typeof useFloating>["context"];
}

function TourCardBody({ showArrow, arrowRef, arrowContext }: CardBodyProps) {
  const {
    steps,
    currentStep,
    totalSteps,
    currentStepDef,
    next,
    prev,
    skip,
    goTo,
  } = useTour();

  const reduceMotion = usePrefersReducedMotion();
  if (!currentStepDef) return null;

  // Derived from position in the ordered list, not from the step number —
  // steps may be numbered sparsely (10, 20, 30) and still be a valid tour.
  const index = steps.findIndex((s) => s.step === currentStep);
  const isFirst = index <= 0;
  const isLast = index === steps.length - 1;

  return (
    <>
      {showArrow && (
        <FloatingArrow
          ref={arrowRef}
          context={arrowContext}
          className="fill-popover [&>path:first-of-type]:stroke-border"
          strokeWidth={1}
          width={14}
          height={7}
        />
      )}

      {currentStepDef.media && <TourMediaBlock media={currentStepDef.media} />}

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-bui-2xs font-medium uppercase tracking-wide text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <h3 id="bui-tour-title" className="text-bui-md font-semibold leading-snug text-foreground">
              {currentStepDef.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={skip}
            aria-label="Close tour"
            className={cn(
              "-mt-0.5 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors",
              "hover:bg-muted/60 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            )}
          >
            <IconX size={15} strokeWidth={2} />
          </button>
        </div>

        <p className="text-bui-base leading-relaxed text-muted-foreground">
          {currentStepDef.description}
        </p>

        <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
          <ProgressDots steps={steps} current={currentStep} onGoTo={goTo} />

          <div className="flex items-center gap-1.5">
            {!isFirst && (
              <Button
                variant="ghost"
                size="sm"
                onClick={prev}
                className="h-8 gap-1 px-2.5 text-bui-sm"
              >
                <IconArrowLeft size={13} strokeWidth={2} />
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={next}
              className="h-8 gap-1 px-3 text-bui-sm"
            >
              {isLast ? "Finish" : "Next"}
              {!isLast && <IconArrowRight size={13} strokeWidth={2} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Keyboard hints only make sense where there is a keyboard. */}
      <p
        className={cn(
          "mt-2 text-center text-bui-2xs text-muted-foreground/50",
          "hidden sm:block",
          reduceMotion && "transition-none",
        )}
      >
        ← → to navigate · Esc to close
      </p>
    </>
  );
}

// ─── TourCard ─────────────────────────────────────────────────────────────────

export interface TourCardProps {
  /** Render your own card. Receives the full tour context. */
  children?: (props: TourContextValue) => React.ReactNode;
  className?: string;
}

export function TourCard({ children, className }: TourCardProps) {
  const tour = useTour();
  const { isOpen, currentStep, currentStepDef, isAnchorMissing, skip } = tour;

  const mounted = useMounted();
  const reduceMotion = usePrefersReducedMotion();
  // Below 640px the popover becomes a bottom sheet — a 300px floating card
  // pinned to a small anchor had no room to flip and routinely ran off-screen.
  const isCompact = useMediaQuery("(max-width: 640px)");

  const arrowRef = React.useRef<SVGSVGElement>(null);

  // A floating card needs an anchor. Without one (or on a phone, or when the
  // step is a plain intro) the card renders as a centred dialog instead of
  // pinning itself to the top-left corner, which is what the original did.
  const isFloating = !isCompact && !isAnchorMissing;

  const { refs, floatingStyles, context } = useFloating({
    placement: (currentStepDef?.side ?? "bottom") as Placement,
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(currentStepDef?.sideOffset ?? 14),
      flip({ fallbackAxisSideDirection: "start", padding: 12 }),
      shift({ padding: 12, limiter: limitShift() }),
      // Never let the card exceed the viewport — the original had a fixed
      // 300px width and no height constraint, so a long step on a short
      // screen simply overflowed.
      size({
        padding: 12,
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.max(180, availableHeight)}px`,
          });
        },
      }),
      arrow({ element: arrowRef }),
    ],
  });

  // Re-point at the current step's anchor. Kept in a layout effect so the
  // position is resolved before paint.
  React.useLayoutEffect(() => {
    if (!isOpen || !isFloating) {
      refs.setReference(null);
      return;
    }
    refs.setReference(
      document.querySelector<Element>(`[data-tour-step="${currentStep}"]`),
    );
  }, [currentStep, isOpen, isFloating, refs]);

  const layerRef = useDismissableLayer<HTMLDivElement>({
    open: isOpen,
    onDismiss: skip,
    // The page behind stays scrollable: a tour explains the page, and locking
    // it would break anchors that live below the fold.
    lockScroll: false,
  });

  if (!mounted) return null;

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const };

  const card = (
    <motion.div
      ref={layerRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="bui-tour-title"
      initial={
        reduceMotion
          ? { opacity: 1 }
          : isCompact
            ? { opacity: 0, y: 24 }
            : { opacity: 0, scale: 0.96 }
      }
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={
        reduceMotion
          ? { opacity: 1 }
          : isCompact
            ? { opacity: 0, y: 24 }
            : { opacity: 0, scale: 0.96 }
      }
      transition={transition}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "pointer-events-auto flex flex-col overflow-y-auto overscroll-contain bg-popover text-popover-foreground outline-none",
        isCompact
          ? // Bottom sheet: full width, safe-area aware, never taller than half
            // the screen so the highlighted element stays visible above it.
            "max-h-[60svh] w-full rounded-t-2xl border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl"
          : "w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border p-4 shadow-xl",
        className,
      )}
    >
      {children ? (
        children(tour)
      ) : (
        <TourCardBody
          showArrow={isFloating}
          arrowRef={arrowRef}
          arrowContext={context}
        />
      )}
    </motion.div>
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && currentStepDef && (
        <div
          key="tour-card-layer"
          className="pointer-events-none fixed inset-0"
          style={{ zIndex: "var(--z-bui-tour)" }}
        >
          {isFloating ? (
            // The floating ref goes on this positioner only. The original put
            // setFloating on both the wrapper and the card, so Floating UI
            // measured one box and positioned another.
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="pointer-events-none"
            >
              {card}
            </div>
          ) : (
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 flex justify-center px-0 sm:px-4",
                isCompact ? "bottom-0" : "top-1/2 -translate-y-1/2",
              )}
            >
              {card}
            </div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

TourCard.displayName = "TourCard";
