"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useControllableState } from "../lib/use-controllable-state";

const tagVariants = cva(
  "inline-flex select-none items-center gap-1 rounded-md font-medium",
  {
    variants: {
      size: {
        sm: "h-5 px-1.5 text-bui-2xs",
        md: "h-6 px-2 text-bui-sm",
        lg: "h-7 px-2.5 text-bui-md",
      },
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-border text-foreground",
        ghost: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { size: "md", variant: "secondary" },
  },
);

export type TagInputProps = {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  max?: number;
  allowDuplicates?: boolean;
  /** Keys or characters that commit the current input. */
  delimiter?: string[];
  placeholder?: string;
  /** Return false, or a string, to reject a tag. A string is shown as the reason. */
  validate?: (val: string) => boolean | string;
  disabled?: boolean;
  invalid?: boolean;
  isLoading?: boolean;
  label?: string;
  className?: string;
  tagClassName?: string;
} & VariantProps<typeof tagVariants>;

function Tag({
  value,
  size,
  variant,
  className,
  onRemove,
}: {
  value: string;
  size?: VariantProps<typeof tagVariants>["size"];
  variant?: VariantProps<typeof tagVariants>["variant"];
  className?: string;
  onRemove?: () => void;
}) {
  return (
    <span className={cn(tagVariants({ size, variant }), className)}>
      {value}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${value}`}
          onClick={onRemove}
          className="ml-0.5 rounded-sm opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <IconX className="size-3" aria-hidden />
        </button>
      )}
    </span>
  );
}

export function TagInput({
  variant = "secondary",
  size = "md",
  isLoading,
  disabled,
  invalid,
  max,
  value,
  defaultValue,
  onChange,
  label,
  placeholder = "Add tag…",
  delimiter = [",", "Enter"],
  allowDuplicates = false,
  validate,
  className,
  tagClassName,
}: TagInputProps) {
  const [tags, setTags] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange,
  });

  // The input is controlled now. The original wrote to e.currentTarget.value
  // directly, which meant no paste handling and no way to inspect the draft.
  const [draft, setDraft] = React.useState("");
  const [reason, setReason] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const current = tags ?? [];
  const isFull = max !== undefined && current.length >= max;

  const reject = (message: string) => {
    // Every rejection used to be silent — a tag simply failed to appear and
    // the user was given no reason at all.
    setReason(message);
    window.setTimeout(() => setReason(null), 2400);
  };

  const commit = React.useCallback(
    (raw: string): boolean => {
      const trimmed = raw.trim();
      if (!trimmed) return false;

      if (isFull) {
        reject(`Up to ${max} tag${max === 1 ? "" : "s"}.`);
        return false;
      }
      if (!allowDuplicates && current.includes(trimmed)) {
        reject(`“${trimmed}” has already been added.`);
        return false;
      }
      if (validate) {
        const result = validate(trimmed);
        if (result !== true) {
          reject(typeof result === "string" ? result : `“${trimmed}” is not valid.`);
          return false;
        }
      }

      setTags([...current, trimmed]);
      setReason(null);
      return true;
    },
    [current, isFull, max, allowDuplicates, validate, setTags],
  );

  const removeAt = (index: number) => {
    setTags(current.filter((_, i) => i !== index));
  };

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // IME composition must finish before a key means anything.
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Backspace" && draft === "" && current.length) {
      e.preventDefault();
      removeAt(current.length - 1);
      return;
    }

    if (delimiter.includes(e.key)) {
      e.preventDefault();
      if (commit(draft)) setDraft("");
    }
  }

  /** Splitting a paste on the delimiters is the behaviour people expect. */
  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    const chars = delimiter.filter((d) => d.length === 1);
    if (!chars.length || !chars.some((c) => text.includes(c))) return;

    e.preventDefault();
    const pattern = new RegExp(`[${chars.map((c) => `\\${c}`).join("")}]`);
    let added = 0;
    for (const part of text.split(pattern)) {
      if (commit(part)) added += 1;
    }
    if (added) setDraft("");
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        onClick={() => inputRef.current?.focus()}
        aria-disabled={disabled}
        className={cn(
          "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-bui-md shadow-xs",
          "transition-[color,box-shadow]",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
          (invalid || reason) &&
            "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
          "dark:bg-input/30",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        {isLoading ? (
          // Capped, so max={50} no longer renders fifty skeletons.
          Array.from({ length: Math.min(max ?? 3, 3) }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(tagVariants({ size }), "bg-muted")}
              style={{ width: `${3 + i * 1.2}rem` }}
            />
          ))
        ) : (
          <>
            <ul className="contents" aria-label={label ?? "Tags"}>
              {current.map((tag, i) => (
                <li key={`${tag}-${i}`} className="contents">
                  <Tag
                    value={tag}
                    size={size}
                    variant={variant}
                    className={tagClassName}
                    onRemove={disabled ? undefined : () => removeAt(i)}
                  />
                </li>
              ))}
            </ul>

            <input
              ref={inputRef}
              value={draft}
              disabled={disabled || isFull}
              aria-label={label ?? "Add a tag"}
              aria-invalid={invalid || !!reason}
              aria-describedby={reason ? "bui-tag-input-reason" : undefined}
              placeholder={
                isFull ? "" : current.length ? undefined : placeholder
              }
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
              onBlur={() => {
                if (commit(draft)) setDraft("");
              }}
              className="min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-1">
        <p
          id="bui-tag-input-reason"
          role={reason ? "alert" : undefined}
          className="text-bui-xs text-destructive empty:hidden"
        >
          {reason}
        </p>
        {max !== undefined && (
          <span
            className={cn(
              "ml-auto shrink-0 text-bui-xs tabular-nums",
              isFull ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {current.length}/{max}
          </span>
        )}
      </div>
    </div>
  );
}

TagInput.displayName = "TagInput";
