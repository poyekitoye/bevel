"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useCommandPalette } from "./command-palette-context";
import { CommandPaletteSearchbar } from "./command-palette-searchbar";
import {
  CommandPaletteSourceTabs,
  CommandPaletteFilterTabs,
} from "./command-palette-tabs";
import { CommandPaletteResults } from "./command-palette-results";
import { CommandPaletteFooter } from "./command-palette-footer";
import {
  useDismissableLayer,
  useMounted,
} from "../lib/use-dismissable-layer";
import { usePrefersReducedMotion } from "../lib/use-element-rect";
import type { CommandPaletteSourceTab, CommandPaletteFilterTab } from "./types";

export interface CommandPaletteShellProps {
  sourceTabs?: CommandPaletteSourceTab[];
  filterTabs?: CommandPaletteFilterTab[];
  className?: string;
  placeholder?: string;
  emptyMessage?: string;
  onSettings?: () => void;
  onAddSource?: () => void;
  onAskAI?: (query: string) => void;
}

function CommandPaletteShell({
  sourceTabs,
  filterTabs,
  className,
  placeholder,
  emptyMessage,
  onSettings,
  onAddSource,
  onAskAI,
}: CommandPaletteShellProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-xl border border-border bg-popover shadow-2xl",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <CommandPaletteSearchbar placeholder={placeholder} onAskAI={onAskAI} />

      {sourceTabs && sourceTabs.length > 0 && (
        <CommandPaletteSourceTabs tabs={sourceTabs} onAddSource={onAddSource} />
      )}

      {filterTabs && filterTabs.length > 0 && (
        <CommandPaletteFilterTabs tabs={filterTabs} />
      )}

      <CommandPaletteResults emptyMessage={emptyMessage} />

      <CommandPaletteFooter onSettings={onSettings} />
    </div>
  );
}

function CommandPaletteDialog(props: CommandPaletteShellProps) {
  const { isOpen, close } = useCommandPalette();
  const mounted = useMounted();
  const reduceMotion = usePrefersReducedMotion();

  // Escape, focus trap, focus restore and scroll lock — none of which the
  // original had. It was a bare `fixed` div with a click-to-close backdrop.
  const layerRef = useDismissableLayer<HTMLDivElement>({
    open: isOpen,
    onDismiss: close,
    // The searchbar owns Escape so it can clear the query first.
    closeOnEscape: false,
  });

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="palette-backdrop"
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            style={{ zIndex: "var(--z-bui-overlay)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
            onClick={close}
          />

          <motion.div
            key="palette-card"
            ref={layerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className={cn(
              "fixed inset-0 flex justify-center px-4",
              // Sits nearer the top on desktop, but stays clear of the phone
              // keyboard by using small-viewport units.
              "items-end pb-4 pt-[10svh] sm:items-start sm:pb-0 sm:pt-[12vh]",
            )}
            style={{ zIndex: "var(--z-bui-modal)" }}
            initial={
              reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.97, y: -8 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.97, y: -8 }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.18,
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={close}
          >
            <div className="w-full max-w-[36rem]">
              <CommandPaletteShell {...props} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export interface CommandPaletteProps extends CommandPaletteShellProps {
  /**
   * true  → floating dialog (default)
   * false → rendered inline
   */
  asDialog?: boolean;
}

export function CommandPalette({
  asDialog = true,
  ...props
}: CommandPaletteProps) {
  if (!asDialog) return <CommandPaletteShell {...props} />;
  return <CommandPaletteDialog {...props} />;
}

CommandPalette.displayName = "CommandPalette";
