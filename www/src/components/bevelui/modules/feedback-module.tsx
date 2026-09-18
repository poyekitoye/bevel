"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  type Icon,
  IconMessage,
  IconMoodAngry,
  IconMoodAngryFilled,
  IconMoodHappy,
  IconMoodHappyFilled,
  IconMoodNeutral,
  IconMoodNeutralFilled,
  IconMoodSad,
  IconMoodSadFilled,
  IconMoodSmile,
  IconMoodSmileFilled,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RatingField } from "../controls/rating-field";
import { useControllableState } from "../lib/use-controllable-state";
import { usePrefersReducedMotion } from "../lib/use-element-rect";

export type Feedback = { rating: number; comment?: string };

export interface FeedbackLevel {
  /** Announced and shown under the scale when this level is active. */
  label: string;
  color: string;
  icon?: Icon;
  emptyIcon?: Icon;
}

interface FeedbackModuleControlled {
  value: Feedback;
  defaultValue?: never;
  onChange: (feedback: Feedback) => void;
}

interface FeedbackModuleUncontrolled {
  value?: Feedback;
  defaultValue?: Feedback;
  onChange?: (feedback: Feedback) => void;
}

export type FeedbackModuleProps = {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  submitLabel?: string;
  showComment?: boolean;
  /** Require a comment before submit becomes available. */
  requireComment?: boolean;
  isLoading?: boolean;
  levels?: FeedbackLevel[];
  onSubmit?: (data: Feedback) => void;
  className?: string;
} & (FeedbackModuleControlled | FeedbackModuleUncontrolled);

const DEFAULT_LEVELS: FeedbackLevel[] = [
  {
    label: "Very poor",
    color: "var(--color-red-500)",
    icon: IconMoodAngryFilled,
    emptyIcon: IconMoodAngry,
  },
  {
    label: "Poor",
    color: "var(--color-orange-400)",
    icon: IconMoodSadFilled,
    emptyIcon: IconMoodSad,
  },
  {
    label: "Okay",
    color: "var(--color-amber-400)",
    icon: IconMoodNeutralFilled,
    emptyIcon: IconMoodNeutral,
  },
  {
    label: "Good",
    color: "var(--color-emerald-400)",
    icon: IconMoodSmileFilled,
    emptyIcon: IconMoodSmile,
  },
  {
    label: "Excellent",
    color: "var(--color-green-400)",
    icon: IconMoodHappyFilled,
    emptyIcon: IconMoodHappy,
  },
];

function FeedbackModule({
  title = "How was your experience?",
  subtitle = "Your feedback helps us improve.",
  placeholder = "Share more details about your experience…",
  submitLabel = "Send feedback",
  showComment = true,
  requireComment = false,
  isLoading,
  levels = DEFAULT_LEVELS,
  onSubmit,
  className,
  value,
  defaultValue,
  onChange,
}: FeedbackModuleProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [hover, setHover] = React.useState(0);

  // The original derived `isControlled` from a rest object that `value` had
  // already been destructured out of, so it was permanently false and the
  // component ignored every controlled update it was handed.
  const [feedback, setFeedback] = useControllableState<Feedback>({
    value,
    defaultValue: defaultValue ?? { rating: 0 },
    onChange,
  });

  const rating = feedback?.rating ?? 0;
  const comment = feedback?.comment ?? "";

  // Levels are 1-indexed against the rating; hovering previews that level's
  // label. These labels were defined in the original but never reached the UI.
  const activeLevel = levels[(hover || rating) - 1];

  const canSubmit =
    rating > 0 && (!requireComment || comment.trim().length > 0) && !isLoading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.({ rating, comment: comment || undefined });
  };

  const collapse = reduceMotion
    ? {}
    : {
        initial: { height: 0, opacity: 0 },
        animate: { height: "auto" as const, opacity: 1 },
        exit: { height: 0, opacity: 0 },
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <div className={cn("w-full rounded-2xl md:p-4", className)}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-bui-lg font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="max-w-[28ch] text-bui-base leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <RatingField
            max={levels.length}
            value={rating}
            single
            levels={levels}
            label="Rate your experience"
            onHover={setHover}
            onChange={(next) => setFeedback({ rating: next, comment })}
          />

          {/* Reserve the line's height so naming the level does not shift the
              layout every time the pointer crosses a star. */}
          <div className="flex h-4 items-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeLevel?.label ?? "empty"}
                initial={reduceMotion ? false : { opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -2 }}
                transition={{ duration: 0.12 }}
                className="text-bui-2xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {activeLevel?.label ?? "Tap a star to begin"}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {showComment && (
          <AnimatePresence initial={false}>
            {rating > 0 && (
              <motion.div {...collapse} className="overflow-hidden">
                <div className="flex flex-col gap-4 pt-1">
                  <div className="relative">
                    <IconMessage
                      className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground/50"
                      aria-hidden
                    />
                    <Textarea
                      value={comment}
                      onChange={(e) =>
                        setFeedback({ rating, comment: e.target.value })
                      }
                      placeholder={placeholder}
                      aria-label="Additional feedback"
                      className="max-h-[120px] min-h-[100px] resize-none rounded-xl pl-9"
                    />
                  </div>

                  {onSubmit && (
                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      size="lg"
                      className="h-11 w-full rounded-xl font-medium"
                    >
                      {isLoading ? "Sending…" : submitLabel}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

FeedbackModule.displayName = "FeedbackModule";

export { FeedbackModule };
