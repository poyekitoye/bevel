import * as React from "react";
import { cn } from "@/lib/utils";
import type { DocBlockPropsTable } from "@/content/docs/doc-schema";

export function PropsTable({ rows, className }: DocBlockPropsTable & { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-md border border-border/70", className)}>
      {/* Table — sm and up */}
      <table className="hidden w-full border-collapse text-left text-bui-base sm:table">
        <thead>
          <tr className="border-b border-border/70 bg-muted/40">
            <th className="px-3.5 py-2 font-mono text-bui-2xs font-semibold uppercase tracking-wider text-muted-foreground/80">
              Prop
            </th>
            <th className="px-3.5 py-2 font-mono text-bui-2xs font-semibold uppercase tracking-wider text-muted-foreground/80">
              Type
            </th>
            <th className="px-3.5 py-2 font-mono text-bui-2xs font-semibold uppercase tracking-wider text-muted-foreground/80">
              Default
            </th>
            <th className="px-3.5 py-2 font-mono text-bui-2xs font-semibold uppercase tracking-wider text-muted-foreground/80">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.prop + i}
              className={cn(i > 0 && "border-t border-border/60")}
            >
              <td className="px-3.5 py-2.5 align-top">
                <div className="flex items-center gap-1.5">
                  <code className="font-mono text-bui-sm font-medium text-foreground">
                    {row.prop}
                  </code>
                  {row.required && (
                    <span className="font-mono text-bui-2xs text-red-500" title="Required">
                      *
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3.5 py-2.5 align-top">
                <code className="font-mono text-bui-sm text-primary/90">{row.type}</code>
              </td>
              <td className="px-3.5 py-2.5 align-top font-mono text-bui-sm text-muted-foreground">
                {row.default ?? "—"}
              </td>
              <td className="px-3.5 py-2.5 align-top text-bui-sm leading-relaxed text-muted-foreground">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Stacked cards — below sm, where a 4-column table would force
          horizontal scroll on every single row and become unreadable */}
      <div className="flex flex-col divide-y divide-border/60 sm:hidden">
        {rows.map((row, i) => (
          <div key={row.prop + i} className="flex flex-col gap-1 px-3.5 py-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <code className="font-mono text-bui-base font-medium text-foreground">
                {row.prop}
              </code>
              {row.required && (
                <span className="rounded-[3px] bg-red-500/10 px-1 font-mono text-bui-2xs uppercase text-red-500">
                  Required
                </span>
              )}
              <code className="font-mono text-bui-xs text-primary/90">{row.type}</code>
            </div>
            <p className="text-bui-sm leading-relaxed text-muted-foreground">
              {row.description}
            </p>
            {row.default && (
              <p className="font-mono text-bui-xs text-muted-foreground/70">
                Default: {row.default}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
