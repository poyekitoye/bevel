"use client";

import * as React from "react";
import {
  IconArrowUpRight,
  IconBell,
  IconChartBar,
  IconCheck,
  IconLayoutDashboard,
  IconSettings,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import {
  TourRoot,
  TourAnchor,
  TourTrigger,
  useTour,
  type TourEndReason,
  type TourStepDef,
} from "@/components/bevelui/tour";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DemoIntro, DemoFeatureRow } from "./demo-chrome";

// ─── Steps ────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: IconLayoutDashboard, label: "Dashboard", active: true },
  { icon: IconChartBar, label: "Analytics" },
  { icon: IconUsers, label: "Users" },
  { icon: IconSettings, label: "Settings" },
];

const METRICS = [
  { label: "Revenue", value: "$48,295", delta: "+12.5%", up: true },
  { label: "Active users", value: "3,842", delta: "+8.1%", up: true },
  { label: "Churn rate", value: "2.4%", delta: "-0.3%", up: false },
  { label: "MRR", value: "$12,400", delta: "+5.2%", up: true },
];

// ─── Demo UI ──────────────────────────────────────────────────────────────────

function DashboardMock({
  exported,
  onExport,
}: {
  exported: boolean;
  onExport: () => void;
}) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-background">
      <TourAnchor step={1} asChild>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-bui-md font-semibold tracking-tight">
            Acme Inc.
          </span>
          <div className="flex items-center gap-2">
            <TourAnchor step={4}>
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-md p-1.5 transition-colors hover:bg-muted"
              >
                <IconBell size={15} strokeWidth={1.8} aria-hidden />
                <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
              </button>
            </TourAnchor>
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-bui-2xs font-semibold text-primary">
              A
            </span>
          </div>
        </div>
      </TourAnchor>

      <div className="flex">
        <TourAnchor step={2} asChild>
          <aside className="hidden w-36 shrink-0 flex-col gap-0.5 border-r border-border bg-muted/30 px-2 py-3 sm:flex">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.label}
                size="sm"
                variant={item.active ? "secondary" : "ghost"}
                className={cn(
                  "justify-start",
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <item.icon aria-hidden />
                {item.label}
              </Button>
            ))}
          </aside>
        </TourAnchor>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          <TourAnchor step={3} asChild>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {METRICS.map((m) => (
                <div
                  key={m.label}
                  className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/30 p-3"
                >
                  <span className="text-bui-xs text-muted-foreground">
                    {m.label}
                  </span>
                  <span className="text-bui-lg font-semibold tracking-tight">
                    {m.value}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-bui-xs font-medium",
                      m.up ? "text-emerald-500" : "text-red-500",
                    )}
                  >
                    <IconTrendingUp
                      size={10}
                      strokeWidth={2.5}
                      aria-hidden
                      className={!m.up ? "rotate-180" : ""}
                    />
                    {m.delta}
                  </span>
                </div>
              ))}
            </div>
          </TourAnchor>

          <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-4">
            <span className="text-bui-sm font-medium text-muted-foreground">
              Revenue over time
            </span>
            <div className="flex h-24 items-end gap-1 sm:h-32">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-primary/20"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Step 5 is interactive — the tour asks the user to press this and
              advances only once they do. */}
          <TourAnchor step={5} asChild>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={exported ? "secondary" : "default"}
                onClick={onExport}
              >
                {exported ? (
                  <>
                    <IconCheck size={14} aria-hidden />
                    Exported
                  </>
                ) : (
                  <>
                    Export CSV
                    <IconArrowUpRight size={14} aria-hidden />
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline">
                Invite team
                <IconArrowUpRight size={14} aria-hidden />
              </Button>
            </div>
          </TourAnchor>
        </div>
      </div>
    </div>
  );
}

/** Lives inside TourRoot so it can read and drive the tour. */
function DemoBody({ lastEnd }: { lastEnd: TourEndReason | null }) {
  const { currentStep, isOpen, next } = useTour();
  const [exported, setExported] = React.useState(false);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <DemoIntro eyebrow="Product Tour">
          A five-step onboarding tour over a dashboard. Step 5 is interactive —
          the spotlight hands the click back to the page and the tour waits for
          you to actually press the button.
        </DemoIntro>

        <TourTrigger label="Take a tour" />
      </div>

      <DashboardMock
        exported={exported}
        onExport={() => {
          setExported(true);
          // Advance only when this is the step being demonstrated.
          if (isOpen && currentStep === 5) next();
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <DemoFeatureRow
          items={[
            "bottom sheet < 640px",
            "rAF spotlight tracking",
            "interactive step",
            "focus trap",
            "← → · Esc",
          ]}
        />
        {lastEnd && (
          <span className="font-mono text-bui-2xs text-muted-foreground">
            last exit: {lastEnd}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function TourDemo() {
  // Distinguishing these is the point — the demo prints which one fired.
  const [lastEnd, setLastEnd] = React.useState<TourEndReason | null>(null);

  const steps = React.useMemo<TourStepDef[]>(
    () => [
      {
        step: 1,
        title: "Welcome to the dashboard",
        description:
          "Your command centre. We'll walk through the key areas so you know where everything lives.",
        side: "bottom",
      },
      {
        step: 2,
        title: "Navigation",
        description:
          "Jump between sections from here. The active page is always highlighted.",
        side: "right",
      },
      {
        step: 3,
        title: "Key metrics",
        description:
          "Your most important numbers at a glance. Every card drills through to the full report.",
        side: "bottom",
      },
      {
        step: 4,
        title: "Notifications",
        description:
          "New signups, failed payments and team activity all surface here.",
        side: "bottom",
      },
      {
        step: 5,
        title: "Try it yourself",
        description:
          "This step is interactive — press Export CSV and the tour will continue.",
        side: "top",
        interactive: true,
      },
    ],
    [],
  );

  return (
    <TourRoot steps={steps} onEnd={setLastEnd}>
      <DemoBody lastEnd={lastEnd} />
    </TourRoot>
  );
}
