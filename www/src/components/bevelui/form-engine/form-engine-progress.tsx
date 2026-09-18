import { type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useFormEngineContext } from "./form-engine-context";

export type FormEngineProgressVariant =
  | "circle"
  | "dots"
  | "segments"
  | "numbers";
export type FormEngineProgressState = "active" | "inactive" | "completed";

export interface FormEngineProgressProps {
  className?: string;
  variant?: FormEngineProgressVariant;
  /** Only used by the "circle" variant — size of the SVG in px */
  size?: number;
  /** Only used by the "circle" variant — stroke width */
  strokeWidth?: number;
  /** Only used by the "numbers" variant — show current step label */
  label?: string;
  /** Escape hatch: render each step yourself */
  renderStep?: (index: number, state: FormEngineProgressState) => ReactNode;
}

interface CircleProgressProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function CircleProgress({
  current,
  total,
  size = 48,
  strokeWidth = 3,
  className,
}: CircleProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = (current + 1) / total;
  const offset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-foreground/10"
        />
        {/* Fill */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="stroke-primary"
          style={{
            strokeDasharray: circumference,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </svg>

      {/* Center label */}
      <span className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={current}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            className="text-bui-2xs font-semibold tabular-nums text-foreground/70 leading-none"
            style={{ fontSize: size < 44 ? 9 : 11 }}
          >
            {current + 1}/{total}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

interface PillStepProps {
  state: FormEngineProgressState;
  className?: string;
  onClick?: () => void;
}

const PILL_STYLE: Record<
  FormEngineProgressState,
  { width: number; bg: string }
> = {
  active: { width: 24, bg: "bg-primary" },
  completed: { width: 6, bg: "bg-foreground/60" },
  inactive: { width: 6, bg: "bg-foreground/20" },
};

function FormEngineProgressPill({ state, className, onClick }: PillStepProps) {
  const { width, bg } = PILL_STYLE[state];
  const isActive = state === "active";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative py-4 flex items-center",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <motion.div
        initial={false}
        animate={{ width }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn("h-1.5 rounded-full", bg)}
      />

      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="pill-glow"
            className="absolute inset-0 bg-primary/40 blur-md rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface SegmentProps {
  state: FormEngineProgressState;
  onClick?: () => void;
}

function Segment({ state, onClick }: SegmentProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex-1 h-1 rounded-full overflow-hidden cursor-pointer",
        "bg-foreground/10",
      )}
    >
      <motion.div
        className="absolute inset-y-0 left-0 bg-primary rounded-full origin-left"
        initial={false}
        animate={{
          scaleX: state === "completed" ? 1 : state === "active" ? 1 : 0,
          opacity: state === "inactive" ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      />
      {/* Shimmer on active segment */}
      <AnimatePresence>
        {state === "active" && (
          <motion.div
            className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-transparent via-foreground/30 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface NumbersProps {
  current: number;
  total: number;
  label?: string;
  className?: string;
}

function NumbersProgress({ current, total, label, className }: NumbersProps) {
  const pct = Math.round(((current + 1) / total) * 100);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      <div className="flex items-baseline justify-between">
        <AnimatePresence mode="wait">
          <motion.span
            key={current}
            className="text-sm font-medium text-foreground"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {label ?? `Step ${current + 1}`}
          </motion.span>
        </AnimatePresence>

        <span className="text-xs tabular-nums text-foreground/50">
          {current + 1} / {total}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-1 w-full rounded-full bg-foreground/10 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 24 }}
        />
        {/* Shimmer */}
        <motion.div
          className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          style={{ left: `${pct}%`, translateX: "-100%" }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

export function FormEngineProgress({
  className,
  variant = "segments",
  size = 48,
  strokeWidth = 3,
  label,
  renderStep,
}: FormEngineProgressProps) {
  const { currentStep, totalSteps, goTo } = useFormEngineContext();
  const steps = Array.from({ length: totalSteps });

  function getState(i: number): FormEngineProgressState {
    if (i === currentStep) return "active";
    if (i < currentStep) return "completed";
    return "inactive";
  }

  if (renderStep) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {steps.map((_, i) => renderStep(i, getState(i)))}
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <CircleProgress
        current={currentStep}
        total={totalSteps}
        size={size}
        strokeWidth={strokeWidth}
        className={className}
      />
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        {steps.map((_, i) => (
          <FormEngineProgressPill
            key={i}
            state={getState(i)}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    );
  }

  if (variant === "segments") {
    return (
      <div className={cn("flex items-center gap-1.5 w-full", className)}>
        {steps.map((_, i) => (
          <Segment key={i} state={getState(i)} onClick={() => goTo(i)} />
        ))}
      </div>
    );
  }

  if (variant === "numbers") {
    return (
      <NumbersProgress
        current={currentStep}
        total={totalSteps}
        label={label}
        className={className}
      />
    );
  }

  return null;
}

FormEngineProgress.displayName = "FormEngineProgress";
