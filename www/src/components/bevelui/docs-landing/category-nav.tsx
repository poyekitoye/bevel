"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { DocsCategory } from "@/content/docs/manifest";

export function CategoryNav({
  categories,
  className,
}: {
  categories: DocsCategory[];
  className?: string;
}) {
  const [activeId, setActiveId] = useState<string | undefined>(categories[0]?.id);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const elements = categories
      .map((c) => document.getElementById(`category-${c.id}`))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id.replace("category-", "");
          setActiveId(id);
          chipRefs.current[id]?.scrollIntoView({ block: "nearest", inline: "center" });
        }
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: [0, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  function handleClick(id: string) {
    document.getElementById(`category-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className={cn(
        "sticky top-[calc(3.5rem+1px)] z-20 -mx-4 overflow-x-auto border-b border-border/70 bg-background/90 px-4 py-2.5 backdrop-blur-md sm:mx-0 sm:rounded-md sm:border",
        className,
      )}
    >
      <div className="flex w-max min-w-full gap-1.5">
        {categories.map((cat) => {
          const isActive = cat.id === activeId;
          return (
            <button
              key={cat.id}
              ref={(el) => {
                chipRefs.current[cat.id] = el;
              }}
              type="button"
              onClick={() => handleClick(cat.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-3 py-1 font-mono text-bui-xs font-medium uppercase tracking-wide transition-colors",
                isActive
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
