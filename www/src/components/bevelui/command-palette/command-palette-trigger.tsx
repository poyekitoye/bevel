"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useCommandPalette } from "./command-palette-context";

export interface CommandPaletteTriggerProps {
  className?: string;
  label?: string;
  /** Render icon-only. */
  hideAddon?: boolean;
  asChild?: boolean;
  children?: React.ReactNode;
}

export function CommandPaletteTrigger({
  className,
  label = "Search…",
  hideAddon = false,
  asChild = false,
  children,
}: CommandPaletteTriggerProps) {
  const { open } = useCommandPalette();

  // ⌘ on Apple platforms, Ctrl elsewhere. The original always printed ⌘,
  // which is simply the wrong key on Windows and Linux.
  const [modKey, setModKey] = React.useState("⌘");
  React.useEffect(() => {
    const isApple = /mac|iphone|ipad|ipod/i.test(navigator.platform ?? "");
    setModKey(isApple ? "⌘" : "Ctrl");
  }, []);

  const triggerProps = {
    onClick: open,
    "aria-label": label,
    "aria-keyshortcuts": "Meta+K Control+K",
    className: cn(
      "flex h-8 items-center gap-2 rounded-lg px-3 text-bui-sm",
      hideAddon && "w-9 px-0 justify-center",
      className,
    ),
  };

  if (asChild) return <Slot {...triggerProps}>{children}</Slot>;

  return (
    <Button variant="outline" {...triggerProps}>
      <IconSearch size={14} strokeWidth={1.8} aria-hidden />
      {!hideAddon && (
        <>
          <span className="flex-1 text-left text-muted-foreground">{label}</span>
          <KbdGroup>
            <Kbd>{modKey}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </>
      )}
    </Button>
  );
}

CommandPaletteTrigger.displayName = "CommandPaletteTrigger";
