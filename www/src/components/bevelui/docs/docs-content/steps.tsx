import * as React from "react";
import { cn } from "@/lib/utils";
import type { DocBlockSteps } from "@/content/docs/doc-schema";
import { CodeBlock } from "./code-block";

export function Steps({ steps, className }: DocBlockSteps & { className?: string }) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li key={i} className="relative flex gap-3.5 pb-6 last:pb-0">
            {/* Connecting line */}
            {!isLast && (
              <span className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-border" />
            )}

            <span className="relative z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-border bg-card font-mono text-bui-xs font-semibold text-foreground">
              {i + 1}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-bui-md font-medium text-foreground">{step.title}</p>
              {step.description && (
                <p className="mt-1 text-bui-base leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              )}
              {step.code && (
                <CodeBlock
                  code={step.code}
                  language={step.codeLanguage}
                  filename={step.codeFilename}
                  className="mt-3"
                />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
