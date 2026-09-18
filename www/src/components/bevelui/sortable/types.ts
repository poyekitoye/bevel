import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

export type { DraggableAttributes, SyntheticListenerMap };

export type SortableBaseItem = { id: string };

export interface SortableConfig {
  /** Restrict dragging to a <SortableHandle> inside each item. */
  handle?: boolean;
  /**
   * "list" (default) — vertical strategy with an axis lock.
   * "grid" — rect strategy, free movement in both axes.
   */
  layout?: "list" | "grid";
}

export interface SortableContextValue {
  activeId: string | null;
  config: SortableConfig;
}
