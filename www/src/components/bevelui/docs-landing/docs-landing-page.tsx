"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { IconSearch, IconX } from "@tabler/icons-react";
import {
  DOCS_CATEGORIES,
  DOCS_SYSTEMS,
  getSystemsByCategory,
  type DocsManifestItem,
} from "@/content/docs/manifest";
import { useRegisterDocsChrome } from "@/components/shared/docs-chrome-context";
import { CategoryNav } from "./category-nav";
import { SystemCard } from "./system-card";

function matchesQuery(system: DocsManifestItem, query: string) {
  const q = query.toLowerCase();
  return (
    system.title.toLowerCase().includes(q) ||
    system.description.toLowerCase().includes(q) ||
    system.useCases.some((u) => u.toLowerCase().includes(q)) ||
    system.keywords?.some((k) => k.toLowerCase().includes(q))
  );
}

export function DocsLandingPage() {
  const [query, setQuery] = useState("");
  const isSearching = query.trim().length > 0;

  // This page has no DocPage to read a title/tocs/breadcrumb from (it isn't
  // JSON content), so it registers its own chrome directly instead of going
  // through DocPageRenderer.
  useRegisterDocsChrome({
    activeItem: "All Systems",
    toc: [],
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "All Systems" }],
  });

  const filteredFlat = useMemo(() => {
    if (!isSearching) return [];
    return DOCS_SYSTEMS.filter((s) => matchesQuery(s, query));
  }, [query, isSearching]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      {/* Hero */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-bui-xs font-medium uppercase tracking-wider text-primary/90">
          Documentation
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {DOCS_SYSTEMS.length} systems, ready to install
        </h1>
        <p className="max-w-xl text-bui-md leading-relaxed text-muted-foreground">
          Complete UI engineering problems solved — state machines, edge cases, and
          accessibility included. Copy the source in, own it forever.
        </p>
      </div>

      {/* Live filter — separate from the ⌘K command search: this one filters
          the grid in place instead of navigating away, useful for browsing. */}
      <div className="relative">
        <IconSearch
          size={15}
          strokeWidth={2}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name, use case, or keyword…"
          className={cn(
            "w-full rounded-md border border-border/70 bg-card py-2.5 pl-9 pr-9 text-bui-base",
            "text-foreground placeholder:text-muted-foreground/70",
            "focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20",
          )}
        />
        {isSearching && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear filter"
            className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          >
            <IconX size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {isSearching ? (
        <div className="flex flex-col gap-3">
          <p className="font-mono text-bui-xs uppercase tracking-wider text-muted-foreground/70">
            {filteredFlat.length} result{filteredFlat.length === 1 ? "" : "s"}
          </p>
          {filteredFlat.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFlat.map((system) => (
                <SystemCard key={system.route} system={system} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 rounded-md border border-dashed border-border py-14 text-center">
              <p className="text-bui-base font-medium text-foreground">No systems match "{query}"</p>
              <p className="text-bui-sm text-muted-foreground">
                Try a different name, use case, or keyword.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <CategoryNav categories={DOCS_CATEGORIES} />

          <div className="flex flex-col gap-12">
            {DOCS_CATEGORIES.map((category) => {
              const systems = getSystemsByCategory(category.id);
              if (systems.length === 0) return null;

              return (
                <section
                  key={category.id}
                  id={`category-${category.id}`}
                  className="scroll-mt-32 flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-0.5">
                    <h2 className="text-bui-lg font-semibold text-foreground">
                      {category.label}
                    </h2>
                    <p className="text-bui-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {systems.map((system) => (
                      <SystemCard key={system.route} system={system} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
