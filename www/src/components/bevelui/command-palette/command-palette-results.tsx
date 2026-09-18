"use client";

import * as React from "react";
import { IconCornerDownLeft } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useCommandPalette } from "./command-palette-context";
import { highlightMatch } from "./command-palette-fuzzy";
import { getContrastColor } from "../lib/color";
import { usePrefersReducedMotion } from "../lib/use-element-rect";
import type { CommandPaletteItem } from "./types";

// ─── Avatar ───────────────────────────────────────────────────────────────────

function ItemAvatar({ item }: { item: CommandPaletteItem }) {
  if (typeof item.icon === "string") {
    return (
      <img
        src={item.icon}
        alt=""
        aria-hidden
        loading="lazy"
        className="size-8 shrink-0 rounded-full object-cover"
      />
    );
  }

  if (item.icon) {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-bui-md">
        {item.icon}
      </span>
    );
  }

  if (item.initials) {
    // The original hardcoded text-white over an arbitrary background and set
    // the fallback to hsl(var(--primary)) — but the theme stores oklch values,
    // so that wrapper produced an invalid colour.
    const background = item.initialsColor ?? "var(--primary)";
    const color = item.initialsColor
      ? getContrastColor(item.initialsColor)
      : "var(--primary-foreground)";

    return (
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-bui-xs font-semibold"
        style={{ background, color }}
      >
        {item.initials}
      </span>
    );
  }

  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-bui-xs font-semibold text-muted-foreground">
      {item.title.charAt(0).toUpperCase()}
    </span>
  );
}

// ─── Highlighting ─────────────────────────────────────────────────────────────

/**
 * Renders matched runs rather than one element per character. The original
 * emitted a node per character, so a 40-character title across 50 rows meant
 * ~2,000 DOM nodes rebuilt on every keystroke.
 */
function HighlightedText({ text, query }: { text: string; query: string }) {
  const segments = React.useMemo(
    () => highlightMatch(text, query),
    [text, query],
  );

  return (
    <>
      {segments.map((segment, i) =>
        segment.highlight ? (
          <mark
            key={i}
            className="bg-transparent font-semibold text-primary"
          >
            {segment.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{segment.text}</React.Fragment>
        ),
      )}
    </>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

interface ResultRowProps {
  item: CommandPaletteItem;
  query: string;
  index: number;
  isHighlighted: boolean;
}

const ResultRow = React.memo(function ResultRow({
  item,
  query,
  index,
  isHighlighted,
}: ResultRowProps) {
  const { selectItem, setHighlightedIndex } = useCommandPalette();
  const rowRef = React.useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (!isHighlighted) return;
    // "instant", not "smooth": smooth scrolling lags behind held arrow keys.
    rowRef.current?.scrollIntoView({
      block: "nearest",
      behavior: reduceMotion ? "auto" : "instant",
    });
  }, [isHighlighted, reduceMotion]);

  const content = (
    <>
      {(item.icon || item.initials) && <ItemAvatar item={item} />}

      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="truncate text-bui-md font-medium text-foreground">
          <HighlightedText text={item.title} query={query} />
        </span>
        {item.subtitle && (
          <>
            <span className="shrink-0 text-bui-md text-muted-foreground/50">
              ·
            </span>
            <span className="truncate text-bui-md text-muted-foreground">
              <HighlightedText text={item.subtitle} query={query} />
            </span>
          </>
        )}
      </span>

      <span className="flex shrink-0 items-center gap-2">
        {item.meta && (
          <span className="text-bui-sm text-muted-foreground">{item.meta}</span>
        )}
        {item.shortcut?.map((key) => (
          <kbd
            key={key}
            className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-bui-2xs text-muted-foreground"
          >
            {key}
          </kbd>
        ))}
        {isHighlighted && !item.shortcut && (
          <span className="flex size-5 items-center justify-center rounded border border-border/60 bg-background text-muted-foreground">
            <IconCornerDownLeft size={11} strokeWidth={2} aria-hidden />
          </span>
        )}
      </span>
    </>
  );

  const className = cn(
    "mx-1 flex w-[calc(100%-0.5rem)] items-center gap-3 rounded-md px-3 py-2 text-left",
    "transition-colors duration-75",
    isHighlighted ? "bg-muted/60" : "hover:bg-muted/40",
  );

  const shared = {
    id: `bui-cmd-${item.id}`,
    role: "option" as const,
    "aria-selected": isHighlighted,
    // Pointer moves set the highlight so mouse and keyboard agree on a target.
    onMouseMove: () => setHighlightedIndex(index),
    className,
  };

  // A real anchor when there is a destination: middle-click, "open in new
  // tab" and the status-bar URL preview all start working.
  if (item.href) {
    return (
      <a
        {...shared}
        ref={rowRef as React.RefObject<HTMLAnchorElement>}
        href={item.href}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        onClick={() => selectItem(item)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...shared}
      ref={rowRef as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={() => selectItem(item)}
    >
      {content}
    </button>
  );
});

// ─── Results ──────────────────────────────────────────────────────────────────

export function CommandPaletteResults({
  emptyMessage,
}: {
  emptyMessage?: string;
}) {
  const { filteredSections, flatResults, query, highlightedIndex, isLoading } =
    useCommandPalette();

  if (isLoading && flatResults.length === 0) {
    return (
      <div className="flex flex-col gap-1 p-3" aria-busy>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-md bg-muted/50"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    );
  }

  if (flatResults.length === 0) {
    return (
      <div
        id="bui-command-results"
        role="listbox"
        aria-label="Results"
        className="flex flex-col items-center justify-center gap-1 px-4 py-12 text-center"
      >
        <p className="text-bui-md text-muted-foreground">
          {query
            ? (emptyMessage ?? `No results for “${query}”`)
            : "Start typing to search…"}
        </p>
        {query && (
          <p className="text-bui-sm text-muted-foreground/60">
            Try a different term or clear the filters.
          </p>
        )}
      </div>
    );
  }

  let cursor = 0;

  return (
    <div
      id="bui-command-results"
      role="listbox"
      aria-label="Results"
      className="flex max-h-[min(24rem,50svh)] flex-col overflow-y-auto overscroll-contain py-2"
    >
      {filteredSections.map((section) => {
        const start = cursor;
        cursor += section.items.length;

        return (
          <div key={section.id} role="group" aria-labelledby={`bui-sec-${section.id}`}>
            <div className="flex items-center gap-2 px-4 pb-1 pt-3">
              <span
                id={`bui-sec-${section.id}`}
                className="text-bui-sm font-medium text-muted-foreground"
              >
                {section.title}
              </span>
              <span className="text-bui-sm text-muted-foreground/50">
                {section.items.length}
              </span>
            </div>

            {section.items.map((item, i) => (
              <ResultRow
                key={item.id}
                item={item}
                query={query}
                index={start + i}
                isHighlighted={start + i === highlightedIndex}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

CommandPaletteResults.displayName = "CommandPaletteResults";
