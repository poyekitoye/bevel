"use client";

import * as React from "react";

/**
 * One implementation of the controlled/uncontrolled pattern for every Bevel UI
 * input. Previously each control re-derived this inline with
 * `"value" in props && props.value !== undefined`, which breaks the moment the
 * caller destructures `value` out of the props object before the check — the
 * rest object no longer carries the key, `isControlled` is permanently false
 * and the component silently ignores the prop it was handed.
 *
 * Pass `value` explicitly and the hook stays out of the way; omit it and the
 * hook owns the state. The returned setter accepts a value or an updater, so
 * callers never have to branch on which mode they are in.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}): [T | undefined, (next: T | ((prev: T | undefined) => T)) => void] {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<T | undefined>(
    defaultValue,
  );

  // Keep the latest onChange in a ref so the setter identity stays stable even
  // when callers pass an inline arrow — which they almost always do.
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });

  const current = isControlled ? value : uncontrolled;
  const currentRef = React.useRef(current);
  currentRef.current = current;

  const setValue = React.useCallback(
    (next: T | ((prev: T | undefined) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T | undefined) => T)(currentRef.current)
          : next;

      if (!isControlled) setUncontrolled(resolved);
      onChangeRef.current?.(resolved);
    },
    [isControlled],
  );

  return [current, setValue];
}

/**
 * Stable callback wrapper. Lets effects depend on a handler without re-running
 * every time the caller passes a fresh inline arrow — the cause of several
 * re-subscribe-per-render loops in the original components.
 */
export function useEventCallback<Args extends unknown[], R>(
  fn: ((...args: Args) => R) | undefined,
): (...args: Args) => R | undefined {
  const ref = React.useRef(fn);
  React.useEffect(() => {
    ref.current = fn;
  });
  return React.useCallback((...args: Args) => ref.current?.(...args), []);
}
