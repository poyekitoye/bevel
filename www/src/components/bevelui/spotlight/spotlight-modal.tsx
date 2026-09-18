"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { IconLoader2, IconSearch, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useSpotlight } from "./spotlight-context";
import { SpotlightResults } from "./spotlight-results";
import { SpotlightEmpty } from "./spotlight-empty";
import {
  useDismissableLayer,
  useMounted,
} from "../lib/use-dismissable-layer";
import { usePrefersReducedMotion } from "../lib/use-element-rect";
import type { SpotlightConfig } from "./types";

// ─── Category tabs ────────────────────────────────────────────────────────────

function CategoryTabs({
  categories,
}: {
  categories: SpotlightConfig["categories"];
}) {
  const { activeCategory, setCategory, results } = useSpotlight();

  const tabs = React.useMemo(
    () => [{ id: "all", label: "All" }, ...categories],
    [categories],
  );

  const counts = React.useMemo(() => {
    const map = new Map<string, number>([["all", results.length]]);
    for (const r of results) {
      map.set(r.category, (map.get(r.category) ?? 0) + 1);
    }
    return map;
  }, [results]);

  function onKeyDown(e: React.KeyboardEvent) {
    const index = tabs.findIndex((t) => t.id === activeCategory);
    if (index === -1) return;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (next !== null) {
      e.preventDefault();
      e.stopPropagation();
      setCategory(tabs[next].id);
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Result categories"
      onKeyDown={onKeyDown}
      className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-border/40 px-3 py-2"
    >
      {tabs.map((cat) => {
        const count = counts.get(cat.id) ?? 0;
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            // A tab that can only ever show nothing is not worth offering.
            disabled={count === 0 && cat.id !== "all"}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-1 text-bui-xs font-medium",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "disabled:cursor-not-allowed disabled:opacity-40",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {cat.label}
            <span
              className={cn(
                "font-mono text-bui-2xs tabular-nums",
                isActive ? "text-primary/60" : "text-muted-foreground/40",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function SpotlightModal() {
  const {
    config,
    isOpen,
    close,
    query,
    setQuery,
    isLoading,
    moveUp,
    moveDown,
    selectHighlighted,
    visibleResults,
    highlightedIndex,
  } = useSpotlight();

  const mounted = useMounted();
  const reduceMotion = usePrefersReducedMotion();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const layerRef = useDismissableLayer<HTMLDivElement>({
    open: isOpen,
    onDismiss: close,
    closeOnEscape: false, // the input clears the query first
    initialFocusRef: inputRef,
  });

  const hasQuery = query.trim().length > 0;
  const activeId = visibleResults[highlightedIndex]?.id;

  // The footer has always advertised "↑↓ navigate ⏎ open". None of it was
  // implemented — the context had no highlight state and no key handlers.
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveDown();
        break;
      case "ArrowUp":
        e.preventDefault();
        moveUp();
        break;
      case "Enter":
        e.preventDefault();
        selectHighlighted();
        break;
      case "Escape":
        e.preventDefault();
        if (query) setQuery("");
        else close();
        break;
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            style={{ zIndex: "var(--z-bui-overlay)" }}
            onClick={close}
          />

          <motion.div
            initial={
              reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.97, y: -8 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.97, y: -8 }
            }
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
            className="fixed inset-x-0 top-0 flex justify-center px-3 pt-[8svh] sm:px-4 sm:pt-[10vh]"
            style={{ zIndex: "var(--z-bui-modal)" }}
            onClick={close}
          >
            <div
              ref={layerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "flex w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-popover shadow-2xl",
                // Sized to content up to a ceiling, rather than the original's
                // fixed 400px floor that left a large gap under the empty state.
                "max-h-[80svh]",
              )}
            >
              <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
                <span className="shrink-0 text-muted-foreground/60" aria-hidden>
                  {isLoading ? (
                    <IconLoader2 size={17} className="animate-spin" />
                  ) : (
                    <IconSearch size={17} />
                  )}
                </span>

                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={config.placeholder ?? "Search anything…"}
                  className="flex-1 bg-transparent text-bui-md text-foreground outline-none placeholder:text-muted-foreground/50"
                  role="combobox"
                  aria-expanded={hasQuery}
                  aria-controls="bui-spotlight-results"
                  aria-autocomplete="list"
                  aria-activedescendant={
                    activeId ? `bui-spot-${activeId}` : undefined
                  }
                  aria-label={config.placeholder ?? "Search"}
                  autoComplete="off"
                  spellCheck={false}
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="shrink-0 rounded p-0.5 text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <IconX size={14} aria-hidden />
                  </button>
                )}
              </div>

              {config.categories.length > 0 && hasQuery && (
                <CategoryTabs categories={config.categories} />
              )}

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {hasQuery ? <SpotlightResults config={config} /> : <SpotlightEmpty />}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border/40 bg-muted/20 px-4 py-2">
                <div className="no-scrollbar flex items-center gap-3 overflow-x-auto font-mono text-bui-2xs text-muted-foreground/50">
                  <span>↑↓ navigate</span>
                  <span>⏎ open</span>
                  <span>esc close</span>
                </div>
                <span className="font-mono text-bui-2xs text-muted-foreground/30">
                  Spotlight
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

SpotlightModal.displayName = "SpotlightModal";
