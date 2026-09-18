"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import type { DocBlockInstall } from "@/content/docs/doc-schema";
import { CodeBlock } from "./code-block";

export function InstallBlock({
  registryName,
  optionalSteps,
  className,
}: DocBlockInstall & { className?: string }) {
  const [copied, setCopied] = useState(false);
  const command = `npx shadcn@latest add https://bevelui.vercel.app/r/${registryName}.json`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable — no-op.
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "group flex items-center gap-2 overflow-x-auto rounded-md border border-border/70",
          "bg-muted/40 px-3.5 py-2.5 text-left font-mono text-bui-base text-foreground/90",
          "hover:border-border hover:bg-muted/60",
        )}
      >
        <span className="select-none text-muted-foreground">$</span>
        <span className="whitespace-nowrap">{command}</span>
        <span className="ml-auto shrink-0 pl-2 text-muted-foreground group-hover:text-foreground">
          {copied ? (
            <IconCheck size={14} strokeWidth={2} />
          ) : (
            <IconCopy size={14} strokeWidth={1.9} />
          )}
        </span>
      </button>

      {optionalSteps && optionalSteps.length > 0 && (
        <div className="flex flex-col gap-3 border-l border-border/70 pl-3.5">
          {optionalSteps.map((step, i) => (
            <div key={i}>
              <p className="text-bui-base font-medium text-foreground">{step.title}</p>
              {step.note && (
                <p className="mt-0.5 text-bui-sm leading-relaxed text-muted-foreground">
                  {step.note}
                </p>
              )}
              {step.code && (
                <CodeBlock code={step.code} language="bash" className="mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
