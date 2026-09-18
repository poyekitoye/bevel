"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useSpotlight } from "./spotlight-context";
import { usePrefersReducedMotion } from "../lib/use-element-rect";
import type { SpotlightResult } from "./types";

export interface SpotlightResultItemProps {
  result: SpotlightResult;
  index: number;
  isHighlighted: boolean;
}

export function SpotlightResultItem({
  result,
  index,
  isHighlighted,
}: SpotlightResultItemProps) {
  const { selectResult, setHighlightedIndex } = useSpotlight();
  const ref = React.useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (!isHighlighted) return;
    ref.current?.scrollIntoView({
      block: "nearest",
      behavior: reduceMotion ? "auto" : "instant",
    });
  }, [isHighlighted, reduceMotion]);

  const Icon = typeof result.icon !== "string" ? result.icon : null;
  const imgSrc = typeof result.icon === "string" ? result.icon : null;

  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/50">
        {imgSrc ? (
          <img src={imgSrc} alt="" aria-hidden loading="lazy" className="size-5 object-cover" />
        ) : Icon ? (
          <Icon size={18} strokeWidth={1.8} className="text-muted-foreground/60" aria-hidden />
        ) : (
          <span className="text-bui-xs font-bold text-muted-foreground/40" aria-hidden>
            {result.title[0]?.toUpperCase()}
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-bui-base font-medium text-foreground">
          {result.title}
        </span>
        {result.subtitle && (
          <span className="block truncate text-bui-xs text-muted-foreground/60">
            {result.subtitle}
          </span>
        )}
      </span>

      {result.badge && (
        <span className="ml-2 shrink-0 font-mono text-bui-2xs text-muted-foreground/40">
          {result.badge}
        </span>
      )}
    </>
  );

  const shared = {
    id: `bui-spot-${result.id}`,
    role: "option" as const,
    "aria-selected": isHighlighted,
    onMouseMove: () => setHighlightedIndex(index),
    className: cn(
      "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
      isHighlighted ? "bg-muted/60" : "hover:bg-muted/40",
    ),
  };

  // A link is a link. The original called window.open(href, "_blank") for
  // every result — no middle-click, no "open in new tab", no URL preview, and
  // without noopener it handed the opened page a reference back to this one.
  if (result.href) {
    return (
      <a
        {...shared}
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={result.href}
        target={result.external ? "_blank" : undefined}
        rel={result.external ? "noopener noreferrer" : undefined}
        onClick={() => selectResult(result)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...shared}
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={() => selectResult(result)}
    >
      {content}
    </button>
  );
}

SpotlightResultItem.displayName = "SpotlightResultItem";
