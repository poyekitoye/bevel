import * as React from "react";
import { cn } from "@/lib/utils";
import {
  IconInfoCircle,
  IconAlertTriangle,
  IconBulb,
  IconFlame,
} from "@tabler/icons-react";
import type { DocBlockCallout } from "@/content/docs/doc-schema";

const VARIANT_CONFIG: Record<
  DocBlockCallout["variant"],
  { icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; classes: string; iconClasses: string }
> = {
  info: {
    icon: IconInfoCircle,
    classes: "border-blue-500/25 bg-blue-500/[0.06]",
    iconClasses: "text-blue-500",
  },
  tip: {
    icon: IconBulb,
    classes: "border-emerald-500/25 bg-emerald-500/[0.06]",
    iconClasses: "text-emerald-500",
  },
  warning: {
    icon: IconAlertTriangle,
    classes: "border-amber-500/25 bg-amber-500/[0.06]",
    iconClasses: "text-amber-500",
  },
  danger: {
    icon: IconFlame,
    classes: "border-red-500/25 bg-red-500/[0.06]",
    iconClasses: "text-red-500",
  },
};

export function Callout({
  variant,
  title,
  content,
  className,
}: DocBlockCallout & { className?: string }) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      role={variant === "danger" || variant === "warning" ? "alert" : undefined}
      className={cn(
        "flex gap-2.5 rounded-md border px-3.5 py-3",
        config.classes,
        className,
      )}
    >
      <Icon size={16} strokeWidth={2} className={cn("mt-0.5 shrink-0", config.iconClasses)} />
      <div className="min-w-0 flex-1">
        {title && (
          <p className="mb-0.5 text-bui-base font-medium text-foreground">{title}</p>
        )}
        <p className="text-bui-base leading-relaxed text-muted-foreground">{content}</p>
      </div>
    </div>
  );
}
