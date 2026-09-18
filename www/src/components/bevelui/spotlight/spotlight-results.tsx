"use client";

import * as React from "react";
import { useSpotlight } from "./spotlight-context";
import { SpotlightResultItem } from "./spotlight-result-item";
import { SpotlightSkeleton } from "./spotlight-skeleton";
import type { SpotlightConfig } from "./types";

export function SpotlightResults({ config }: { config: SpotlightConfig }) {
  const { visibleResults, isLoading, activeCategory, highlightedIndex, query } =
    useSpotlight();

  if (isLoading && visibleResults.length === 0) return <SpotlightSkeleton />;

  if (visibleResults.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 px-4 py-12 text-center">
        <p className="text-bui-base text-muted-foreground">
          No results for “{query}”
        </p>
        <p className="text-bui-xs text-muted-foreground/60">
          Try a different term{activeCategory !== "all" && " or switch category"}.
        </p>
      </div>
    );
  }

  // Group only when showing everything and there is more than one group.
  const grouped = new Map<string, typeof visibleResults>();
  for (const r of visibleResults) {
    const list = grouped.get(r.category);
    if (list) list.push(r);
    else grouped.set(r.category, [r]);
  }
  const showGroups = activeCategory === "all" && grouped.size > 1;

  let cursor = 0;

  return (
    <div
      id="bui-spotlight-results"
      role="listbox"
      aria-label="Search results"
      className="flex flex-col py-2"
    >
      {showGroups
        ? Array.from(grouped.entries()).map(([catId, items]) => {
            const start = cursor;
            cursor += items.length;
            const cat = config.categories.find((c) => c.id === catId);

            return (
              <div key={catId} role="group" aria-labelledby={`bui-spot-g-${catId}`}>
                <div className="px-4 pb-1 pt-2">
                  <span
                    id={`bui-spot-g-${catId}`}
                    className="text-bui-2xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {cat?.label ?? catId}
                  </span>
                </div>
                {items.map((r, i) => (
                  <SpotlightResultItem
                    key={r.id}
                    result={r}
                    index={start + i}
                    isHighlighted={start + i === highlightedIndex}
                  />
                ))}
              </div>
            );
          })
        : visibleResults.map((r, i) => (
            <SpotlightResultItem
              key={r.id}
              result={r}
              index={i}
              isHighlighted={i === highlightedIndex}
            />
          ))}
    </div>
  );
}

SpotlightResults.displayName = "SpotlightResults";
