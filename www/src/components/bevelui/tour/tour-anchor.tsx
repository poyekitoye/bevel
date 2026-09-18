"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { useTour } from "./tour-context";

function mergeRefs<T>(...refs: React.Ref<T>[]): React.RefCallback<T> {
  return (node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") ref(node);
      else if (ref && "current" in ref)
        (ref as React.MutableRefObject<T>).current = node;
    });
  };
}

export interface TourAnchorProps extends React.HTMLAttributes<HTMLElement> {
  /** 1-based step index — must match a step in your TourStepDef array. */
  step: number;
  /** Merge props onto the child element instead of rendering a wrapper. */
  asChild?: boolean;
}

/**
 * Marks an element as the target for a tour step.
 *
 * This used to draw its own highlight ring — a second ring system running
 * alongside TourOverlay's, both claiming the same `layoutId`, both measuring
 * on every scroll event, and one of them reading `innerRef.current` during
 * render (always null on first paint, so it never appeared until something
 * else re-rendered). The overlay owns the cutout and the ring now; an anchor's
 * only job is to be findable and to sit above the dimmer.
 */
export const TourAnchor = React.forwardRef<HTMLElement, TourAnchorProps>(
  ({ step, asChild = false, children, className, ...props }, ref) => {
    const { currentStep, isOpen } = useTour();
    const isActive = isOpen && currentStep === step;

    const sharedProps = {
      "data-tour-step": step,
      "data-tour-active": isActive || undefined,
      className: cn(
        // Lift above the dimmer while active so the element reads as
        // highlighted rather than greyed out.
        isActive && "relative",
        className,
      ),
      style: isActive
        ? ({ zIndex: "var(--z-bui-panel)" } as React.CSSProperties)
        : undefined,
      ...props,
    };

    if (asChild) {
      return (
        <Slot ref={ref as React.Ref<HTMLElement>} {...sharedProps}>
          {children}
        </Slot>
      );
    }

    return (
      <div
        ref={mergeRefs(ref as React.Ref<HTMLDivElement>)}
        {...sharedProps}
        className={cn("relative inline-block", sharedProps.className)}
      >
        {children}
      </div>
    );
  },
);

TourAnchor.displayName = "TourAnchor";
