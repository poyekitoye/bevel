"use client";

import * as React from "react";
import { IconClock, IconSearch, IconX } from "@tabler/icons-react";
import { useSpotlight } from "./spotlight-context";

export function SpotlightEmpty() {
  const { config, recentSearches, setQuery, removeRecent, clearHistory } =
    useSpotlight();

  if (recentSearches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
        <IconSearch size={20} className="text-muted-foreground/30" aria-hidden />
        <p className="text-bui-base text-muted-foreground/50">
          {config.emptyHint ?? "Start typing to search"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-2">
      <div className="flex items-center justify-between px-4 py-1.5">
        <span className="font-mono text-bui-2xs uppercase tracking-widest text-muted-foreground/40">
          Recent
        </span>
        <button
          type="button"
          onClick={clearHistory}
          className="rounded text-bui-2xs text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Clear all
        </button>
      </div>

      <ul className="flex list-none flex-col">
        {recentSearches.map((q) => (
          // Keyed by the query, not the index — index keys made removals
          // animate the wrong row out.
          <li key={q} className="group flex items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/40">
            <IconClock size={14} className="shrink-0 text-muted-foreground/30" aria-hidden />
            <button
              type="button"
              onClick={() => setQuery(q)}
              className="flex-1 truncate text-left text-bui-base text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none"
            >
              {q}
            </button>
            <button
              type="button"
              onClick={() => removeRecent(q)}
              aria-label={`Remove “${q}” from recent searches`}
              className="shrink-0 rounded p-0.5 text-muted-foreground/30 opacity-0 transition-all hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover:opacity-100 [@media(hover:none)]:opacity-100"
            >
              <IconX size={12} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

SpotlightEmpty.displayName = "SpotlightEmpty";
