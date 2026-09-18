"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDiffViewerCtx } from "./diff-viewer-context";
import { LazyHunk } from "./lazy-hunk";

export interface DiffViewerLayoutProps {
  className?: string;
}

export function DiffViewerLayout({ className }: DiffViewerLayoutProps) {
  const { hunks, stats, viewMode, setViewMode, resolveAll, config } = useDiffViewerCtx();

  const totalLines = React.useMemo(() => hunks.reduce((n, h) => n + h.lines.length, 0), [hunks]);
  const virtualize = totalLines > config.virtualizeThreshold;

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border border-border bg-card/60", className)}>
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
        <div className="flex items-center gap-3 text-bui-xs">
          <span className="text-emerald-500">+{stats.additions}</span>
          <span className="text-red-500">−{stats.deletions}</span>
          {stats.conflicts > 0 && <span className="text-amber-500">{stats.conflicts} conflicts</span>}
        </div>

        <div className="flex items-center gap-2">
          {stats.conflicts > 0 && (
            <>
              <button
                type="button"
                onClick={() => resolveAll("ours")}
                className="text-bui-xs text-muted-foreground hover:text-foreground"
              >
                Accept all ours
              </button>
              <button
                type="button"
                onClick={() => resolveAll("theirs")}
                className="text-bui-xs text-muted-foreground hover:text-foreground"
              >
                Accept all theirs
              </button>
              <div className="h-3 w-px bg-border" />
            </>
          )}
          <div className="flex items-center gap-1 rounded-md border border-border bg-background/60 p-0.5">
            {(["split", "unified"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={cn(
                  "rounded px-2 py-0.5 text-bui-xs font-medium capitalize transition-colors",
                  viewMode === m ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {hunks.map((hunk) => (
          <LazyHunk key={hunk.id} hunk={hunk} active={virtualize} />
        ))}
      </div>
    </div>
  );
}

DiffViewerLayout.displayName = "DiffViewerLayout";
