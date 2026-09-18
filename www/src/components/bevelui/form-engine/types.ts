import type { JSX, ReactNode } from "react";
import type {
  FieldErrors,
  RegisterOptions,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";

/**
 * Minimal structural type for a standard-schema validator (zod, valibot, …).
 * Replaces `schema?: any`, which discarded every bit of inference a form
 * engine exists to provide.
 */
export type ZodLikeSchema = {
  parse: (data: unknown) => unknown;
  safeParse: (data: unknown) => { success: boolean; [k: string]: unknown };
  [x: string]: unknown;
};
export type FormEngineMode = "multi-step" | "single";
export type FormEngineValidation = "per-step" | "on-submit";

/**
 * Plugins and step guards can return a plain boolean (true = pass) or a
 * structured result. When errors are returned, they are automatically
 * set on the form fields — no extra wiring required.
 *
 * @example
 * return { success: false, errors: { email: "This email is already taken." } }
 */
export type FormEngineValidateResult =
  | boolean
  | { success: false; errors: Record<string, string> };

/**
 * Plugins are the primary extension point. They hook into every lifecycle
 * event and can block navigation, surface errors, run analytics, etc.
 *
 * @example
 * plugins={[
 *   createZodPlugin(schemas),
 *   createAnalyticsPlugin((event, data) => mixpanel.track(event, data)),
 * ]}
 */
export type FormEnginePlugin = {
  name: string;
  onMount?: (values: Record<string, unknown>) => void;
  onStepChange?: (step: number, values: Record<string, unknown>) => void;
  onFieldChange?: (
    field: string,
    value: unknown,
    values: Record<string, unknown>,
  ) => void;
  /**
   * Return false or { success: false, errors } to block navigation.
   * Structured errors are automatically applied to the form fields.
   * Runs after per-step validation passes.
   */
  onValidate?: (
    step: number,
    values: Record<string, unknown>,
  ) => Promise<FormEngineValidateResult> | FormEngineValidateResult;
  onSubmit?: (values: Record<string, unknown>) => Promise<void>;
};

/**
 * Props passed into a custom render function.
 * Gives you full control over value, change handler, blur, error, and disabled.
 *
 * @example
 * {
 *   key: "color",
 *   variant: "custom",
 *   label: "Brand color",
 *   render: ({ value, onChange, error }) => (
 *     <ColorPicker value={value as string} onChange={onChange} error={error} />
 *   ),
 * }
 */
export type FieldRenderProps = {
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  error?: string;
  disabled: boolean;
};

export type TextareaProps = {
  rows?: number;
  maxLength?: number;
  /** Show a live character counter when maxLength is set. */
  showCount?: boolean;
  [x: string]: unknown;
};

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = {
  options: SelectOption[];
  [x: string]: unknown;
};

export type CheckboxProps = {
  /** Copy shown next to the control. */
  hint?: string;
  [x: string]: unknown;
};

export type TextInputProps = {
  icon?: React.ElementType;
  [x: string]: unknown;
};

export type FormEngineFieldVariant =
  | { variant: "text"; props?: TextInputProps; render?: never }
  | { variant: "number"; props?: TextInputProps; render?: never }
  | { variant: "email"; props?: TextInputProps; render?: never }
  | { variant: "password"; props?: TextInputProps; render?: never }
  | { variant: "url"; props?: TextInputProps; render?: never }
  // `tel` read `{ props?: never; render?: TextInputProps }` — a copy-paste
  // slip that made the one variant unable to accept props and typed its
  // render slot as input props rather than a render function.
  | { variant: "tel"; props?: TextInputProps; render?: never }
  | { variant: "textarea"; props?: TextareaProps; render?: never }
  | { variant: "select"; props?: SelectProps; render?: never }
  | { variant: "checkbox"; props?: CheckboxProps; render?: never }
  | { variant: "switch"; props?: CheckboxProps; render?: never }
  /**
   * Fully custom — you own the control.
   * The engine wires up value, onChange, error, and disabled for you.
   */
  | {
      variant: "custom";
      props?: never;
      render: (props: FieldRenderProps) => ReactNode;
    };

export type FormEngineFieldDef = {
  /** Must match a key in your form values. */
  key: string;
  label?: string;
  placeholder?: string;
  /**
   * Marks the field as required.
   * - true → "{{label}} is required"
   * - string → your custom message
   */
  required?: boolean | string;
  disabled?: boolean;
  className?: string;
  defaultValue?: unknown;
  /**
   * Additional react-hook-form validation rules (pattern, minLength, etc.).
   * Merged with the required rule if both are set.
   */
  rules?: Omit<RegisterOptions, "required">;
  /**
   * Conditionally show or hide this field based on current form values.
   * @example showWhen: (values) => values.plan === "pro"
   */
  showWhen?: (values: Record<string, unknown>) => boolean;
} & FormEngineFieldVariant;

export type FormEngineStepDef = {
  id: string;
  title?: string;
  description?: string;
  /**
   * Field definitions for config-driven rendering via FormEngineStepCanvas.
   * Omit when using FormEngineStep children for headless composition.
   */
  fields?: FormEngineFieldDef[];
  /**
   * Step-level validate function. Called before plugins.
   * Use this to wire in any form library — the engine doesn't care what's inside.
   *
   * @example — react-hook-form
   * validate: () => form.trigger(["name", "email"])
   *
   * @example — custom async check
   * validate: async () => {
   *   const ok = await checkUsername(values.username);
   *   return ok || false;
   * }
   */
  validate?: () => Promise<boolean> | boolean;
  /**
   * Async guard — called after validate() passes.
   * Return false to block navigation without showing an error (e.g. soft checks).
   */
  guard?: (values: Record<string, unknown>) => Promise<boolean> | boolean;
  /**
   * Custom layout for field-driven steps. Receives rendered fields and actions.
   *
   * @example
   * layout: (fields, actions) => (
   *   <div className="grid grid-cols-2 gap-8">
   *     <div>{fields}</div>
   *     <div className="mt-auto">{actions}</div>
   *   </div>
   * )
   */
  layout?: (fields: JSX.Element) => JSX.Element;
};

export type FormEngineConfig = {
  id?: string;
  mode?: FormEngineMode;
  validation?: FormEngineValidation;
  /** Custom react-hook-form resolver (e.g. zodResolver, yupResolver). */
  resolver?: UseFormProps["resolver"];
  /**
   * Full-form Zod schema applied on submit.
   * For per-step validation with field-level errors, use createZodPlugin().
   */
  /** Full-form schema applied on submit (zod, yup, …). */
  schema?: ZodLikeSchema;
  steps: FormEngineStepDef[];
};

export type FormEngineFieldState = {
  visible: boolean;
  disabled: boolean;
};

export type FormDefaultValues = Record<number, Record<string, unknown>>;

export type FormEngineContextValue = {
  /** The react-hook-form instance. Exposed for advanced consumers. */
  form: UseFormReturn<Record<string, unknown>>;
  values: Record<string, unknown>;
  setFieldValue: (field: string, value: unknown) => void;

  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goNext: () => Promise<void>;
  goBack: () => void;
  goTo: (step: number) => void;

  /** Computed visibility/disabled state per field key. */
  fieldState: Record<string, FormEngineFieldState>;

  isSubmitting: boolean;
  isValidating: boolean;
  errors: FieldErrors<Record<string, unknown>>;

  config: FormEngineConfig;
  plugins: FormEnginePlugin[];
};

export type FormEngineProps = {
  config: FormEngineConfig;
  defaultValues?: FormDefaultValues;
  plugins?: FormEnginePlugin[];
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  className?: string;
};

export type FormEngineRootProps = {
  config: FormEngineConfig;
  defaultValues?: FormDefaultValues;
  plugins?: FormEnginePlugin[];
  className?: string;
  children: ReactNode;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
};
