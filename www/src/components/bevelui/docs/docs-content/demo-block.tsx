"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconPlayerPlay, IconCode } from "@tabler/icons-react";
import type { DocBlockDemo } from "@/content/docs/doc-schema";
import { CodeBlock } from "./code-block";

export type DemoRegistry = Record<string, React.ComponentType>;

export function DemoBlock({
  component,
  label,
  code,
  codeFilename,
  registry,
  className,
}: DocBlockDemo & { registry?: DemoRegistry; className?: string }) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const Component = registry?.[component];

  return (
    <div className={cn("overflow-hidden rounded-md border border-border/70", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-muted/30 px-3 py-1.5">
        <span className="truncate text-bui-sm font-medium text-muted-foreground">
          {label ?? "Demo"}
        </span>

        {code && (
          <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-border/70 bg-card p-0.5">
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={cn(
                "flex items-center gap-1 rounded-[4px] px-2 py-1 text-bui-xs font-medium transition-colors",
                tab === "preview"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <IconPlayerPlay size={11} strokeWidth={2} />
              Preview
            </button>
            <button
              type="button"
              onClick={() => setTab("code")}
              className={cn(
                "flex items-center gap-1 rounded-[4px] px-2 py-1 text-bui-xs font-medium transition-colors",
                tab === "code"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <IconCode size={11} strokeWidth={2} />
              Code
            </button>
          </div>
        )}
      </div>

      {tab === "preview" ? (
        <div className="flex min-h-[180px] items-center justify-center overflow-x-auto bg-[radial-gradient(circle,theme(colors.border/40)_1px,transparent_1px)] bg-[length:16px_16px] p-6 sm:p-10">
          {Component ? (
            <Component />
          ) : (
            <p className="text-bui-sm text-muted-foreground">
              No demo registered for{" "}
              <code className="font-mono text-foreground">{component}</code>
            </p>
          )}
        </div>
      ) : (
        <CodeBlock
          code={code ?? ""}
          filename={codeFilename}
          className="rounded-none border-none"
        />
      )}
    </div>
  );
}
