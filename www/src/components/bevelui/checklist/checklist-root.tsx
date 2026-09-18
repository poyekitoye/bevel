"use client";

import * as React from "react";
import { ChecklistCtx } from "./checklist-context";
import { ChecklistWidget } from "./checklist-widget";
import { useEventCallback } from "../lib/use-controllable-state";
import type {
  ChecklistStep,
  ChecklistConfig,
  ChecklistContextValue,
  ChecklistStepStatus,
} from "./types";

export interface ChecklistRootProps {
  steps: ChecklistStep[];
  config?: ChecklistConfig;
  /** Fires once when every required step is complete. */
  onComplete?: () => void;
  children?: React.ReactNode;
}

type Statuses = Record<string, ChecklistStepStatus>;

function readStatuses(key: string): Statuses {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Statuses) : {};
  } catch {
    return {};
  }
}

export function ChecklistRoot({
  steps,
  config = {},
  onComplete,
  children,
}: ChecklistRootProps) {
  const key = config.storageKey ?? "bevel-checklist";

  // Starts empty on server and client alike, then hydrates from storage in an
  // effect. Reading localStorage in the useState initializer — as this did —
  // makes the first client render disagree with the server's HTML.
  const [statuses, setStatuses] = React.useState<Statuses>({});
  const [hydrated, setHydrated] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const emitComplete = useEventCallback(onComplete);

  React.useEffect(() => {
    setStatuses(readStatuses(key));
    setHydrated(true);
  }, [key]);

  React.useEffect(() => {
    if (!hydrated) return; // don't clobber stored state with the empty default
    try {
      localStorage.setItem(key, JSON.stringify(statuses));
    } catch {
      /* storage unavailable — progress simply will not persist */
    }
  }, [statuses, key, hydrated]);

  const requiredSteps = React.useMemo(
    () => steps.filter((s) => !s.optional),
    [steps],
  );
  const requiredCount = requiredSteps.length;
  const completedCount = requiredSteps.filter(
    (s) => statuses[s.id] === "complete",
  ).length;

  const progress =
    requiredCount === 0
      ? 100
      : Math.round((completedCount / requiredCount) * 100);
  const isComplete = requiredCount > 0 && completedCount >= requiredCount;

  const wasComplete = React.useRef(false);
  React.useEffect(() => {
    if (!hydrated) return;
    if (isComplete && !wasComplete.current) {
      wasComplete.current = true;
      emitComplete();
    } else if (!isComplete) {
      wasComplete.current = false;
    }
  }, [isComplete, hydrated, emitComplete]);

  const canActivate = React.useCallback(
    (id: string): boolean => {
      const step = steps.find((s) => s.id === id);
      if (!step?.requires?.length) return true;
      return step.requires.every((rid) => statuses[rid] === "complete");
    },
    [steps, statuses],
  );

  const setStatus = React.useCallback(
    (id: string, status: ChecklistStepStatus) => {
      setStatuses((prev) => ({ ...prev, [id]: status }));
    },
    [],
  );

  const value = React.useMemo<ChecklistContextValue>(
    () => ({
      steps,
      statuses,
      isOpen,
      completedCount,
      requiredCount,
      progress,
      isComplete,
      complete: (id) => setStatus(id, "complete"),
      skip: (id) => setStatus(id, "skipped"),
      undo: (id) => setStatus(id, "idle"),
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((p) => !p),
      canActivate,
    }),
    [
      steps,
      statuses,
      isOpen,
      completedCount,
      requiredCount,
      progress,
      isComplete,
      setStatus,
      canActivate,
    ],
  );

  return (
    <ChecklistCtx.Provider value={value}>
      {children}
      {config.position !== "inline" && <ChecklistWidget config={config} />}
    </ChecklistCtx.Provider>
  );
}

ChecklistRoot.displayName = "ChecklistRoot";
