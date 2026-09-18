import type { TreeNode } from "./types";

/** Every node id in the tree, depth-first. */
export function getAllIds(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => [
    n.id,
    ...(n.children ? getAllIds(n.children) : []),
  ]);
}

/** Flat list of currently visible node ids, respecting collapsed state. */
export function getVisibleIds(
  nodes: TreeNode[],
  expanded: Set<string>,
): string[] {
  const result: string[] = [];
  function walk(ns: TreeNode[]) {
    for (const n of ns) {
      result.push(n.id);
      if (n.children?.length && expanded.has(n.id)) walk(n.children);
    }
  }
  walk(nodes);
  return result;
}

export function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Ancestor ids from the root down to (not including) the target. */
export function getAncestorIds(
  nodes: TreeNode[],
  targetId: string,
  path: string[] = [],
): string[] | null {
  for (const n of nodes) {
    if (n.id === targetId) return path;
    if (n.children) {
      const found = getAncestorIds(n.children, targetId, [...path, n.id]);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Parent id, or null for a root-level node.
 *
 * Derived from getAncestorIds so "top-level node" and "node not found" are no
 * longer indistinguishable — the original returned null for both, and its
 * `found !== null` recursion could not represent a root-level parent anyway.
 */
export function getParentId(nodes: TreeNode[], id: string): string | null {
  const ancestors = getAncestorIds(nodes, id);
  if (!ancestors || ancestors.length === 0) return null;
  return ancestors[ancestors.length - 1];
}

export function getFirstChildId(nodes: TreeNode[], id: string): string | null {
  return findNode(nodes, id)?.children?.[0]?.id ?? null;
}
