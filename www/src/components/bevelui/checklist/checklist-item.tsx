"use client";

import * as React from "react";
import {
  IconCheck,
  IconExternalLink,
  IconLock,
  IconMinus,
  IconRotate,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useChecklist } from "./checklist-context";
import type { ChecklistStep } from "./types";

export function ChecklistItem({ step }: { step: ChecklistStep }) {
  const { statuses, complete, skip, undo, canActivate } = useChecklist();

  const status = statuses[step.id] ?? "idle";
  const active = canActivate(step.id);
  const isDone = status === "complete";
  const isSkipped = status === "skipped";
  const isLocked = !active && status === "idle";
  const isSettled = isDone || isSkipped;

  const blockedBy = step.requires
    ?.filter((id) => statuses[id] !== "complete")
    .length;

  function handleAction() {
    if (!active) return;
    step.onAction?.();
    if (step.href) {
      // noopener/noreferrer: without them the opened page gets a handle on
      // this one through window.opener.
      window.open(step.href, "_blank", "noopener,noreferrer");
    }
    complete(step.id);
  }

  const statusLabel = isDone
    ? "Mark incomplete"
    : isSkipped
      ? "Restore step"
      : isLocked
        ? `Locked — complete ${blockedBy} earlier step${blockedBy === 1 ? "" : "s"} first`
        : "Mark complete";

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-md px-4 py-3 transition-colors",
        !isSettled && active && "hover:bg-muted/30",
        isSettled && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={() => (isSettled ? undo(step.id) : active && complete(step.id))}
        disabled={isLocked}
        aria-label={statusLabel}
        title={statusLabel}
        aria-pressed={isDone}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isDone && "border-primary bg-primary",
          isSkipped && "border-muted-foreground/30",
          !isSettled && active && "border-border hover:border-primary",
          isLocked && "cursor-not-allowed border-muted/40",
        )}
      >
        {isDone && (
          // text-primary-foreground, not a hardcoded text-black that breaks
          // the moment the primary colour changes.
          <IconCheck
            size={11}
            strokeWidth={2.5}
            className="text-primary-foreground"
            aria-hidden
          />
        )}
        {isSkipped && (
          <IconMinus size={11} strokeWidth={2} className="text-muted-foreground/50" aria-hidden />
        )}
        {isLocked && (
          <IconLock size={9} strokeWidth={2} className="text-muted-foreground/40" aria-hidden />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-bui-base font-medium leading-snug",
            isSettled ? "text-muted-foreground/60 line-through" : "text-foreground",
          )}
        >
          {step.title}
        </p>

        {step.description && !isSettled && (
          <p className="mt-0.5 text-bui-xs leading-relaxed text-muted-foreground">
            {step.description}
          </p>
        )}

        {/* Locked steps used to give no reason at all. */}
        {isLocked && (
          <p className="mt-0.5 text-bui-xs text-muted-foreground/70">
            Complete {blockedBy} earlier step{blockedBy === 1 ? "" : "s"} to unlock.
          </p>
        )}

        {!isSettled && active && (step.cta || step.onAction || step.href) && (
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAction}
              className="h-7 gap-1 text-bui-xs"
            >
              {step.cta ?? "Get started"}
              {step.href && <IconExternalLink size={11} aria-hidden />}
            </Button>
            {step.optional && (
              <button
                type="button"
                onClick={() => skip(step.id)}
                className="rounded text-bui-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Skip
              </button>
            )}
          </div>
        )}
      </div>

      {isDone && (
        <button
          type="button"
          onClick={() => undo(step.id)}
          className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Mark “${step.title}” incomplete`}
        >
          <IconRotate size={12} aria-hidden />
        </button>
      )}
    </li>
  );
}

ChecklistItem.displayName = "ChecklistItem";
