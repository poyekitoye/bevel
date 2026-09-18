"use client";

import * as React from "react";
import { IconLoader2, IconSearch, IconSparkles, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useCommandPalette } from "./command-palette-context";

export interface CommandPaletteSearchbarProps {
  placeholder?: string;
  /**
   * Renders the AI action. Omit it and the button is not rendered at all —
   * the original always drew a sparkles button with no handler attached.
   */
  onAskAI?: (query: string) => void;
  aiLabel?: string;
}

export function CommandPaletteSearchbar({
  placeholder = "Type a command or search…",
  onAskAI,
  aiLabel = "Ask AI",
}: CommandPaletteSearchbarProps) {
  const {
    query,
    setQuery,
    close,
    isLoading,
    moveUp,
    moveDown,
    selectHighlighted,
    flatResults,
    highlightedIndex,
  } = useCommandPalette();

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // rAF rather than a bare setTimeout(50): fires on the next paint, so the
    // input is focused as soon as it exists instead of after a guessed delay.
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, []);

  const activeId = flatResults[highlightedIndex]?.id;

  // Navigation lives on the input, not on window — so an inline palette no
  // longer eats Arrow/Enter/Escape for the rest of the page.
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

  return (
    <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
      <span className="shrink-0 text-muted-foreground" aria-hidden>
        {isLoading ? (
          <IconLoader2 size={17} strokeWidth={1.8} className="animate-spin" />
        ) : (
          // The original showed a check-circle here — a search field with a
          // tick where the magnifier belongs.
          <IconSearch size={17} strokeWidth={1.8} />
        )}
      </span>

      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-bui-md text-foreground outline-none placeholder:text-muted-foreground/60"
        role="combobox"
        aria-expanded
        aria-controls="bui-command-results"
        aria-autocomplete="list"
        aria-activedescendant={activeId ? `bui-cmd-${activeId}` : undefined}
        aria-label={placeholder}
        autoComplete="off"
        spellCheck={false}
      />

      {/* One button, one meaning. The original swapped a clear action and a
          close action behind the same icon in the same position. */}
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <IconX size={14} strokeWidth={2} aria-hidden />
        </button>
      ) : (
        <button
          type="button"
          onClick={close}
          aria-label="Close command palette"
          className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <IconX size={14} strokeWidth={2} aria-hidden />
        </button>
      )}

      {onAskAI && (
        <>
          <Separator orientation="vertical" className="h-4 shrink-0" />
          <button
            type="button"
            onClick={() => onAskAI(query)}
            aria-label={aiLabel}
            title={aiLabel}
            className={cn(
              "shrink-0 rounded p-0.5 text-primary transition-colors hover:text-primary/80",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            )}
          >
            <IconSparkles size={17} strokeWidth={1.8} aria-hidden />
          </button>
        </>
      )}
    </div>
  );
}

CommandPaletteSearchbar.displayName = "CommandPaletteSearchbar";
