"use client";

import * as React from "react";
import type { Icon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useControllableState } from "../lib/use-controllable-state";
import { getContrastColor, contrastOverlay } from "../lib/color";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChipSelectOption {
  value: string;
  label: string;
  icon?: Icon;
  /** Shown in a tooltip on hover/focus. */
  description?: string;
  badge?: string | number;
  disabled?: boolean;
  /** Overrides the active background, e.g. "#FF4560". */
  color?: string;
}

type ChipSelectSharedProps = {
  options: ChipSelectOption[];
  isLoading?: boolean;
  canWrap?: boolean;
  size?: "sm" | "md" | "lg";
  /** Accessible name for the group. */
  label?: string;
  className?: string;
  activeClassName?: string;
};

type SingleControlled = {
  multiple?: false;
  value: string;
  defaultValue?: never;
  onChange: (value: string) => void;
};
type SingleUncontrolled = {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};
type MultiControlled = {
  multiple: true;
  value: string[];
  defaultValue?: never;
  onChange: (value: string[]) => void;
  max?: number;
};
type MultiUncontrolled = {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  max?: number;
};

export type ChipSelectProps = ChipSelectSharedProps &
  (SingleControlled | SingleUncontrolled | MultiControlled | MultiUncontrolled);

// ─── Sizing ───────────────────────────────────────────────────────────────────

const SIZE = {
  sm: {
    chip: "h-7 px-3 text-bui-xs gap-1.5",
    badge: "text-bui-2xs px-1.5 h-4",
    icon: "size-3",
    skeleton: "h-7 w-20",
  },
  md: {
    chip: "h-9 px-4 text-bui-md gap-2",
    badge: "text-bui-2xs px-1.5 h-5",
    icon: "size-4",
    skeleton: "h-9 w-24",
  },
  lg: {
    chip: "h-11 px-5 text-bui-lg gap-2.5",
    badge: "text-bui-sm px-2 h-5",
    icon: "size-5",
    skeleton: "h-11 w-28",
  },
} as const;

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({
  option,
  isActive,
  isMultiple,
  size = "md",
  activeClassName,
  onClick,
}: {
  option: ChipSelectOption;
  isActive: boolean;
  isMultiple: boolean;
  size?: keyof typeof SIZE;
  activeClassName?: string;
  onClick: () => void;
}) {
  const s = SIZE[size];

  // A custom colour no longer forces white text. A light brand colour used to
  // render an unreadable chip; the foreground is now derived from contrast.
  const customStyle =
    isActive && option.color
      ? {
          backgroundColor: option.color,
          borderColor: option.color,
          color: getContrastColor(option.color),
        }
      : undefined;

  const chip = (
    <button
      type="button"
      role={isMultiple ? "checkbox" : "radio"}
      aria-checked={isActive}
      aria-label={option.label}
      disabled={option.disabled}
      onClick={onClick}
      style={customStyle}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        s.chip,
        !isActive &&
          "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-foreground",
        isActive &&
          !option.color &&
          "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        // `pointer-events-none` used to sit alongside `cursor-not-allowed`,
        // which meant the cursor never actually showed.
        option.disabled && "cursor-not-allowed opacity-40",
        isActive && activeClassName,
      )}
    >
      {option.icon && <option.icon className={cn("shrink-0", s.icon)} aria-hidden />}
      {/* The original forced `capitalize`, which rewrote the caller's labels —
          "iOS" rendered as "IOS". */}
      <span>{option.label}</span>
      {option.badge !== undefined && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full font-semibold leading-none",
            s.badge,
            isActive && !option.color && "bg-primary-foreground/20",
            !isActive && "bg-muted text-muted-foreground",
          )}
          style={
            isActive && option.color
              ? { backgroundColor: contrastOverlay(option.color, 0.2) }
              : undefined
          }
        >
          {option.badge}
        </span>
      )}
    </button>
  );

  if (!option.description) return chip;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{chip}</TooltipTrigger>
      <TooltipContent>{option.description}</TooltipContent>
    </Tooltip>
  );
}

// ─── ChipSelect ───────────────────────────────────────────────────────────────

export function ChipSelect({
  options,
  isLoading,
  canWrap = true,
  size = "md",
  label,
  className,
  activeClassName,
  multiple,
  value,
  defaultValue,
  onChange,
  ...rest
}: ChipSelectProps) {
  const max = (rest as { max?: number }).max;

  // Both modes are driven by one hook, so the controlled/uncontrolled decision
  // is made in a single place instead of being re-derived per component.
  const [single, setSingle] = useControllableState<string | undefined>({
    value: multiple ? undefined : (value as string | undefined),
    defaultValue: multiple ? undefined : (defaultValue as string | undefined),
    onChange: multiple
      ? undefined
      : (onChange as ((v: string | undefined) => void) | undefined),
  });

  const [multi, setMulti] = useControllableState<string[]>({
    value: multiple ? (value as string[] | undefined) : undefined,
    defaultValue: multiple ? ((defaultValue as string[]) ?? []) : [],
    onChange: multiple
      ? (onChange as ((v: string[]) => void) | undefined)
      : undefined,
  });

  const selected = multiple ? (multi ?? []) : single;

  const isActive = (val: string) =>
    multiple ? (selected as string[]).includes(val) : selected === val;

  const handleClick = (val: string) => {
    if (multiple) {
      const current = (selected as string[]) ?? [];
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

  return (
    <TooltipProvider delayDuration={300}>
      <div
        role={multiple ? "group" : "radiogroup"}
        aria-label={label ?? (multiple ? "Select options" : "Select an option")}
        className={cn(
          "flex gap-2",
          canWrap ? "flex-wrap" : "no-scrollbar flex-nowrap overflow-x-auto pb-1",
          className,
        )}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              // Matches the real chip size, so the list does not jump when
              // results arrive.
              <Skeleton
                key={i}
                className={cn("rounded-full", SIZE[size].skeleton)}
              />
            ))
          : options.map((opt) => (
              <Chip
                key={opt.value}
                option={opt}
                isActive={isActive(opt.value)}
                isMultiple={!!multiple}
                size={size}
                activeClassName={activeClassName}
                onClick={() => !opt.disabled && handleClick(opt.value)}
              />
            ))}
      </div>
    </TooltipProvider>
  );
}

ChipSelect.displayName = "ChipSelect";
