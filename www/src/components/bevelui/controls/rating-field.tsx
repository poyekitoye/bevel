"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Icon } from "@tabler/icons-react";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { useControllableState } from "../lib/use-controllable-state";
import { usePrefersReducedMotion } from "../lib/use-element-rect";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RatingLevel {
  /** Accessible name for this level, e.g. "Good". */
  label?: string;
  color?: string;
  icon?: Icon;
  emptyIcon?: Icon;
}

type RatingFieldControlled = {
  value: number;
  defaultValue?: never;
  onChange: (stars: number) => void;
};

type RatingFieldUncontrolled = {
  value?: number;
  defaultValue?: number;
  onChange?: (stars: number) => void;
};

export type RatingFieldProps = {
  max?: number;
  icon?: Icon;
  emptyIcon?: Icon;
  size?: number;
  /** Accessible group name. Required for a standalone rating input. */
  label?: string;
  /** Show the numeric value beside the scale. */
  showValue?: boolean;
  /** Highlight only the selected star rather than all stars up to it. */
  single?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  accentColor?: string;
  allowDeselect?: boolean;
  levels?: RatingLevel[];
  className?: string;
  onHover?: (rate: number) => void;
} & (RatingFieldControlled | RatingFieldUncontrolled);

const DEFAULT_ACCENT = "var(--color-amber-400)";

// ─── RatingField ──────────────────────────────────────────────────────────────

/**
 * A rating scale that works with a keyboard.
 *
 * The original rendered a row of buttons with no group role, no aria-checked
 * and no arrow-key handling — reachable only by tabbing through every star,
 * and invisible to assistive tech. This implements the WAI-ARIA radio group
 * pattern: one tab stop, arrows to move, Home/End to jump.
 */
export function RatingField({
  max = 5,
  icon = IconStarFilled,
  emptyIcon = IconStar,
  size = 32,
  label,
  showValue,
  single,
  disabled,
  readOnly,
  accentColor = DEFAULT_ACCENT,
  allowDeselect,
  levels,
  className,
  onHover,
  value,
  defaultValue,
  onChange,
}: RatingFieldProps) {
  const uid = React.useId();
  const reduceMotion = usePrefersReducedMotion();
  const [hover, setHover] = React.useState(0);

  const [rating, setRating] = useControllableState<number>({
    value,
    defaultValue: defaultValue ?? 0,
    onChange,
  });

  const current = rating ?? 0;
  const display = hover || current;
  const interactive = !disabled && !readOnly;

  const handleHover = (next: number) => {
    if (!interactive) return;
    setHover(next);
    onHover?.(next);
  };

  const commit = (next: number) => {
    if (!interactive) return;
    setRating(allowDeselect && next === current ? 0 : next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive) return;

    const step = (delta: number) => {
      e.preventDefault();
      const next = Math.min(max, Math.max(1, (current || 0) + delta));
      setRating(next);
    };

    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        step(1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        step(-1);
        break;
      case "Home":
        e.preventDefault();
        setRating(1);
        break;
      case "End":
        e.preventDefault();
        setRating(max);
        break;
      case "Backspace":
      case "Delete":
        if (allowDeselect) {
          e.preventDefault();
          setRating(0);
        }
        break;
      default: {
        // Number keys jump straight to a value.
        const digit = Number(e.key);
        if (Number.isInteger(digit) && digit >= 1 && digit <= max) {
          e.preventDefault();
          setRating(digit);
        }
      }
    }
  };

  const activeLabel = levels?.[current - 1]?.label;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        role="radiogroup"
        aria-label={label ?? "Rating"}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => handleHover(0)}
        className={cn(
          "flex items-center rounded-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          disabled && "pointer-events-none opacity-50",
          readOnly && "pointer-events-none",
        )}
        // One tab stop for the whole scale, per the radio group pattern.
        tabIndex={interactive ? 0 : -1}
      >
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1;
          const isActive = single
            ? starValue === display
            : starValue <= display;
          const level = levels?.[index];
          const color = level?.color ?? accentColor;
          const RateIcon = isActive
            ? (level?.icon ?? icon)
            : (level?.emptyIcon ?? emptyIcon);

          return (
            <motion.button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={starValue === current}
              aria-label={level?.label ?? `${starValue} of ${max}`}
              tabIndex={-1}
              disabled={disabled}
              whileHover={reduceMotion || !interactive ? undefined : { scale: 1.15 }}
              whileTap={reduceMotion || !interactive ? undefined : { scale: 0.92 }}
              onClick={() => commit(starValue)}
              onMouseEnter={() => handleHover(starValue)}
              onFocus={() => handleHover(starValue)}
              className={cn(
                "relative rounded-full p-1 outline-none",
                interactive ? "cursor-pointer" : "cursor-default",
              )}
            >
              <RateIcon
                size={size}
                strokeWidth={1.5}
                aria-hidden
                style={isActive ? { color } : undefined}
                className={cn(
                  "transition-colors duration-200",
                  !isActive && "text-muted-foreground/30",
                )}
              />
              {starValue === current && !reduceMotion && (
                <motion.span
                  layoutId={`${uid}-glow`}
                  aria-hidden
                  style={{ backgroundColor: color }}
                  className="absolute inset-0 -z-10 rounded-full opacity-20 blur-lg"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {showValue && (
        <span className="min-w-[3ch] text-bui-base font-medium tabular-nums text-muted-foreground">
          {current > 0 ? `${current}/${max}` : "—"}
        </span>
      )}

      {/* Announce the selected level without duplicating it visually. */}
      <span className="sr-only" aria-live="polite">
        {activeLabel ?? (current > 0 ? `${current} of ${max}` : "No rating")}
      </span>
    </div>
  );
}

RatingField.displayName = "RatingField";
