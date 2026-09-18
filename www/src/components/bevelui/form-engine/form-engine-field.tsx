"use client";

import * as React from "react";
import {
  useController,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFormEngineContext } from "./form-engine-context";
import type {
  CheckboxProps,
  FieldRenderProps,
  FormEngineFieldDef,
  SelectProps,
  TextareaProps,
  TextInputProps,
} from "./types";

/**
 * useFormEngineField — read and write a single field from within the engine.
 * Integrates with react-hook-form for validation and error messages.
 */
export function useFormEngineField(key: string, rules?: RegisterOptions) {
  const ctx = useFormEngineContext();

  const { field, fieldState } = useController({
    name: key as Path<Record<string, unknown>>,
    control: ctx.form.control,
    rules,
  });

  return {
    value: field.value,
    onChange: (value: unknown) => {
      field.onChange(value);
      ctx.setFieldValue(key, value);
    },
    onBlur: field.onBlur,
    visible: ctx.fieldState[key]?.visible ?? true,
    disabled: ctx.fieldState[key]?.disabled ?? false,
    error: fieldState.error?.message,
  };
}

interface FormEngineFieldProps {
  field: FormEngineFieldDef;
}

export function FormEngineField({ field }: FormEngineFieldProps) {
  const rules = React.useMemo<RegisterOptions>(
    () =>
      ({
        ...(field.required
          ? {
              required:
                typeof field.required === "string"
                  ? field.required
                  : `${field.label ?? field.key} is required`,
            }
          : {}),
        ...(field.rules ?? {}),
      }) as RegisterOptions,
    [field.required, field.rules, field.label, field.key],
  );

  const { value, onChange, onBlur, visible, disabled, error } =
    useFormEngineField(field.key, rules);

  const describedBy = error ? `${field.key}-error` : undefined;

  if (!visible) return null;

  function renderControl(): React.ReactNode {
    switch (field.variant) {
      case "text":
      case "email":
      case "number":
      case "tel":
      case "url":
      case "password": {
        const { icon: Icon, ...rest } = (field.props ?? {}) as TextInputProps;
        return (
          <InputGroup>
            <InputGroupInput
              {...rest}
              id={field.key}
              type={field.variant}
              value={(value as string) ?? ""}
              onChange={(e) =>
                onChange(
                  field.variant === "number"
                    ? // Preserve an empty field instead of coercing it to 0,
                      // which made the input impossible to clear.
                      e.target.value === ""
                      ? ""
                      : e.target.valueAsNumber
                    : e.target.value,
                )
              }
              onBlur={onBlur}
              placeholder={field.placeholder}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={describedBy}
            />
            {Icon && (
              <InputGroupAddon align="inline-end">
                <Icon className="size-4 text-muted-foreground" aria-hidden />
              </InputGroupAddon>
            )}
          </InputGroup>
        );
      }

      // Declared in the variant union since the beginning, but the switch had
      // no case for it — the field rendered a label above nothing at all.
      case "textarea": {
        const {
          rows = 4,
          maxLength,
          showCount,
          ...rest
        } = (field.props ?? {}) as TextareaProps;
        const text = (value as string) ?? "";

        return (
          <div className="flex flex-col gap-1">
            <Textarea
              {...rest}
              id={field.key}
              rows={rows}
              maxLength={maxLength}
              value={text}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              placeholder={field.placeholder}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={describedBy}
            />
            {showCount && maxLength ? (
              <span
                className={cn(
                  "self-end text-bui-2xs tabular-nums",
                  text.length >= maxLength
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {text.length}/{maxLength}
              </span>
            ) : null}
          </div>
        );
      }

      case "select": {
        const { options, ...rest } = (field.props ?? {
          options: [],
        }) as SelectProps;
        return (
          <Select
            value={(value as string) ?? ""}
            onValueChange={onChange}
            disabled={disabled}
            {...rest}
          >
            <SelectTrigger
              id={field.key}
              aria-invalid={!!error}
              aria-describedby={describedBy}
              className="w-full"
            >
              <SelectValue placeholder={field.placeholder ?? "Select…"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case "checkbox":
      case "switch": {
        const { hint } = (field.props ?? {}) as CheckboxProps;
        const Control = field.variant === "switch" ? Switch : Checkbox;
        return (
          <div className="flex items-start gap-2.5">
            <Control
              id={field.key}
              checked={!!value}
              onCheckedChange={(checked: boolean) => onChange(checked)}
              disabled={disabled}
              aria-describedby={describedBy}
            />
            {hint && (
              <label
                htmlFor={field.key}
                className="text-bui-sm leading-snug text-muted-foreground"
              >
                {hint}
              </label>
            )}
          </div>
        );
      }

      case "custom": {
        const renderProps: FieldRenderProps = {
          value,
          onChange,
          onBlur,
          error,
          disabled,
        };
        return field.render(renderProps);
      }

      default: {
        // Exhaustiveness guard: adding a variant to the union without a case
        // here is now a compile error rather than a silently empty field.
        const _never: never = field;
        void _never;
        return null;
      }
    }
  }

  return (
    <Field className={cn(field.className)}>
      {field.label && (
        <FieldLabel htmlFor={field.key}>
          {field.label}
          {field.required && (
            <span className="ms-1 text-destructive" aria-hidden>
              *
            </span>
          )}
        </FieldLabel>
      )}

      {renderControl()}

      {error && (
        <FieldError id={`${field.key}-error`} role="alert">
          {error}
        </FieldError>
      )}
    </Field>
  );
}

FormEngineField.displayName = "FormEngineField";
