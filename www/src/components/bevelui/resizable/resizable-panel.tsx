"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useResizable } from "./resizable-context";

export interface ResizablePanelProps {
  index: number;
  children: React.ReactNode;
  className?: string;
}

export function ResizablePanel({
  index,
  children,
  className,
}: ResizablePanelProps) {
  const { direction, collapsed, sizes, panelConfigs, isDragging } =
    useResizable();

  const config = panelConfigs[index];
  const isCollapsed = collapsed[index] ?? false;

  // Fall back to this panel's own size, not a hardcoded third. The original
  // used `var(--panel-N, 33.33%)`, so a 50/50 split flashed at 33% on every
  // mount until the layout effect wrote the real value.
  const fallback = sizes[index] ?? 100 / Math.max(1, sizes.length);
  const sizeVar = `var(--panel-${index}, ${fallback}%)`;
  const axis = direction === "horizontal" ? "width" : "height";

  return (
    <div
      className={cn("min-h-0 min-w-0 overflow-hidden", className)}
      style={{
        [axis]: isCollapsed ? `${config?.collapsedSize ?? 0}%` : sizeVar,
        flex: "0 0 auto",
        // Animate collapse *and* expand. The original only set a transition
        // while collapsed, so expanding snapped.
        transition: isDragging ? undefined : `${axis} 200ms ease`,
      }}
    >
      {children}
    </div>
  );
}

ResizablePanel.displayName = "ResizablePanel";
