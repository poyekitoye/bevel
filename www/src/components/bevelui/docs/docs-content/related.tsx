import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import type { DocBlockRelated, DocBlockBuiltWith } from "@/content/docs/doc-schema";
import { getRelatedSystems, getSystemHref, getTierBadge } from "@/content/docs/manifest";

const BADGE_CLASSES: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
  red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  pro: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
};

export function Related({ currentRoute, className }: DocBlockRelated & { className?: string }) {
  const systems = getRelatedSystems(currentRoute);
  if (systems.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-1 gap-2.5 sm:grid-cols-2", className)}>
      {systems.map((system) => {
        const badge = getTierBadge(system.tier);
        const Icon = system.icon;
        return (
          <Link
            key={system.route}
            href={getSystemHref(system.route)}
            className="group flex flex-col gap-1.5 rounded-md border border-border/70 p-3.5 hover:border-border hover:bg-muted/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-bui-base font-medium text-foreground">
                {Icon && <Icon size={14} strokeWidth={1.9} className="text-muted-foreground" />}
                {system.title}
              </span>
              <div className="flex shrink-0 items-center gap-1.5">
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
                  size={13}
                  strokeWidth={2}
                  className="text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </div>
            <p className="line-clamp-2 text-bui-sm leading-relaxed text-muted-foreground">
              {system.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

export function BuiltWith({ techs, className }: DocBlockBuiltWith & { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {techs.map((tech) => (
        <span
          key={tech}
          className="rounded-[4px] border border-border/60 bg-card px-1.5 py-0.5 font-mono text-bui-xs text-muted-foreground"
        >
          {tech}
        </span>
      ))}
    </div>
  );
}
