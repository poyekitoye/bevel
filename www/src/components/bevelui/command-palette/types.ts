import type React from "react";

export type CommandPaletteItem = {
  id: string;
  title: string;
  subtitle?: string;
  /** Text shown on the far right of the row (e.g. role, category label). */
  meta?: string;
  /** Avatar/icon image URL, or a React node for an icon. */
  icon?: string | React.ReactNode;
  /** Initials shown when no icon is provided. */
  initials?: string;
  /** Background for the initials avatar. Any CSS colour. */
  initialsColor?: string;
  /** Filter tab id this item belongs to. */
  category?: string;
  /** Source tab id this item belongs to. */
  source?: string;
  /** Rendered as a real link so middle-click and "open in new tab" work. */
  href?: string;
  /** Open href in a new tab. */
  external?: boolean;
  /** Keyboard shortcut hint shown on the row, e.g. ["⌘", "P"]. */
  shortcut?: string[];
  onSelect?: (item: CommandPaletteItem) => void;
  [x: string]: unknown;
};

export type CommandPaletteSection = {
  id: string;
  title: string;
  items: CommandPaletteItem[];
};

export type CommandPaletteSourceTab = {
  id: string;
  label: string;
  /** Image URL for an integration logo. */
  logoSrc?: string;
  icon?: React.ReactNode;
};

export type CommandPaletteFilterTab = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

export type CommandPaletteContextValue = {
  isOpen: boolean;
  query: string;
  activeSourceTab: string;
  activeFilterTab: string;
  highlightedIndex: number;
  filteredSections: CommandPaletteSection[];
  flatResults: CommandPaletteItem[];
  isLoading: boolean;

  open: () => void;
  close: () => void;
  setQuery: (q: string) => void;
  setHighlightedIndex: (index: number) => void;
  setSourceTab: (id: string) => void;
  setFilterTab: (id: string) => void;
  moveUp: () => void;
  moveDown: () => void;
  selectHighlighted: () => void;
  selectItem: (item: CommandPaletteItem) => void;
};
