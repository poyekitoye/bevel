import type React from "react";

export interface SpotlightResult {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: string;
  /** Image URL, or an icon component. */
  icon?: string | React.ElementType;
  badge?: string;
  /** Rendered as a real anchor so the row behaves like a link. */
  href?: string;
  /** Open href in a new tab. */
  external?: boolean;
  onSelect?: () => void;
}

export interface SpotlightCategory {
  id: string;
  label: string;
  icon?: React.ElementType;
}

export interface SpotlightConfig {
  categories: SpotlightCategory[];
  placeholder?: string;
  /** "/" (default) or "mod+k". */
  hotkey?: string;
  maxRecentSearches?: number;
  storageKey?: string;
  /** Copy for the pre-search state. */
  emptyHint?: string;
}

export interface SpotlightContextValue {
  isOpen: boolean;
  query: string;
  /** Everything the last search returned. */
  results: SpotlightResult[];
  /** Results after the active category filter — what the list renders. */
  visibleResults: SpotlightResult[];
  isLoading: boolean;
  activeCategory: string;
  recentSearches: string[];
  highlightedIndex: number;

  config: SpotlightConfig;

  open: () => void;
  close: () => void;
  setQuery: (q: string) => void;
  setCategory: (id: string) => void;
  setHighlightedIndex: (index: number) => void;
  moveUp: () => void;
  moveDown: () => void;
  selectHighlighted: () => void;
  selectResult: (result: SpotlightResult) => void;
  clearHistory: () => void;
  removeRecent: (q: string) => void;
}
