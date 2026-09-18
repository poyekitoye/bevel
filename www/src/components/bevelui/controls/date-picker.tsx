"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useId } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { DateRange } from "react-day-picker";
import { IconCalendar, IconClock, IconX } from "@tabler/icons-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DateValue = Date | undefined;
export type RangeValue = DateRange; // { from?: Date; to?: Date }

type SingleControlled = {
  mode?: "single";
  value: DateValue;
  defaultValue?: never;
  onChange: (date: DateValue) => void;
};
type SingleUncontrolled = {
  mode?: "single";
  value?: never;
  defaultValue?: DateValue;
  onChange?: (date: DateValue) => void;
};
type RangeControlled = {
  mode: "range";
  value: RangeValue;
  defaultValue?: never;
  onChange: (range: RangeValue) => void;
};
type RangeUncontrolled = {
  mode: "range";
  value?: never;
  defaultValue?: RangeValue;
  onChange?: (range: RangeValue) => void;
};

type DatePickerSharedProps = {
  /** Disable specific dates */
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  /** Attach a scrollable time column next to the calendar */
  withTime?: boolean;
  /** Time slot interval in minutes — defaults to 30 */
  timeStep?: number;
  numberOfMonths?: 1 | 2;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
};

export type DatePickerProps = DatePickerSharedProps &
  (SingleControlled | SingleUncontrolled | RangeControlled | RangeUncontrolled);

// ─── Size tokens ──────────────────────────────────────────────────────────────

const SIZE = {
  sm: {
    timeItem: "text-xs py-1.5 px-3",
    trigger: "h-8 text-xs px-2.5 gap-1.5 rounded-lg min-w-[180px]",
    trigIcon: 13,
    timeCol: "w-[96px]",
  },
  md: {
    timeItem: "text-sm py-2 px-4",
    trigger: "h-10 text-sm px-3 gap-2 rounded-xl min-w-[200px]",
    trigIcon: 15,
    timeCol: "w-[108px]",
  },
  lg: {
    timeItem: "text-sm py-2.5 px-5",
    trigger: "h-12 text-base px-4 gap-2.5 rounded-xl min-w-[220px]",
    trigIcon: 17,
    timeCol: "w-[120px]",
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlots(step = 30): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += step) {
      const hour = h % 12 || 12;
      const period = h < 12 ? "AM" : "PM";
      slots.push(`${hour}:${String(m).padStart(2, "0")} ${period}`);
    }
  }
  return slots;
}

function fmtDate(d?: Date): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtRange(range?: RangeValue): string {
  if (!range) return "";
  if (range.from && range.to)
    return `${fmtDate(range.from)} – ${fmtDate(range.to)}`;
  if (range.from) return `${fmtDate(range.from)} – ...`;
  return "";
}

// ─── TimeColumn ───────────────────────────────────────────────────────────────

