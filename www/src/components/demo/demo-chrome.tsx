"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Every demo leads with one of these. A demo should answer "what is this and
 * why would I use it" before any interaction happens — so this sits above the
 * fold, not as a caption underneath.
 */
export function DemoIntro({
  eyebrow,
  children,
  className,
}: {
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="font-mono text-bui-2xs font-semibold uppercase tracking-wider text-primary/80">
        {eyebrow}
      </span>
      <p className="max-w-xl text-bui-base leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

/** Centred mono caption for "try this" hints below a demo. */
export function DemoHint({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-center font-mono text-bui-xs text-muted-foreground/50",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Inline capability chips — for the parts of a system a single interactive
 * demo cannot act out (every export format, every accepted file type) but that
 * someone scanning the demo should still see named.
 */
export function DemoFeatureRow({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((item) => (
        <span
          key={item}
          className="rounded-[4px] border border-border/60 bg-muted/30 px-2 py-0.5 font-mono text-bui-2xs text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/**
 * A framed surface for demos that need to look like a piece of an app rather
 * than a floating widget — file explorers, split panes, boards.
 */
export function DemoSurface({
  title,
  toolbar,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-xl border border-border bg-background",
        className,
      )}
    >
      {(title || toolbar) && (
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-3 py-2">
          {title && (
            <span className="truncate text-bui-sm font-medium text-muted-foreground">
              {title}
            </span>
          )}
          {toolbar && <div className="flex shrink-0 items-center gap-1.5">{toolbar}</div>}
        </div>
      )}
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </div>
  );
}

/**
 * Shows what a demo just handed back to the consumer. Several systems exist to
 * produce a value — a crop blob, a reordered array, a form payload — and a
 * demo that does not show the value is only showing half the component.
 */
export function DemoOutput({
  label = "onChange",
  value,
  className,
}: {
  label?: string;
  value: unknown;
  className?: string;
}) {
  const text = React.useMemo(() => {
    if (value === undefined) return "—";
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/20 p-3",
        className,
      )}
    >
      <span className="font-mono text-bui-2xs uppercase tracking-wider text-muted-foreground/60">
        {label}
      </span>
      <pre className="no-scrollbar max-h-32 overflow-auto whitespace-pre-wrap break-all font-mono text-bui-2xs leading-relaxed text-foreground/80">
        {text}
      </pre>
    </div>
  );
}

/** Labelled row for demos that expose a few live knobs. */
export function DemoControls({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DemoControl({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const id = React.useId();
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={id}
        className="font-mono text-bui-2xs uppercase tracking-wider text-muted-foreground/60"
      >
        {label}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ id?: string }>, { id })
        : children}
    </div>
  );
}
