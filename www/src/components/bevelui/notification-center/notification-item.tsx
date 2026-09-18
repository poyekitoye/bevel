"use client";

import * as React from "react";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useNotificationCtx } from "./notification-context";
import { PRIORITY_DOT } from "./notification-priority";
import type { Notification } from "./types";

export interface NotificationItemProps {
  notification: Notification;
  className?: string;
}

/**
 * Relative timestamp that actually ticks.
 *
 * The original called Date.now() during render with nothing to re-run it, so
 * "just now" stayed "just now" forever — and because the server and client
 * evaluated it at different moments it also produced a hydration mismatch.
 */
function useTimeAgo(timestamp: number): string {
  const [, force] = React.useReducer((n: number) => n + 1, 0);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => setHydrated(true), []);

  React.useEffect(() => {
    if (!hydrated) return;
    const age = Date.now() - timestamp;
    // Tick every 30s for the first hour, then hourly — no per-second timer.
    const interval = age < 60 * 60 * 1000 ? 30_000 : 60 * 60 * 1000;
    const id = setInterval(force, interval);
    return () => clearInterval(id);
  }, [hydrated, timestamp]);

  if (!hydrated) return "";

  const diff = Math.max(0, Date.now() - timestamp);
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationItem({
  notification,
  className,
}: NotificationItemProps) {
  const { markRead, undo, removeFromHistory } = useNotificationCtx();
  const timeAgo = useTimeAgo(notification.createdAt);

  const handleActivate = () => {
    if (!notification.read) markRead(notification.id);
  };

  return (
    <li
      className={cn(
        "group flex items-start gap-2.5 rounded-lg px-2.5 py-2.5 transition-colors",
        !notification.read && "bg-primary/[0.04]",
        "hover:bg-muted/60",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-1.5 shrink-0 rounded-full",
          notification.read
            ? "bg-transparent"
            : PRIORITY_DOT[notification.priority ?? "normal"],
        )}
      />

      <div className="min-w-0 flex-1">
        {/* Focusable, so marking as read is reachable without a mouse. */}
        <button
          type="button"
          onClick={handleActivate}
          className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
        >
          <span className="block truncate text-bui-base font-medium text-foreground">
            {notification.title}
          </span>
          {notification.message && (
            <span className="mt-0.5 line-clamp-2 block text-bui-sm text-muted-foreground">
              {notification.message}
            </span>
          )}
        </button>

        <div className="mt-1 flex items-center gap-3">
          {timeAgo && (
            <time
              dateTime={new Date(notification.createdAt).toISOString()}
              className="text-bui-2xs text-muted-foreground/60"
            >
              {timeAgo}
            </time>
          )}
          {notification.undo && !notification.undone && (
            <button
              type="button"
              onClick={() => undo(notification.id)}
              className="rounded text-bui-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Undo
            </button>
          )}
          {notification.undone && (
            <span className="text-bui-xs italic text-muted-foreground/60">
              Undone
            </span>
          )}
        </div>
      </div>

      {/* An IconX like everywhere else in the library, not a bare ✕ glyph
          rendered in the body font — and visible to keyboard and touch, not
          just hover. The original needed hover:!text-foreground to win against
          its own opacity classes. */}
      <button
        type="button"
        onClick={() => removeFromHistory(notification.id)}
        aria-label={`Remove “${notification.title}”`}
        className={cn(
          "shrink-0 rounded p-0.5 text-muted-foreground/50 transition-opacity",
          "opacity-0 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "[@media(hover:none)]:opacity-100",
        )}
      >
        <IconX size={13} aria-hidden />
      </button>
    </li>
  );
}

NotificationItem.displayName = "NotificationItem";
