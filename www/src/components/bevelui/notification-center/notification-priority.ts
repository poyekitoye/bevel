import type { NotificationPriority } from "./types";

/**
 * Single source for priority colour. The map was previously duplicated,
 * character for character, in notification-toast and notification-item, and
 * typed as Record<string, string> so a missing key fell through to a runtime
 * fallback instead of failing to compile.
 */
export const PRIORITY_DOT: Record<NotificationPriority, string> = {
  low: "bg-muted-foreground/40",
  normal: "bg-primary",
  high: "bg-amber-400",
  critical: "bg-destructive",
};

/** Politeness for the live region announcing a toast. */
export const PRIORITY_LIVE: Record<NotificationPriority, "polite" | "assertive"> = {
  low: "polite",
  normal: "polite",
  high: "polite",
  critical: "assertive",
};
