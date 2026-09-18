import type React from "react";

export interface ResizablePanelConfig {
  /** Percentage. Default 5. */
  minSize?: number;
  /** Percentage. Default 95. */
  maxSize?: number;
  collapsible?: boolean;
  /** Percentage when collapsed. Default 0. */
  collapsedSize?: number;
  defaultCollapsed?: boolean;
}

export interface ResizableContextValue {
  sizes: number[];
  collapsed: boolean[];
  direction: "horizontal" | "vertical";
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** True while a handle is being dragged. */
  isDragging: boolean;
  /** Imperative resize during drag — writes CSS vars, bypassing React. */
  setSizeDirect: (index: number, size: number) => void;
  /** Commits the final sizes to React state. */
  commitSizes: (sizes: number[]) => void;
  /** Suspends state→DOM mirroring for the duration of a gesture. */
  beginDrag: () => void;
  endDrag: () => void;
  toggleCollapse: (panelIndex: number) => void;
  panelConfigs: ResizablePanelConfig[];
}
