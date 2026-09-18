import * as React from "react";
import { cn } from "@/lib/utils";
import { IconFolder, IconFile } from "@tabler/icons-react";
import type { DocBlockFileTree, FileTreeNode } from "@/content/docs/doc-schema";

function TreeNode({ node, depth }: { node: FileTreeNode; depth: number }) {
  const isFolder = node.type === "folder";

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-[4px] px-1.5 py-[3px]",
          node.highlight && "bg-primary/8",
        )}
        style={{ paddingLeft: depth * 16 + 6 }}
      >
        {isFolder ? (
          <IconFolder size={13} strokeWidth={1.9} className="shrink-0 text-muted-foreground/70" />
        ) : (
          <IconFile size={13} strokeWidth={1.9} className="shrink-0 text-muted-foreground/50" />
        )}
        <span
          className={cn(
            "truncate font-mono text-bui-sm",
            node.highlight ? "font-medium text-foreground" : "text-foreground/85",
          )}
        >
          {node.name}
        </span>
        {node.comment && (
          <span className="ml-2 truncate font-mono text-bui-xs text-muted-foreground/60">
            // {node.comment}
          </span>
        )}
      </div>
      {node.children?.map((child, i) => (
        <TreeNode key={child.name + i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function FileTree({ nodes, className }: DocBlockFileTree & { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-md border border-border/70 bg-muted/20 py-2",
        className,
      )}
    >
      <div className="min-w-fit">
        {nodes.map((node, i) => (
          <TreeNode key={node.name + i} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
}