function TimeColumn({
  value,
  onChange,
  step = 30,
  size = "md",
}: {
  value: string | null;
  onChange: (t: string) => void;
  step?: number;
  size?: keyof typeof SIZE;
}) {
  const s = SIZE[size];
  const slots = generateSlots(step);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected slot (or ~8 AM) on open
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const target = value ?? slots[Math.floor(slots.length * 0.33)];
    const idx = slots.indexOf(target);
    if (idx === -1) return;
    const itemH = vp.scrollHeight / slots.length;
    vp.scrollTop = idx * itemH - vp.clientHeight / 2 + itemH / 2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col border-l border-border/60 shrink-0 overflow-y-auto h-70",
        s.timeCol,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border/60 shrink-0">
        <IconClock size={12} className="text-muted-foreground" />
        <span className="text-bui-xs font-medium text-muted-foreground uppercase tracking-wide">
          Time
        </span>
      </div>

      {/* Slot list */}
      <ScrollArea className="flex-1" ref={viewportRef}>
        <div className="py-1">
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => onChange(slot)}
              className={cn(
                "w-full text-left font-medium transition-colors duration-150 whitespace-nowrap",
                s.timeItem,
                value === slot
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {slot}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

export function DatePicker({
  disabledDates = [],
  minDate,
  maxDate,
  withTime = false,
  timeStep = 30,
  numberOfMonths = 1,
  size = "md",
  disabled,
  placeholder,
  className,
  triggerClassName,
  mode,
  ...props
}: DatePickerProps) {
  const uid = useId();
  const resolvedMode = mode ?? "single";
  const isControlled = "value" in props && props.value !== undefined;
  const s = SIZE[size];

  // ── Uncontrolled internal state ──
  const [internalSingle, setInternalSingle] = useState<DateValue>(
    resolvedMode === "single" && !isControlled
      ? (props as SingleUncontrolled).defaultValue
      : undefined,
  );
  const [internalRange, setInternalRange] = useState<RangeValue>(
    resolvedMode === "range" && !isControlled
      ? ((props as RangeUncontrolled).defaultValue ?? ({} as DateRange))
      : ({} as DateRange),
  );

  // ── Time ──
  const [time, setTime] = useState<string | null>(null);

  // ── Derived values ──
  const currentSingle: DateValue =
    resolvedMode === "single"
      ? isControlled
        ? (props as SingleControlled).value
        : internalSingle
      : undefined;

  const currentRange: RangeValue =
    resolvedMode === "range"
      ? isControlled
        ? (props as RangeControlled).value
        : internalRange
      : ({} as DateRange);

  const hasValue =
    resolvedMode === "single"
      ? !!currentSingle
      : !!(currentRange.from || currentRange.to);

  const displayValue = (() => {
    if (resolvedMode === "single") {
      const base = fmtDate(currentSingle);
      return withTime && time && base ? `${base}, ${time}` : base;
    }
    return fmtRange(currentRange);
  })();

  // ── Disabled matcher for react-day-picker ──
  const disabledMatcher = [
    ...disabledDates,
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  // ── Handlers ──
  const handleSingleSelect = (date: DateValue) => {
    if (!isControlled) setInternalSingle(date);
    (props as SingleControlled).onChange?.(date);
  };

  const handleRangeSelect = (range: RangeValue | undefined) => {
    const next = range ?? ({} as DateRange);
    if (!isControlled) setInternalRange(next);
    (props as RangeControlled).onChange?.(next);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTime(null);
    if (resolvedMode === "single") {
      if (!isControlled) setInternalSingle(undefined);
      (props as SingleControlled).onChange?.(undefined);
    } else {
      if (!isControlled) setInternalRange({} as DateRange);
      (props as RangeControlled).onChange?.({} as DateRange);
    }
  };

  return (
    <Popover>
      {/* ── Trigger ── */}
      <PopoverTrigger asChild>
        <Button
          id={uid}
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start font-normal",
            !displayValue && "text-muted-foreground",
            s.trigger,
            triggerClassName,
            className,
          )}
        >
          <IconCalendar
            size={s.trigIcon}
            className="shrink-0 text-muted-foreground"
          />
          <span className="flex-1 truncate text-left">
            {displayValue ||
              (placeholder ??
                (resolvedMode === "range"
                  ? "Pick a date range"
                  : "Pick a date"))}
          </span>
          {hasValue && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleClear(e as unknown as React.MouseEvent)
              }
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconX size={s.trigIcon - 2} />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      {/* ── Panel ── */}
      <PopoverContent
        className="w-auto p-0 overflow-hidden rounded-2xl shadow-xl"
        align="start"
        sideOffset={8}
      >
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex"
        >
          {/* shadcn Calendar does all the heavy lifting */}
          {resolvedMode === "single" ? (
            <Calendar
              mode="single"
              selected={currentSingle}
              onSelect={handleSingleSelect}
              disabled={disabledMatcher.length ? disabledMatcher : undefined}
              numberOfMonths={numberOfMonths}
              initialFocus
            />
          ) : (
            <Calendar
              mode="range"
              selected={currentRange}
              onSelect={handleRangeSelect}
              disabled={disabledMatcher.length ? disabledMatcher : undefined}
              numberOfMonths={numberOfMonths}
              initialFocus
            />
          )}

          {/* Time column — same design as the screenshot */}
          {withTime && (
            <TimeColumn
              value={time}
              onChange={setTime}
              step={timeStep}
              size={size}
            />
          )}
        </motion.div>

        {/* Footer shown when withTime */}
        {withTime && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-muted-foreground tabular-nums">
                {displayValue || (
                  <span className="italic">No date selected</span>
                )}
              </span>
              <Button
                size="sm"
                disabled={!hasValue}
                className="h-7 rounded-lg text-xs"
              >
                Confirm
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = "DatePicker";
