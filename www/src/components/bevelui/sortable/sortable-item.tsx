"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { SortableHandleCtx, useSortableRoot } from "./sortable-context";

export interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  /**
   * When true, only <SortableHandle> inside this item starts a drag.
   * Overrides SortableRoot's config.handle for this item.
   */
  handle?: boolean;
}

export function SortableItem({
  id,
  children,
  className,
  disabled,
  handle: handleProp,
}: SortableItemProps) {
  // useSortableRoot throws a named error. The original did
  // `React.useContext(SortableCtx)!`, so using an item outside a root failed
  // with "cannot read property 'config' of null" instead of saying what was
  // actually wrong.
  const { config, activeId } = useSortableRoot();
  const useHandle = handleProp ?? config.handle ?? false;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  // In handle mode the drag attributes (role, tabIndex, aria-roledescription)
  // belong on the handle, not the wrapper. The original spread them onto the
  // wrapper regardless, so keyboard focus landed on an element that announced
  // itself as draggable but carried none of the listeners — keyboard sorting
  // was unreachable whenever a handle was used.
  const handleContext = React.useMemo(
    () =>
      useHandle
        ? {
            listeners,
            attributes,
            setActivatorNodeRef,
          }
        : null,
    [useHandle, listeners, attributes, setActivatorNodeRef],
  );

  return (
    <SortableHandleCtx.Provider value={handleContext}>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        data-dragging={isDragging || undefined}
        data-active={activeId === id || undefined}
        className={cn(
          "touch-none select-none",
          isDragging && "opacity-40",
          className,
        )}
        {...(useHandle ? {} : attributes)}
        {...(useHandle ? {} : listeners)}
      >
        {children}
      </div>
    </SortableHandleCtx.Provider>
  );
}

SortableItem.displayName = "SortableItem";
