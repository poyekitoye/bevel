import * as React from "react";
import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { PropertiesRow } from "./properties-panel-row";
import type { PropertyRowDef } from "./types";

export interface PropertiesSectionProps {
  title: string;
  rows?: PropertyRowDef[];
  defaultOpen?: boolean;
  icon?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
}

export function PropertiesSection({
  title,
  rows,
  defaultOpen = true,
  icon: Icon,
  children,
  className,
}: PropertiesSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className={cn("border-b border-border/60 last:border-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-muted/40 transition-colors group"
      >
        <IconChevronRight
          size={12}
          strokeWidth={2}
          className={cn(
            "text-muted-foreground/40 transition-transform shrink-0",
            open && "rotate-90",
          )}
        />
        {Icon && (
          <Icon
            size={12}
            strokeWidth={1.8}
            className="text-muted-foreground/50 shrink-0"
          />
        )}
        <span className="text-bui-2xs font-medium uppercase tracking-widest text-muted-foreground/70 select-none">
          {title}
        </span>
      </button>

      {open && (
        <div className="pb-1">
          {rows
            ?.filter((r) => !r.hidden)
            .map((row) => (
              <PropertiesRow
                key={row.id}
                label={row.label}
                control={row.control}
              />
            ))}

          {children}
        </div>
      )}
    </div>
  );
}

PropertiesSection.displayName = "PropertiesSection";
