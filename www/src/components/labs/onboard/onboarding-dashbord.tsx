import { TourRoot, TourAnchor } from "@/components/bevelui/tour";
import { Button } from "@/components/ui/button";
import {
  IconBoltFilled,
  IconLayoutDashboard,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconBell,
  IconTrendingUp,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { BevelIcon } from "@/components/shared/brand-mark";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const TOUR_STEPS = [
  {
    step: 1,
    title: "Welcome to your workspace",
    description:
      "Everything you need is here. Let us show you around — it'll take 30 seconds.",
    side: "bottom" as const,
  },
  {
    step: 2,
    title: "Your navigation",
    description:
      "Switch between Dashboard, Users, Analytics, and Settings from here.",
    side: "right" as const,
  },
  {
    step: 3,
    title: "Key metrics",
    description:
      "Your most important numbers at a glance. Click any card to drill in.",
    side: "bottom" as const,
  },
  {
    step: 4,
    title: "Notifications",
    description: "New signups, alerts, and activity appear here.",
    side: "bottom" as const,
  },
];

export function OnboardingDashboard({
  name,
  company,
}: {
  name: string;
  company: string;
}) {
  return (
    <TourRoot showOverlay={false} steps={TOUR_STEPS} defaultOpen>
      <div className="flex h-full rounded-xl overflow-hidden border border-border bg-background">
        {/* Sidebar */}
        <TourAnchor step={2} asChild>
          <aside className="w-64 shrink-0 border-r border-border bg-muted/10 flex flex-col py-4 px-3 gap-6">
            <div className="px-2  p-2 ">
              <div className={"flex items-end gap-2"}>
                <BevelIcon className="size-6! shrink-0 -translate-y-1.5 text-rose-400" />
                <span className="font-semibold  font-sans text-lg line-clamp-1">
                  {company || "My Workspace"}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                Free plan
              </span>
            </div>

            <div className=" flex flex-col gap-1">
              {[
                { icon: IconLayoutDashboard, label: "Dashboard", active: true },
                { icon: IconUsers, label: "Users", active: false },
                { icon: IconChartBar, label: "Analytics", active: false },
                { icon: IconSettings, label: "Settings", active: false },
              ].map((item) => (
                <Button
                  key={item.label}
                  variant={"ghost"}
                  className={cn(
                    "text-left justify-start",
                    item.active
                      ? "bg-rose-500/10 text-rose-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <item.icon size={13} strokeWidth={1.8} />
                  {item.label}
                </Button>
              ))}
            </div>
          </aside>
        </TourAnchor>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
            <div>
              <h2 className="text-2xl font-semibold font-sans">
                Welcome, {name || "there"} 👋
              </h2>
            </div>
            <TourAnchor step={4}>
              <Button size={"icon"} variant={"outline"}>
                <IconBell size={14} strokeWidth={1.8} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
              </Button>
            </TourAnchor>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
            <TourAnchor step={3}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    label: "Total users",
                    value: "0",
                    desc: "Total number of users",
                    delta: "—",
                  },
                  {
                    label: "Active today",
                    value: "0",
                    desc: "Users active today",
                    delta: "—",
                  },
                  {
                    label: "Revenue",
                    value: "$0",
                    desc: "Total revenue generated",
                    delta: "—",
                  },
                  {
                    label: "Conversion",
                    value: "0%",
                    desc: "Conversion rate",
                    delta: "—",
                  },
                ].map((m) => (
                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>{m.label}</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {m.value}
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <IconTrendingUp />
                          +12.5%
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Trending up this month{" "}
                        <IconTrendingUp className="size-4" />
                      </div>
                      <div className="text-muted-foreground">{m.desc}</div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TourAnchor>

            <Empty>
              <EmptyMedia variant={"icon"}>
                <IconChartBar />
              </EmptyMedia>
              <EmptyContent>
                <EmptyTitle className="text-sm text-muted-foreground">
                  No data yet. Start inviting users to see activity here.
                </EmptyTitle>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <IconUsers size={12} />
                  Invite team members
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        </div>
      </div>
    </TourRoot>
  );
}
