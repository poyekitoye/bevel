"use client";

import * as React from "react";
import { IconSettings } from "@tabler/icons-react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

function Shortcut({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <KbdGroup>
        {keys.map((k) => (
          <Kbd key={k}>{k}</Kbd>
        ))}
      </KbdGroup>
      <span className="text-bui-xs">{label}</span>
    </span>
  );
}

export interface CommandPaletteFooterProps {
  onSettings?: () => void;
}

export function CommandPaletteFooter({ onSettings }: CommandPaletteFooterProps) {
  return (
    <div className="flex items-center gap-3 border-t border-border/60 bg-muted/20 px-3 py-2">
      <div className="no-scrollbar flex min-w-0 flex-1 items-center justify-between gap-3 overflow-x-auto">
        {/* ↑ ↓ — the original printed ⇧ (shift) and ⇩ for "Select". */}
        <Shortcut keys={["↑", "↓"]} label="Navigate" />
        <Shortcut keys={["↵"]} label="Open" />
        <Shortcut keys={["Esc"]} label="Close" />
      </div>

      {onSettings && (
        <button
          type="button"
          onClick={onSettings}
          aria-label="Command palette settings"
          className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <IconSettings size={15} strokeWidth={1.6} aria-hidden />
        </button>
      )}
    </div>
  );
}

CommandPaletteFooter.displayName = "CommandPaletteFooter";
