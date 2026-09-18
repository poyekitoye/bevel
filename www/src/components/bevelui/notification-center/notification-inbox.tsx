"use client";

import * as React from "react";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import { IconBell } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useNotificationCtx } from "./notification-context";
import { NotificationItem } from "./notification-item";

export interface NotificationInboxProps {
  className?: string;
  panelClassName?: string;
}

/**
 * Bell icon + unread badge that opens a floating panel listing notification
 * history. Reads from the same NotificationRoot as the toast surface, so
 * history persists independently of which toasts are still visible.
 */
export function NotificationInbox({ className, panelClassName }: NotificationInboxProps) {
  const { history, unreadCount, markAllRead, clearHistory } = useNotificationCtx();
  const [open, setOpen] = React.useState(false);

  const { refs, floatingStyles } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  React.useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      const referenceEl = refs.reference.current;
      const referenceContains =
        referenceEl instanceof Element ? referenceEl.contains(target) : false;
      if (refs.floating.current?.contains(target) || referenceContains) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, refs.floating, refs.reference]);

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Notifications"
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
          className,
        )}
      >
        <IconBell size={16} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-bui-2xs font-semibold text-primary-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className={cn(
            "z-50 flex w-80 max-w-[90vw] flex-col rounded-xl border border-border bg-card shadow-xl",
            panelClassName,
          )}
        >
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
            <span className="text-bui-sm font-medium text-foreground">Notifications</span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-bui-xs text-muted-foreground hover:text-foreground"
                >
                  Mark all read
                </button>
              )}
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-bui-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto p-1.5">
            {history.length === 0 ? (
              <p className="px-2 py-6 text-center text-bui-sm text-muted-foreground/60">
                No notifications yet
              </p>
            ) : (
              <ul className="flex list-none flex-col gap-0.5">
                {history.map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}

NotificationInbox.displayName = "NotificationInbox";
