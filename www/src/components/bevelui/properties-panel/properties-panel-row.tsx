"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PropertiesControl } from "./properties-panel-control";
import type { PropertyControl } from "./types";

export interface PropertiesRowProps {
  label: string;
  control: PropertyControl;
  /** Extra explanation shown under the control. */
  hint?: string;
  className?: string;
  hidden?: boolean;
}

export function PropertiesRow({
  label,
  control,
  hint,
  className,
  hidden,
}: PropertiesRowProps) {
  // Generated here and threaded into the control, so the label is a real
  // <label for> rather than a <span> floating beside an unlabelled input.
  // Clicking the label now focuses the control and screen readers announce it.
  const id = React.useId();
  const hintId = hint ? `${id}-hint` : undefined;

  if (hidden) return null;

  const isToggle = control.type === "toggle";

  return (
    <div className={cn("flex flex-col gap-0.5 px-3 py-1.5", className)}>
      <div
        className={cn(
          "flex min-h-8 items-center gap-2",
          isToggle && "justify-between",
        )}
      >
        <label
          htmlFor={id}
          // Truncated property names were unreadable with no way to see them.
          title={label}
          className={cn(
            "shrink-0 select-none truncate text-bui-xs text-muted-foreground",
            isToggle ? "w-auto" : "max-w-20 basis-1/4",
          )}
        >
          {label}
        </label>

        <div className={cn("min-w-0 flex-1", isToggle && "flex-none")}>
          <PropertiesControl control={control} id={id} describedBy={hintId} />
        </div>
      </div>

      {hint && (
        <p id={hintId} className="pl-[25%] text-bui-2xs text-muted-foreground/70">
          {hint}
        </p>
      )}
    </div>
  );
}

PropertiesRow.displayName = "PropertiesRow";
