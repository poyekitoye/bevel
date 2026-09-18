"use client";

import * as React from "react";
import { IconGripVertical } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useSortableHandle } from "./sortable-context";

export interface SortableHandleProps {
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
}

/**
 * Place inside <SortableItem handle> to restrict dragging to this control.
 * Renders a grip by default; pass children to replace it.
 *
 * The drag attributes now arrive here alongside the listeners, so this is the
 * single focusable, announceable activator — previously the wrapper carried
 * the ARIA while the handle carried the behaviour.
 */
export function SortableHandle({
  className,
  children,
  "aria-label": ariaLabel = "Drag to reorder",
}: SortableHandleProps) {
  const handle = useSortableHandle();

  return (
    <button
      ref={handle?.setActivatorNodeRef}
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "cursor-grab touch-none rounded p-1 text-muted-foreground/40 transition-colors active:cursor-grabbing",
        "hover:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      {...(handle?.attributes ?? {})}
      {...(handle?.listeners ?? {})}
    >
      {children ?? <IconGripVertical size={14} strokeWidth={1.8} aria-hidden />}
    </button>
  );
}

SortableHandle.displayName = "SortableHandle";
