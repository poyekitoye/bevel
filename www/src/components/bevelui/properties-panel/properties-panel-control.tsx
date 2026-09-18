"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { normalizeHex } from "../lib/color";
import type { PropertyControl } from "./types";

interface PropertiesControlProps {
  control: PropertyControl;
  /** Supplied by PropertiesRow so its label's htmlFor resolves. */
  id?: string;
  describedBy?: string;
}

const fieldClass = "h-8 bg-muted/50 px-2 text-bui-xs";

export function PropertiesControl({
  control,
  id,
  describedBy,
}: PropertiesControlProps) {
  switch (control.type) {
    case "text":
      return (
        <Input
          id={id}
          aria-describedby={describedBy}
          value={control.value}
          placeholder={control.placeholder}
          onChange={(e) => control.onChange(e.target.value)}
          className={cn("w-full", fieldClass)}
        />
      );

    case "number":
      return (
        <NumberControl control={control} id={id} describedBy={describedBy} />
      );

    case "color":
      return (
        <ColorControl control={control} id={id} describedBy={describedBy} />
      );

    case "select":
      return (
        <Select value={control.value} onValueChange={control.onChange}>
          <SelectTrigger
            id={id}
            aria-describedby={describedBy}
            className={cn("w-full", fieldClass)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {control.options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-bui-xs"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "toggle":
      return (
        <Switch
          id={id}
          aria-describedby={describedBy}
          checked={control.value}
          onCheckedChange={control.onChange}
        />
      );

    case "slider":
      return (
        <div className="flex items-center gap-2">
          <Slider
            id={id}
            aria-describedby={describedBy}
            value={[control.value]}
            min={control.min}
            max={control.max}
            step={control.step ?? 1}
            onValueChange={([v]) => control.onChange(v)}
            className="flex-1"
          />
          <span className="w-8 shrink-0 text-right font-mono text-bui-2xs tabular-nums text-muted-foreground">
            {control.value}
          </span>
        </div>
      );

    case "custom":
      return <>{control.render()}</>;

    default:
      return null;
  }
}

/**
 * Number input that can actually be edited.
 *
 * The original passed Number(e.target.value) straight to onChange on a
 * controlled input: clearing the field produced Number("") === 0 so the value
 * snapped to zero, and intermediate states like "-" or "1." were impossible
 * to type. The draft is local; the parsed value commits on blur or Enter.
 */
function NumberControl({
  control,
  id,
  describedBy,
}: {
  control: Extract<PropertyControl, { type: "number" }>;
  id?: string;
  describedBy?: string;
}) {
  const [draft, setDraft] = React.useState(String(control.value));

  React.useEffect(() => {
    setDraft(String(control.value));
  }, [control.value]);

  const commit = () => {
    const parsed = Number(draft);
    if (draft.trim() === "" || Number.isNaN(parsed)) {
      setDraft(String(control.value));
      return;
    }
    const clamped = Math.min(
      control.max ?? Infinity,
      Math.max(control.min ?? -Infinity, parsed),
    );
    setDraft(String(clamped));
    control.onChange(clamped);
  };

  return (
    <div className="flex items-center gap-1.5">
      <Input
        id={id}
        aria-describedby={describedBy}
        type="number"
        inputMode="decimal"
        value={draft}
        min={control.min}
        max={control.max}
        step={control.step ?? 1}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        className={cn("w-full font-mono", fieldClass)}
      />
      {control.unit && (
        <span className="shrink-0 select-none text-bui-2xs text-muted-foreground">
          {control.unit}
        </span>
      )}
    </div>
  );
}

/**
 * Colour swatch plus a free-text field.
 *
 * A native colour input only accepts #rrggbb, so any other notation the caller
 * passed — rgb(), a named colour, a 3-digit hex — silently showed black while
 * the label printed the original string.
 */
function ColorControl({
  control,
  id,
  describedBy,
}: {
  control: Extract<PropertyControl, { type: "color" }>;
  id?: string;
  describedBy?: string;
}) {
  const hex = normalizeHex(control.value) ?? "#000000";

  return (
    <div className="flex items-center gap-2">
      <label
        style={{ backgroundColor: hex }}
        className={cn(
          "relative flex size-6 shrink-0 cursor-pointer items-center justify-center rounded border border-border",
          // The real input is sr-only, so without a ring on the wrapper
          // keyboard focus here is completely invisible.
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1",
        )}
      >
        <span className="sr-only">Pick colour</span>
        <input
          id={id}
          aria-describedby={describedBy}
          type="color"
          value={hex}
          onChange={(e) => control.onChange(e.target.value)}
          className="sr-only"
        />
      </label>

      <input
        value={control.value}
        onChange={(e) => control.onChange(e.target.value)}
        spellCheck={false}
        aria-label="Colour value"
        className="w-full min-w-0 bg-transparent font-mono text-bui-xs uppercase text-muted-foreground outline-none focus-visible:text-foreground"
      />
    </div>
  );
}

PropertiesControl.displayName = "PropertiesControl";
