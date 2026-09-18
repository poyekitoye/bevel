import * as React from "react";

export interface TreeNode<T = unknown> {
  id: string;
  label: string;
  icon?: React.ElementType;
  children?: TreeNode<T>[];
  data?: T;
  disabled?: boolean;
  defaultExpanded?: boolean;
}

export interface TreeConfig {
  multiSelect?: boolean;
  showLines?: boolean;
  defaultExpandAll?: boolean;
  defaultExpanded?: string[];
  defaultSelected?: string[];
  /** Accessible name for the tree. */
  label?: string;
}

export interface TreeContextValue<T = unknown> {
  nodes: TreeNode<T>[];
  expanded: Set<string>;
  selected: Set<string>;
  focused: string | null;
  config: TreeConfig;
  expand: (id: string) => void;
  collapse: (id: string) => void;
  toggleExpand: (id: string) => void;
  select: (id: string, additive?: boolean) => void;
  focus: (id: string | null) => void;
  expandAll: () => void;
  collapseAll: () => void;
  expandTo: (id: string) => void;
}
