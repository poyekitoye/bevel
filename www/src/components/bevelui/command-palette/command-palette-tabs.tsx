"use client";

import * as React from "react";
import { motion } from "motion/react";
import { IconFilter, IconPlus, IconSortAscending } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useCommandPalette } from "./command-palette-context";
import { usePrefersReducedMotion } from "../lib/use-element-rect";
import type { CommandPaletteSourceTab, CommandPaletteFilterTab } from "./types";

/**
 * Roving-tabindex handler for a horizontal tab strip: one tab stop for the
 * group, arrows to move between tabs, Home/End to jump. The original rendered
 * plain buttons, so every tab was its own tab stop and none announced itself
 * as a tab.
 */
function useTabKeyboard(ids: string[], active: string, select: (id: string) => void) {
  return React.useCallback(
    (e: React.KeyboardEvent) => {
      const index = ids.indexOf(active);
      if (index === -1) return;

      let next: number | null = null;
      if (e.key === "ArrowRight") next = (index + 1) % ids.length;
      else if (e.key === "ArrowLeft") next = (index - 1 + ids.length) % ids.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = ids.length - 1;

      if (next !== null) {
        e.preventDefault();
        e.stopPropagation();
        select(ids[next]);
      }
    },
    [ids, active, select],
  );
}

// ─── Source tabs ──────────────────────────────────────────────────────────────

function SourceTabItem({
  tab,
  isActive,
  onClick,
  reduceMotion,
}: {
  tab: CommandPaletteSourceTab;
  isActive: boolean;
  onClick: () => void;
  reduceMotion: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      title={tab.label}
      className={cn(
        "relative z-[1] flex shrink-0 items-center justify-center gap-2 rounded-sm px-2.5 py-1 text-bui-sm font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {tab.logoSrc && tab.id !== "all" && (
        <img
          src={tab.logoSrc}
          alt=""
          aria-hidden
          className="size-4 rounded-sm object-contain"
        />
      )}
      {tab.icon && !tab.logoSrc && <span aria-hidden>{tab.icon}</span>}
      <span>{tab.label}</span>

      {isActive && (
        <motion.span
          layoutId="bui-source-tab-indicator"
          aria-hidden
          className="absolute inset-0 rounded-sm border border-border/80 bg-muted/60"
          style={{ zIndex: -1 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 400, damping: 30 }
          }
        />
      )}
    </button>
  );
}

export interface CommandPaletteSourceTabsProps {
  tabs: CommandPaletteSourceTab[];
  /** Omit to hide the add button entirely. */
  onAddSource?: () => void;
}

export function CommandPaletteSourceTabs({
  tabs,
  onAddSource,
}: CommandPaletteSourceTabsProps) {
  const { activeSourceTab, setSourceTab } = useCommandPalette();
  const reduceMotion = usePrefersReducedMotion();
  const ids = React.useMemo(() => tabs.map((t) => t.id), [tabs]);
  const onKeyDown = useTabKeyboard(ids, activeSourceTab, setSourceTab);

  return (
    <div className="flex items-center gap-1 border-b border-border/60 px-3 py-1.5">
      <div
        role="tablist"
        aria-label="Sources"
        onKeyDown={onKeyDown}
        className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
      >
        {tabs.map((tab) => (
          <SourceTabItem
            key={tab.id}
            tab={tab}
            isActive={activeSourceTab === tab.id}
            onClick={() => setSourceTab(tab.id)}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      {/* Rendered only when it does something — the original always drew it. */}
      {onAddSource && (
        <button
          type="button"
          onClick={onAddSource}
          aria-label="Add source"
          className="ml-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <IconPlus size={14} strokeWidth={2} aria-hidden />
        </button>
      )}
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

function FilterTabItem({
  tab,
  isActive,
  onClick,
  reduceMotion,
}: {
  tab: CommandPaletteFilterTab;
  isActive: boolean;
  onClick: () => void;
  reduceMotion: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      className={cn(
        "relative flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-bui-sm font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
      )}
    >
      {tab.icon && <span aria-hidden className="leading-none">{tab.icon}</span>}
      {tab.label}

      {isActive && (
        <motion.span
          layoutId="bui-filter-tab-underline"
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 400, damping: 30 }
          }
        />
      )}
    </button>
  );
}

export interface CommandPaletteFilterTabsProps {
  tabs: CommandPaletteFilterTab[];
  onFilter?: () => void;
  onSort?: () => void;
}

export function CommandPaletteFilterTabs({
  tabs,
  onFilter,
  onSort,
}: CommandPaletteFilterTabsProps) {
  const { activeFilterTab, setFilterTab } = useCommandPalette();
  const reduceMotion = usePrefersReducedMotion();
  const ids = React.useMemo(() => tabs.map((t) => t.id), [tabs]);
  const onKeyDown = useTabKeyboard(ids, activeFilterTab, setFilterTab);

  return (
    <div className="flex items-center gap-0.5 border-b border-border/60 px-2 py-1">
      <div
        role="tablist"
        aria-label="Filters"
        onKeyDown={onKeyDown}
        className="no-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
      >
        {tabs.map((tab) => (
          <FilterTabItem
            key={tab.id}
            tab={tab}
            isActive={activeFilterTab === tab.id}
            onClick={() => setFilterTab(tab.id)}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      {(onFilter || onSort) && (
        <div className="ml-1 flex shrink-0 items-center gap-1 border-l border-border/50 pl-1">
          {onFilter && (
            <button
              type="button"
              onClick={onFilter}
              aria-label="Filter results"
              className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <IconFilter size={15} aria-hidden />
            </button>
          )}
          {onSort && (
            <button
              type="button"
              onClick={onSort}
              aria-label="Sort results"
              className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <IconSortAscending size={15} aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
