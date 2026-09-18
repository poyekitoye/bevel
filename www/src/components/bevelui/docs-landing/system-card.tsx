import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import type { DocsManifestItem } from "@/content/docs/manifest";
import { getSystemHref, getTierBadge } from "@/content/docs/manifest";

const BADGE_CLASSES: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
  red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  pro: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
};

export function SystemCard({
  system,
  className,
}: {
  system: DocsManifestItem;
  className?: string;
}) {
  const Icon = system.icon;
  const badge = getTierBadge(system.tier);

  return (
    <Link
      href={getSystemHref(system.route)}
      className={cn(
        "group relative flex flex-col gap-3 rounded-md border border-border/70 p-4",
        "transition-colors hover:border-border hover:bg-muted/30",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/40">
          {Icon && <Icon size={16} strokeWidth={1.8} className="text-foreground/80" />}
        </div>
        <div className="flex items-center gap-1.5">
          {badge && (
            <Badge
              className={cn(
                "rounded-[4px] border px-1.5 py-0 font-mono text-bui-2xs font-medium uppercase leading-[18px] tracking-wide",
                BADGE_CLASSES[badge.variant],
              )}
            >
              {badge.label}
            </Badge>
          )}
          <IconArrowUpRight
            size={14}
            strokeWidth={2}
            className="text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-bui-md font-semibold text-foreground">{system.title}</h3>
        <p className="line-clamp-2 text-bui-sm leading-relaxed text-muted-foreground">
          {system.description}
        </p>
      </div>

      {system.useCases.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1 pt-1">
          {system.useCases.slice(0, 3).map((useCase) => (
            <span
              key={useCase}
              className="rounded-[4px] border border-border/60 px-1.5 py-0.5 font-mono text-bui-2xs text-muted-foreground/80"
            >
              {useCase}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
