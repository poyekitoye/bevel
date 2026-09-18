"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export type CodeBlockProps = {
  code: string;
  language?: string;
  filename?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
  className?: string;
};

/**
 * Deliberately dependency-free: no syntax highlighter is assumed, since
 * guessing wrong (Shiki vs Prism vs rehype-pretty-code) would ship a broken
 * import. Drop a `highlight(code, language) => React.ReactNode` call in here
 * if you already have one wired up elsewhere — everything else (copy button,
 * filename tab, line highlight backgrounds, line numbers, horizontal scroll
 * on mobile) is done.
 */
export function CodeBlock({
  code,
  language,
  filename,
  highlightLines = [],
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n");
  const highlightSet = new Set(highlightLines);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable — no-op.
    }
  }

  return (
    <div
      className={cn(
        "group/code overflow-hidden rounded-md border border-border/70 bg-[#0d1117] dark:bg-[#0a0d12]",
        className,
      )}
    >
      {(filename || language) && (
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3.5 py-1.5">
          <span className="truncate font-mono text-bui-xs text-white/50">
            {filename ?? language}
          </span>
          {filename && language && (
            <span className="shrink-0 font-mono text-bui-2xs uppercase tracking-wide text-white/30">
              {language}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className={cn(
            "absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-md",
            "border border-white/10 bg-white/5 text-white/50 backdrop-blur-sm transition-colors",
            "hover:bg-white/10 hover:text-white/90",
            "opacity-0 group-hover/code:opacity-100 focus-visible:opacity-100",
          )}
        >
          {copied ? (
            <IconCheck size={13.5} strokeWidth={2} />
          ) : (
            <IconCopy size={13.5} strokeWidth={1.9} />
          )}
        </button>

        <pre className="overflow-x-auto px-3.5 py-3 text-bui-sm leading-relaxed">
          <code className="font-mono">
            {lines.map((line, i) => {
              const lineNumber = i + 1;
              const isHighlighted = highlightSet.has(lineNumber);
              return (
                <div
                  key={i}
                  className={cn(
                    "flex min-w-fit",
                    isHighlighted && "bg-primary/10",
                    isHighlighted && "-mx-3.5 px-3.5",
                    isHighlighted && "border-l-2 border-primary",
                    isHighlighted && "-ml-3.5 pl-[calc(0.875rem-2px)]",
                  )}
                >
                  {showLineNumbers && (
                    <span className="mr-4 shrink-0 select-none text-white/25">
                      {String(lineNumber).padStart(2, " ")}
                    </span>
                  )}
                  <span className="whitespace-pre text-white/85">
                    {line || "\u00A0"}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
