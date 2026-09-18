"use client";

import * as React from "react";
import {
  CommandPaletteProvider,
  type CommandPaletteProviderProps,
} from "./command-palette-context";
import { CommandPalette, type CommandPaletteProps } from "./command-palette";

export interface CommandPaletteRootProps
  extends Omit<CommandPaletteProviderProps, "children">,
    Omit<CommandPaletteProps, "asDialog"> {
  children?: React.ReactNode;
  asDialog?: boolean;
}

/**
 * CommandPaletteRoot — provider plus palette in one import.
 *
 * @example
 * // Keep `sections` referentially stable (useMemo or module scope) if it is
 * // derived at render time.
 * <CommandPaletteRoot
 *   sections={sections}
 *   sourceTabs={sourceTabs}
 *   onSelect={(item) => router.push(item.href!)}
 * >
 *   <App />
 * </CommandPaletteRoot>
 */
export function CommandPaletteRoot({
  children,
  sections,
  defaultOpen,
  shortcut,
  loading,
  onQueryChange,
  onSelect,
  onOpenChange,
  onClose,
  asDialog = true,
  ...paletteProps
}: CommandPaletteRootProps) {
  return (
    <CommandPaletteProvider
      sections={sections}
      defaultOpen={defaultOpen}
      shortcut={shortcut}
      loading={loading}
      onQueryChange={onQueryChange}
      onSelect={onSelect}
      onOpenChange={onOpenChange}
      onClose={onClose}
    >
      {children}
      <CommandPalette asDialog={asDialog} {...paletteProps} />
    </CommandPaletteProvider>
  );
}

CommandPaletteRoot.displayName = "CommandPaletteRoot";
