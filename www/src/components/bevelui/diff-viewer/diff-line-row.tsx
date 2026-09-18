"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { DiffLine, DiffLineType } from "./types";

export interface DiffLineRowProps {
  /** null renders a blank placeholder row (unpaired side in split view). */
  line: DiffLine | null;
  showLineNumber?: number | null;
  /** Wrap long lines instead of scrolling them horizontally. */
  wrap?: boolean;
  /** Width of the line-number gutter in ch units. */
  gutterWidth?: number;
}

const TYPE_BG: Record<DiffLineType, string> = {
  added: "bg-emerald-500/10",
  removed: "bg-red-500/10",
  unchanged: "",
};

const TYPE_SIGN: Record<DiffLineType, string> = {
  added: "+",
  removed: "−",
  unchanged: " ",
};

const TYPE_LABEL: Record<DiffLineType, string> = {
  added: "Added line",
  removed: "Removed line",
  unchanged: "Unchanged line",
};

export function DiffLineRow({
  line,
  showLineNumber,
  wrap = false,
  gutterWidth = 4,
}: DiffLineRowProps) {
  if (!line) {
    return (
      <div className="flex min-h-5.5 items-center bg-muted/20" aria-hidden />
    );
  }

  return (
    <div
      className={cn(
        "flex font-mono text-bui-sm",
        // A fixed h-5.5 made wrapping impossible; min-height keeps the
        // single-line rhythm while letting a wrapped line grow.
        wrap ? "min-h-5.5 items-start" : "h-5.5 items-center",
        TYPE_BG[line.type],
      )}
    >
      <span
        className="shrink-0 select-none pr-2 text-right leading-5.5 text-muted-foreground/40 tabular-nums"
        style={{ width: `${gutterWidth + 2}ch` }}
        aria-hidden
      >
        {showLineNumber ?? ""}
      </span>

      <span
        className={cn(
          "w-4 shrink-0 select-none text-center leading-5.5",
          line.type === "added" && "text-emerald-500",
          line.type === "removed" && "text-red-500",
        )}
        aria-hidden
      >
        {TYPE_SIGN[line.type]}
      </span>

      {/* The original combined `truncate` with `whitespace-pre`. truncate sets
          white-space: nowrap, whitespace-pre overrode it, and the result was a
          line clipped at the container edge with no ellipsis and no way to
          scroll — the rest of a long diff line was simply unreachable. */}
      <code
        className={cn(
          "min-w-0 flex-1 pr-3 leading-5.5",
          wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre",
        )}
      >
        <span className="sr-only">{TYPE_LABEL[line.type]}: </span>
        {line.wordSpans
          ? line.wordSpans.map((span, i) => (
              <span
                key={i}
                className={cn(
                  span.changed &&
                    "rounded-sm " +
                      (line.type === "added"
                        ? "bg-emerald-500/30"
                        : "bg-red-500/30"),
                )}
              >
                {span.text}
              </span>
            ))
          : line.content}
      </code>
    </div>
  );
}

DiffLineRow.displayName = "DiffLineRow";
