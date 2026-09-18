"use client";

import * as React from "react";
import type { Icon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useControllableState } from "../lib/use-controllable-state";

export interface SelectFieldOption {
  value: string;
  label: string;
  icon?: Icon;
  disabled?: boolean;
  className?: string;
}

export interface SelectFieldOptionGroup {
  group: string;
  icon?: Icon;
  className?: string;
  options: SelectFieldOption[];
}

export type SelectFieldProps = {
  options: SelectFieldOption[] | SelectFieldOptionGroup[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** Associates the trigger with an external <label htmlFor>. */
  id?: string;
  /** Submits with a surrounding form. */
  name?: string;
  "aria-label"?: string;
  className?: string;
};

function isGrouped(
  options: SelectFieldOption[] | SelectFieldOptionGroup[],
): options is SelectFieldOptionGroup[] {
  return options.length > 0 && "group" in options[0];
}

function OptionItem({ opt }: { opt: SelectFieldOption }) {
  return (
    <SelectItem value={opt.value} disabled={opt.disabled} className={opt.className}>
      <span className="flex w-full items-center gap-2">
        {opt.icon && <opt.icon className="size-4 text-muted-foreground" aria-hidden />}
        {/* No forced `capitalize` — the caller's label is the label. */}
        <span>{opt.label}</span>
      </span>
    </SelectItem>
  );
}

export function SelectField({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Select an option",
  isLoading,
  disabled,
  invalid,
  id,
  name,
  "aria-label": ariaLabel,
  className,
}: SelectFieldProps) {
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: onChange as ((v: string | undefined) => void) | undefined,
  });

  if (isLoading) {
    return <Skeleton className={cn("h-9 w-full rounded-md", className)} />;
  }

  return (
    <Select
      value={current ?? ""}
      onValueChange={setCurrent}
      disabled={disabled}
      name={name}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid}
        className={cn("w-full", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      {/* `align="center"` on a full-width trigger read as a mistake; start
          aligns the menu with the control, like every other select. */}
      <SelectContent align="start" side="bottom">
        {!isGrouped(options) ? (
          <SelectGroup>
            {(options as SelectFieldOption[]).map((opt) => (
              <OptionItem key={opt.value} opt={opt} />
            ))}
          </SelectGroup>
        ) : (
          (options as SelectFieldOptionGroup[]).map((g) => (
            <SelectGroup key={g.group}>
              {/* A plain group heading. The original styled it as a pill and
                  indented its options with ml-4, which shifted the highlight
                  bar out of alignment with ungrouped items. */}
              <SelectLabel
                className={cn(
                  "flex items-center gap-1.5 text-bui-xs font-semibold uppercase tracking-wide text-muted-foreground",
                  g.className,
                )}
              >
                {g.icon && <g.icon className="size-3.5" aria-hidden />}
                {g.group}
              </SelectLabel>
              {g.options.map((opt) => (
                <OptionItem key={opt.value} opt={opt} />
              ))}
            </SelectGroup>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

SelectField.displayName = "SelectField";
