"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Button } from "@/components/ui/button";
import { IconPlayerPlayFilled, IconPlayerStopFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useTour } from "./tour-context";

export interface TourTriggerProps {
  label?: string;
  /** Label while a tour is running. */
  runningLabel?: string;
  className?: string;
  asChild?: boolean;
  /**
   * Stop the running tour instead of being disabled while it runs.
   * Default true — a disabled control with no way to cancel was a dead end.
   */
  toggle?: boolean;
  children?: React.ReactNode;
}

export function TourTrigger({
  label = "Take a tour",
  runningLabel = "End tour",
  className,
  asChild = false,
  toggle = true,
  children,
}: TourTriggerProps) {
  const { start, stop, isOpen } = useTour();

  const triggerProps = {
    onClick: isOpen && toggle ? stop : start,
    disabled: isOpen && !toggle,
    "aria-pressed": isOpen,
    className: cn("gap-2", className),
  };

  if (asChild) {
    return <Slot {...triggerProps}>{children}</Slot>;
  }

  return (
    <Button variant="outline" size="sm" {...triggerProps}>
      {isOpen ? (
        <IconPlayerStopFilled className="text-destructive" size={14} />
      ) : (
        <IconPlayerPlayFilled size={14} />
      )}
      {isOpen ? runningLabel : label}
    </Button>
  );
}

TourTrigger.displayName = "TourTrigger";
