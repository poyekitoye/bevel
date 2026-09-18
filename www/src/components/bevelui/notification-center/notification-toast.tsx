"use client";

import * as React from "react";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useNotificationCtx } from "./notification-context";
import { PRIORITY_DOT, PRIORITY_LIVE } from "./notification-priority";
import { usePrefersReducedMotion } from "../lib/use-element-rect";
import type { ToastGroupState } from "./types";

export interface NotificationToastProps {
  group: ToastGroupState;
  className?: string;
}

export function NotificationToast({ group, className }: NotificationToastProps) {
  const { history, dismissToast, pauseToast, resumeToast, undo } =
    useNotificationCtx();
  const reduceMotion = usePrefersReducedMotion();

  const latestId = group.ids[group.ids.length - 1];
  const latest = history.find((n) => n.id === latestId);
  const count = group.ids.length;

  // Restart the countdown transition whenever the group's deadline moves.
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    setReady(false);
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [group.expiresAt]);

  if (!latest) return null;

  const accent = PRIORITY_DOT[group.priority] ?? PRIORITY_DOT.normal;
  const hasTimer = group.durationMs !== null;
  const isPaused = group.paused && group.remainingMs !== null;

  return (
    <div
      // A toast with interactive controls is a region, not a bare status line.
      // Critical items interrupt; everything else waits its turn.
      role={group.priority === "critical" ? "alert" : "status"}
      aria-live={PRIORITY_LIVE[group.priority] ?? "polite"}
      aria-atomic
      onMouseEnter={() => pauseToast(group.groupKey)}
      onMouseLeave={() => resumeToast(group.groupKey)}
      // Pause on focus too — otherwise the toast expires out from under a
      // keyboard user midway through tabbing to its Undo button.
      onFocusCapture={() => pauseToast(group.groupKey)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          resumeToast(group.groupKey);
        }
      }}
      className={cn(
        "relative w-80 max-w-[90vw] overflow-hidden rounded-xl border border-border",
        "bg-card/95 shadow-lg backdrop-blur",
        className,
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <span
          aria-hidden
          className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", accent)}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-bui-base font-medium text-foreground">
              {latest.title}
            </p>
            {count > 1 && (
              <span
                className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-bui-2xs font-medium text-muted-foreground"
                aria-label={`${count} similar notifications`}
              >
                {count}
              </span>
            )}
          </div>

          {latest.message && (
            <p className="mt-0.5 line-clamp-2 text-bui-sm text-muted-foreground">
              {latest.message}
            </p>
          )}

          {(latest.actions?.length || latest.undo) && (
            <div className="mt-2 flex items-center gap-3">
              {latest.undo && (
                <button
                  type="button"
                  onClick={() => undo(latest.id)}
                  className="rounded text-bui-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Undo
                </button>
              )}
              {latest.actions?.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.onClick}
                  className="rounded text-bui-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => dismissToast(group.groupKey)}
          aria-label="Dismiss notification"
          className="shrink-0 rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <IconX size={13} strokeWidth={1.8} aria-hidden />
        </button>
      </div>

      {hasTimer && (
        <div className="h-0.5 w-full bg-border/60">
          {/* Keyed so React does not reconcile the paused and running bars as
              the same node — which carried a half-finished width transition
              across the swap and made pausing visibly jump. */}
          <div
            key={isPaused ? "paused" : `running-${group.expiresAt}`}
            className={cn("h-full", accent)}
            style={
              isPaused
                ? {
                    width: `${((group.remainingMs ?? 0) / (group.durationMs ?? 1)) * 100}%`,
                  }
                : {
                    width: ready ? "0%" : "100%",
                    transitionProperty: "width",
                    transitionTimingFunction: "linear",
                    transitionDuration: reduceMotion
                      ? "0ms"
                      : ready
                        ? `${group.durationMs}ms`
                        : "0ms",
                  }
            }
          />
        </div>
      )}
    </div>
  );
}

NotificationToast.displayName = "NotificationToast";
