"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useControllableState } from "../lib/use-controllable-state";

export interface CardSelectOption<T = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

type CardSelectSharedProps<T = string> = {
  layout?: "grid" | "list" | "scroll";
  columns?: 1 | 2 | 3 | 4;
  size?: "sm" | "md" | "lg";
  /** Accessible name for the group. */
  label?: string;
  className?: string;
  options: CardSelectOption<T>[];
};

type SingleControlled<T> = {
  multiple?: false;
  value: T;
  defaultValue?: never;
  onChange: (value: T) => void;
};
type SingleUncontrolled<T> = {
  multiple?: false;
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
};
type MultiControlled<T> = {
  multiple: true;
  value: T[];
  defaultValue?: never;
  onChange: (value: T[]) => void;
  max?: number;
};
type MultiUncontrolled<T> = {
  multiple: true;
  value?: T[];
  defaultValue?: T[];
  onChange?: (value: T[]) => void;
  max?: number;
};

export type CardSelectProps<T = string> = CardSelectSharedProps<T> &
  (
    | SingleControlled<T>
    | SingleUncontrolled<T>
    | MultiControlled<T>
    | MultiUncontrolled<T>
  );

// The focus ring lives on the button, so these variants describe the card's
// surface only. The original duplicated focus-visible and disabled: styles
// here on a <div>, where neither variant can ever match.
const cardVariants = cva(
  ["relative flex w-full items-start rounded-lg border text-left", "transition-colors duration-150"],
  {
    variants: {
      selected: {
        true: "border-primary bg-primary/5",
        false: "border-input hover:border-accent-foreground/20 hover:bg-accent/40",
      },
      size: {
        sm: "gap-2 p-3",
        md: "gap-3 p-4",
        lg: "gap-4 p-5",
      },
    },
    defaultVariants: { selected: false, size: "md" },
  },
);

const indicatorVariants = cva(
  "flex shrink-0 items-center justify-center border transition-colors duration-150",
  {
    variants: {
      selected: {
        true: "border-primary bg-primary text-primary-foreground",
        false: "border-input bg-transparent",
      },
      multiple: { true: "rounded-sm", false: "rounded-full" },
      size: { sm: "size-3.5", md: "size-4", lg: "size-[18px]" },
    },
    defaultVariants: { selected: false, multiple: false, size: "md" },
  },
);

const COLS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
} as const;

const LABEL_SIZE = { sm: "text-bui-base", md: "text-bui-md", lg: "text-bui-lg" } as const;
const DESC_SIZE = { sm: "text-bui-sm", md: "text-bui-base", lg: "text-bui-md" } as const;
const CHECK_SIZE = { sm: "size-2", md: "size-2.5", lg: "size-3" } as const;

function CardItem<T>({
  option,
  isSelected,
  isMultiple,
  size = "md",
}: {
  option: CardSelectOption<T>;
  isSelected: boolean;
  isMultiple: boolean;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span className={cn(cardVariants({ selected: isSelected, size }))}>
      <span
        className={cn(
          indicatorVariants({ selected: isSelected, multiple: isMultiple, size }),
          "mt-0.5",
        )}
        aria-hidden
      >
        {isSelected && (
          <IconCheck className={cn(CHECK_SIZE[size], "stroke-[2.5]")} />
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          {option.icon && (
            <span className="shrink-0 text-muted-foreground" aria-hidden>
              {option.icon}
            </span>
          )}
          {/* The original branched on isSelected to pick between two identical
              classes — a ternary with the same value on both sides. */}
          <span className={cn("font-medium leading-snug text-foreground", LABEL_SIZE[size])}>
            {option.label}
          </span>
          {option.badge && (
            <Badge variant="secondary" className="ml-auto shrink-0">
              {option.badge}
            </Badge>
          )}
        </span>

        {option.description && (
          <span className={cn("leading-snug text-muted-foreground", DESC_SIZE[size])}>
            {option.description}
          </span>
        )}
      </span>
    </span>
  );
}

export function CardSelect<T = string>({
  options,
  layout = "list",
  columns = 1,
  size = "md",
  label,
  className,
  multiple,
  value,
  defaultValue,
  onChange,
  ...rest
}: CardSelectProps<T>) {
  const max = (rest as { max?: number }).max;
  const listRef = React.useRef<HTMLDivElement>(null);

  const [single, setSingle] = useControllableState<T | undefined>({
    value: multiple ? undefined : (value as T | undefined),
    defaultValue: multiple ? undefined : (defaultValue as T | undefined),
    onChange: multiple
      ? undefined
      : (onChange as ((v: T | undefined) => void) | undefined),
  });

  const [multi, setMulti] = useControllableState<T[]>({
    value: multiple ? (value as T[] | undefined) : undefined,
    defaultValue: multiple ? ((defaultValue as T[]) ?? []) : [],
    onChange: multiple ? (onChange as ((v: T[]) => void) | undefined) : undefined,
  });

  const isSelected = (val: T) =>
    multiple ? (multi ?? []).includes(val) : single === val;

  const handleSelect = (val: T) => {
    if (multiple) {
      const current = multi ?? [];
      const next = current.includes(val)
        ? current.filter((v) => v !== val)
        : max && current.length >= max
          ? current
          : [...current, val];
      setMulti(next);
    } else {
      setSingle(val);
    }
  };

  const enabled = options.filter((o) => !o.disabled);

  // Radio groups are a single tab stop with arrow-key movement between
  // options. The original left every card independently tabbable.
  function onKeyDown(e: React.KeyboardEvent) {
    if (multiple) return;
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;

    e.preventDefault();
    const index = enabled.findIndex((o) => isSelected(o.value));
    let next: number;

    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = enabled.length - 1;
    else if (e.key === "ArrowDown" || e.key === "ArrowRight")
      next = (index + 1) % enabled.length;
    else next = (index - 1 + enabled.length) % enabled.length;

    const option = enabled[next];
    if (!option) return;
    handleSelect(option.value);
    listRef.current
      ?.querySelectorAll<HTMLButtonElement>("[data-card-option]")
      [options.indexOf(option)]?.focus();
  }

  return (
    <div
      ref={listRef}
      role={multiple ? "group" : "radiogroup"}
      aria-label={label ?? (multiple ? "Select options" : "Select an option")}
      onKeyDown={onKeyDown}
      className={cn(
        layout === "scroll"
          ? // The original set overflow-x-auto but kept grid-cols-1, so the
            // "scroll" layout stacked vertically and never scrolled.
            "no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
          : cn("grid gap-2", layout === "grid" ? COLS[columns] : "grid-cols-1"),
        className,
      )}
    >
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <button
            key={String(option.value)}
            data-card-option
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={selected}
            disabled={option.disabled}
            tabIndex={
              multiple ? 0 : selected || (!single && options[0] === option) ? 0 : -1
            }
            onClick={() => handleSelect(option.value)}
            className={cn(
              "rounded-lg outline-none",
              layout === "scroll" && "w-64 shrink-0 snap-start",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              option.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <CardItem
              option={option}
              isSelected={selected}
              isMultiple={!!multiple}
              size={size}
            />
          </button>
        );
      })}
    </div>
  );
}

CardSelect.displayName = "CardSelect";
