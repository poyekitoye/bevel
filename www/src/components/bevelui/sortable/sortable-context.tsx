"use client";

import * as React from "react";
import type {
  DraggableAttributes,
  SyntheticListenerMap,
} from "./types";
import type { SortableContextValue } from "./types";

export const SortableCtx = React.createContext<SortableContextValue | null>(
  null,
);

/**
 * Throws a named error when used outside a root, matching how every other
 * system in the library reports the same mistake.
 */
export function useSortableRoot(): SortableContextValue {
  const ctx = React.useContext(SortableCtx);
  if (!ctx) {
    throw new Error("SortableItem must be used inside <SortableRoot>");
  }
  return ctx;
}

/** Retained under its original name for existing imports. */
export const useSortableCtx = useSortableRoot;

export type SortableHandleContext = {
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
} | null;

export const SortableHandleCtx =
  React.createContext<SortableHandleContext>(null);

export function useSortableHandle(): SortableHandleContext {
  return React.useContext(SortableHandleCtx);
}
