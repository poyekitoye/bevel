"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  IconChevronRight,
  IconFile,
  IconFolder,
  IconFolderOpen,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useTree } from "./tree-context";
import { usePrefersReducedMotion } from "../lib/use-element-rect";
import type { TreeNode } from "./types";

const INDENT = 16;
const GUIDE_OFFSET = 8;

export interface TreeNodeProps {
  node: TreeNode;
  depth: number;
  /** One flag per ancestor level: does that ancestor have siblings below it? */
  ancestorLines?: boolean[];
  isLast?: boolean;
  level?: number;
  setSize?: number;
  posInSet?: number;
}

export function TreeNode({
  node,
  depth,
  ancestorLines = [],
  isLast = false,
  level = 1,
  setSize = 1,
  posInSet = 1,
}: TreeNodeProps) {
  const { expanded, selected, focused, toggleExpand, select, focus, config } =
    useTree();
  const reduceMotion = usePrefersReducedMotion();

  const isExpanded = expanded.has(node.id);
  const isSelected = selected.has(node.id);
  const isFocused = focused === node.id;
  const hasChildren = !!node.children?.length;

  // Folders had no icon at all — only a chevron — while files got a generic
  // document glyph. A tree that looks like a tree needs both.
  const Icon =
    node.icon ??
    (hasChildren ? (isExpanded ? IconFolderOpen : IconFolder) : IconFile);

  function handleSelect(e: React.MouseEvent) {
    if (node.disabled) return;
    focus(node.id);
    select(node.id, e.metaKey || e.ctrlKey || e.shiftKey);
    // Selecting no longer forces an expand. The original toggled the folder on
    // every row click, so a folder could not be selected without opening it.
  }

  function handleChevron(e: React.MouseEvent) {
    e.stopPropagation();
    if (node.disabled) return;
    toggleExpand(node.id);
  }

  return (
    <li role="none" className="relative">
      <div
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-disabled={node.disabled || undefined}
        aria-level={level}
        aria-setsize={setSize}
        aria-posinset={posInSet}
        onClick={handleSelect}
        onDoubleClick={() => hasChildren && !node.disabled && toggleExpand(node.id)}
        style={{ paddingLeft: depth * INDENT }}
        className={cn(
          "group relative flex cursor-pointer items-center gap-1.5 rounded-sm py-[3px] pr-3 transition-colors",
          isSelected && "bg-primary/10",
          isFocused && !isSelected && "bg-muted/50",
          !isSelected && !isFocused && "hover:bg-muted/40",
          node.disabled && "cursor-not-allowed opacity-40",
        )}
      >
        {/* One guide per ancestor level. The original drew a single rule at
            (depth - 1) * INDENT, so anything nested past two levels showed a
            lone stray line instead of a connected structure. */}
        {config.showLines &&
          ancestorLines.map((continues, i) =>
            continues ? (
              <span
                key={i}
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-px bg-border/40"
                style={{ left: i * INDENT + GUIDE_OFFSET }}
              />
            ) : null,
          )}

        {/* The elbow joining this row to its parent's guide — what `isLast`
            was being passed around for, without ever being used. */}
        {config.showLines && depth > 0 && (
          <>
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute w-px bg-border/40",
                isLast ? "top-0 h-1/2" : "inset-y-0",
              )}
              style={{ left: (depth - 1) * INDENT + GUIDE_OFFSET }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 h-px bg-border/40"
              style={{
                left: (depth - 1) * INDENT + GUIDE_OFFSET,
                width: INDENT - GUIDE_OFFSET,
              }}
            />
          </>
        )}

        <span className="flex size-4 shrink-0 items-center justify-center">
          {hasChildren && (
            <button
              type="button"
              tabIndex={-1}
              onClick={handleChevron}
              aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.label}`}
              className="flex size-4 items-center justify-center rounded-sm hover:bg-muted"
            >
              <IconChevronRight
                size={12}
                strokeWidth={2}
                aria-hidden
                className={cn(
                  "text-muted-foreground/60 transition-transform",
                  isExpanded && "rotate-90",
                )}
              />
            </button>
          )}
        </span>

        <Icon
          size={14}
          strokeWidth={1.8}
          aria-hidden
          className={cn(
            "shrink-0 transition-colors",
            isSelected ? "text-primary" : "text-muted-foreground/60",
          )}
        />

        <span
          className={cn(
            "flex-1 truncate text-bui-base transition-colors",
            isSelected
              ? "font-medium text-primary"
              : isFocused
                ? "text-foreground"
                : "text-foreground/80",
          )}
          title={node.label}
        >
          {node.label}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.ul
            role="group"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.15, ease: "easeInOut" }}
            // overflow-hidden was missing, so children spilled visibly out of
            // the collapsing container on every close.
            className="list-none overflow-hidden"
          >
            {node.children!.map((child, i) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                ancestorLines={[...ancestorLines, !isLast]}
                isLast={i === node.children!.length - 1}
                level={level + 1}
                setSize={node.children!.length}
                posInSet={i + 1}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

TreeNode.displayName = "TreeNode";
