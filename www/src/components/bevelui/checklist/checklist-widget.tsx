"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconSparkles, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useChecklist } from "./checklist-context";
import { ChecklistItem } from "./checklist-item";
import { ChecklistProgressRing } from "./checklist-progress-ring";
import { useDismissableLayer } from "../lib/use-dismissable-layer";
import { usePrefersReducedMotion } from "../lib/use-element-rect";
import type { ChecklistConfig } from "./types";

export function ChecklistWidget({ config }: { config: ChecklistConfig }) {
  const {
    steps,
    isOpen,
    toggle,
    close,
    progress,
    completedCount,
    requiredCount,
    isComplete,
  } = useChecklist();

  const reduceMotion = usePrefersReducedMotion();
  const panelId = React.useId();

  const panelRef = useDismissableLayer<HTMLDivElement>({
    open: isOpen,
    onDismiss: close,
    // A launcher panel is not a modal — it should not lock the page or steal
    // focus back on every render.
    lockScroll: false,
    trapFocus: false,
  });

  const position =
    config.position === "bottom-left"
      ? "bottom-4 left-4 items-start sm:bottom-6 sm:left-6"
      : "bottom-4 right-4 items-end sm:bottom-6 sm:right-6";

  return (
    <div
      className={cn("fixed flex flex-col gap-3", position)}
      style={{ zIndex: "var(--z-bui-panel)" }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={config.title ?? "Setup checklist"}
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            className={cn(
              "flex w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-card",
              // A neutral shadow rather than shadow-black/40, which is far too
              // heavy against a light background.
              "shadow-2xl shadow-foreground/10",
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 pb-3 pt-4">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className="text-bui-base font-semibold text-foreground">
                  {config.title ?? "Get started"}
                </h2>
                {config.subtitle && (
                  <p className="text-bui-xs text-muted-foreground">
                    {config.subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close checklist"
                className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <IconX size={14} aria-hidden />
              </button>
            </div>

            <div className="border-b border-border/40 px-4 py-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-bui-2xs uppercase tracking-wider text-muted-foreground">
                  {completedCount} of {requiredCount} complete
                </span>
                <span className="font-mono text-bui-2xs text-primary">
                  {progress}%
                </span>
              </div>
              <div
                className="h-1 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Setup progress"
              >
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            {isComplete ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8">
                <span className="flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary/15">
                  <IconSparkles size={18} className="text-primary" aria-hidden />
                </span>
                <p className="text-bui-base font-semibold text-foreground">
                  You&rsquo;re all set
                </p>
                <p className="text-center text-bui-xs text-muted-foreground">
                  All steps completed. You&rsquo;re ready to go.
                </p>
              </div>
            ) : (
              // divide-y and space-y-1 were applied together, which draws
              // dividers and then pushes gaps through them.
              <ul className="flex max-h-72 list-none flex-col divide-y divide-border/40 overflow-y-auto overscroll-contain py-1">
                {steps.map((step) => (
                  <ChecklistItem key={step.id} step={step} />
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`Setup checklist, ${completedCount} of ${requiredCount} complete`}
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        className={cn(
          "relative flex size-12 items-center justify-center rounded-full border border-border bg-card",
          "shadow-lg shadow-foreground/10 transition-colors hover:border-primary/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        )}
      >
        <ChecklistProgressRing progress={progress} size={44} strokeWidth={2.5} />
        <span className="absolute font-mono text-bui-2xs font-bold tabular-nums text-primary">
          {completedCount}/{requiredCount}
        </span>
      </motion.button>
    </div>
  );
}

ChecklistWidget.displayName = "ChecklistWidget";
