"use client";

import * as React from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useDiffViewerCtx } from "./diff-viewer-context";
import { DiffLineRow } from "./diff-line-row";
import type { DiffHunk, DiffLine } from "./types";

export interface DiffHunkViewProps {
  hunk: DiffHunk;
}

function pairForSplit(lines: DiffLine[]): { left: DiffLine | null; right: DiffLine | null }[] {
  const removed = lines.filter((l) => l.type === "removed");
  const added = lines.filter((l) => l.type === "added");
  const rows: { left: DiffLine | null; right: DiffLine | null }[] = [];
  const max = Math.max(removed.length, added.length);
  for (let i = 0; i < max; i++) {
    rows.push({ left: removed[i] ?? null, right: added[i] ?? null });
  }
  return rows;
}

export function DiffHunkView({ hunk }: DiffHunkViewProps) {
  const { viewMode, collapsedContextIds, toggleContext, resolveConflict, resolutions } = useDiffViewerCtx();

  if (hunk.kind === "unchanged") {
    const isCollapsed = collapsedContextIds.has(hunk.id);
    if (isCollapsed) {
      return (
        <button
          type="button"
          onClick={() => toggleContext(hunk.id)}
          className="flex w-full items-center gap-2 border-y border-border/60 bg-muted/30 px-3 py-1.5 text-bui-xs text-muted-foreground hover:bg-muted/50"
        >
          <IconChevronDown size={12} />
          {hunk.lines.length} unchanged lines
        </button>
      );
    }

    return (
      <div>
        {hunk.lines.length > 6 && (
          <button
            type="button"
            onClick={() => toggleContext(hunk.id)}
            className="flex w-full items-center gap-2 border-b border-border/40 bg-muted/20 px-3 py-1 text-bui-2xs text-muted-foreground/70 hover:bg-muted/40"
          >
            <IconChevronUp size={11} />
            Collapse
          </button>
        )}
        {viewMode === "unified"
          ? hunk.lines.map((l, i) => <DiffLineRow key={i} line={l} showLineNumber={l.originalLineNumber} />)
          : hunk.lines.map((l, i) => (
              <div key={i} className="grid grid-cols-2">
                <DiffLineRow line={l} showLineNumber={l.originalLineNumber} />
                <DiffLineRow line={l} showLineNumber={l.modifiedLineNumber} />
              </div>
            ))}
      </div>
    );
  }

  if (hunk.kind === "change") {
    if (viewMode === "unified") {
      return (
        <div>
          {hunk.lines.map((l, i) => (
            <DiffLineRow key={i} line={l} showLineNumber={l.originalLineNumber ?? l.modifiedLineNumber} />
          ))}
        </div>
      );
    }
    const rows = pairForSplit(hunk.lines);
    return (
      <div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-2">
            <DiffLineRow line={r.left} showLineNumber={r.left?.originalLineNumber ?? null} />
            <DiffLineRow line={r.right} showLineNumber={r.right?.modifiedLineNumber ?? null} />
          </div>
        ))}
      </div>
    );
  }

  // kind === "conflict"
  const conflict = hunk.conflict!;
  const resolution = resolutions[hunk.id];

  return (
    <div className="my-1 overflow-hidden rounded-lg border border-amber-500/40">
      <div className="flex items-center justify-between bg-amber-500/10 px-3 py-1.5">
        <span className="text-bui-xs font-medium text-amber-600">Conflict</span>
        {resolution && (
          <span className="text-bui-2xs text-muted-foreground">
            Resolved: {resolution === "both" ? "both" : resolution}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 divide-x divide-border">
        <div>
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-3 py-1">
            <span className="text-bui-2xs font-medium text-muted-foreground">Ours</span>
            <button
              type="button"
              onClick={() => resolveConflict(hunk.id, "ours")}
              className={cn(
                "rounded px-1.5 py-0.5 text-bui-2xs font-medium transition-colors",
                resolution === "ours" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Accept
            </button>
          </div>
          {conflict.ours.map((l, i) => (
            <DiffLineRow key={i} line={l} showLineNumber={null} />
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-3 py-1">
            <span className="text-bui-2xs font-medium text-muted-foreground">Theirs</span>
            <button
              type="button"
              onClick={() => resolveConflict(hunk.id, "theirs")}
              className={cn(
                "rounded px-1.5 py-0.5 text-bui-2xs font-medium transition-colors",
                resolution === "theirs" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Accept
            </button>
          </div>
          {conflict.theirs.map((l, i) => (
            <DiffLineRow key={i} line={l} showLineNumber={null} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border/60 bg-muted/20 px-3 py-1.5">
        <button
          type="button"
          onClick={() => resolveConflict(hunk.id, "both")}
          className={cn(
            "rounded px-2 py-1 text-bui-2xs font-medium transition-colors",
            resolution === "both" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Accept both
        </button>
        <button
          type="button"
          onClick={() => resolveConflict(hunk.id, "base")}
          className={cn(
            "rounded px-2 py-1 text-bui-2xs font-medium transition-colors",
            resolution === "base" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Keep original
        </button>
      </div>
    </div>
  );
}

DiffHunkView.displayName = "DiffHunkView";
