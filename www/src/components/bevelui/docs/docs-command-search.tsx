"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandPaletteRoot,
  CommandPaletteTrigger,
  type CommandPaletteSection,
} from "@/components/bevelui/command-palette";
import searchData from "@/content/docs-search-data.json";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type CommandPaletteItem = CommandPaletteSection["items"][number];

// ─── Build sections from JSON ─────────────────────────────────────────────────

function buildSections(): CommandPaletteSection[] {
  return searchData.sections.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.description,
      category: item.category,
      href: item.href,
    })),
  }));
}

const BASE_SECTIONS = buildSections();
const ALL_ITEMS = BASE_SECTIONS.flatMap((s) => s.items);

// ─── Recent searches (new) ─────────────────────────────────────────────────────
// Persisted client-side only. A "Recent" section is prepended to the results
// so the empty-query state isn't just an alphabetical dump of every system —
// it surfaces what you were actually just looking at.

const RECENTS_KEY = "bevel-docs:recent-searches";
const MAX_RECENTS = 5;

function readRecents(): CommandPaletteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]");
    return ids
      .map((id) => ALL_ITEMS.find((item) => item.id === id))
      .filter((item): item is CommandPaletteItem => Boolean(item));
  } catch {
    return [];
  }
}

function recordRecent(id: string) {
  if (typeof window === "undefined") return;
  try {
    const existing: string[] = JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]");
    const next = [id, ...existing.filter((existingId) => existingId !== id)].slice(
      0,
      MAX_RECENTS,
    );
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private browsing, quota) — recency is a nice-to-have.
  }
}

// ─── DocsCommandSearch ────────────────────────────────────────────────────────

export function DocsCommandSearch({
  className,
  hideAddon,
  size = "sm",
}: {
  className?: string;
  hideAddon?: boolean;
  /** "sm" — sidebar/topbar trigger (default). "lg" — hero placement, bigger target. */
  size?: "sm" | "lg";
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [recents, setRecents] = useState<CommandPaletteItem[]>([]);

  // Read after mount only — there's no window during SSR, and recency is
  // per-browser anyway, so there's nothing meaningful to render server-side.
  useEffect(() => {
    setRecents(readRecents());
  }, []);

  const sections = useMemo<CommandPaletteSection[]>(() => {
    if (recents.length === 0) return BASE_SECTIONS;
    return [{ id: "recent", title: "Recent", items: recents }, ...BASE_SECTIONS];
  }, [recents]);

  return (
    <CommandPaletteRoot
      sections={sections}
      defaultOpen={false}
      onSelect={(item) => {
        recordRecent(item.id as string);
        if (item.href) router.push(item.href as string);
      }}
    >
      <CommandPaletteTrigger
        hideAddon={hideAddon}
        label={isMobile ? "Search…" : "Search documentation..."}
        className={cn(
          // Dense/technical direction: hairline border + flat fill, matching
          // the sidebar, topbar, and landing-page filter input — the old
          // rounded-full pill was the one rounded element left in an
          // otherwise hairline, rounded-md system.
          "w-full justify-start rounded-md border border-border/70 bg-muted/40 text-bui-base text-muted-foreground hover:bg-muted/60",
          size === "sm" ? "h-9 lg:w-64" : "h-11 text-bui-md",
          className,
        )}
      />
    </CommandPaletteRoot>
  );
}
