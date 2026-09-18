"use client";

import * as React from "react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useKanban } from "./kanban-context";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";
import type { KanbanCardBase, KanbanColumnBase } from "./types";

export interface KanbanColumnProps<
  TCard extends KanbanCardBase,
  TColumn extends KanbanColumnBase<TCard>,
> {
  column: TColumn;
  /** Override the default column width */
  width?: number;
  className?: string;
}

export function KanbanColumn<
  TCard extends KanbanCardBase,
  TColumn extends KanbanColumnBase<TCard>,
>({ column, width = 280, className }: KanbanColumnProps<TCard, TColumn>) {
  const {
    activeId,
    renderColumnHeader,
    renderColumnFooter,
    renderEmptyColumn,
    renderCard,
  } = useKanban<TCard, TColumn>();

  const cardIds = column.cards.map((c) => c.id);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", column } satisfies {
      type: "column";
      column: TColumn;
    },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  // Merge refs — sortable needs ref for position tracking,
  // droppable needs ref for intersection detection
  function mergeRef(el: HTMLDivElement | null) {
    setSortableRef(el);
    setDroppableRef(el);
  }

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    width,
    flexShrink: 0,
  };

  const meta = { cardCount: column.cards.length, isOver };

  return (
    <div
      ref={mergeRef}
      style={style}
      data-column-id={column.id}
      {...attributes}
      className={cn(
        "flex flex-col rounded-xl border border-border bg-background/60",
        "transition-opacity duration-200",
        isColumnDragging && "opacity-40 shadow-2xl",
        isOver && !isColumnDragging && "border-primary/40 bg-primary/5",
        className,
      )}
    >
      {/* ── Column header — drag handle for column reordering ──────────── */}
      <div
        className="flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
        {...listeners}
      >
        {renderColumnHeader ? (
          renderColumnHeader(column, meta)
        ) : (
          <DefaultColumnHeader
            column={column}
            cardCount={column.cards.length}
          />
        )}
      </div>

      {/* ── Card list ──────────────────────────────────────────────────── */}
      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1 px-3 pb-3 pt-1 min-h-[80px]">
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              column={column}
              renderCard={renderCard}
            />
          ))}

          {/* Empty state — always rendered but visually minimal when non-empty */}
          {column.cards.length === 0 &&
            (renderEmptyColumn ? (
              renderEmptyColumn(column)
            ) : (
              <EmptyDropZone isOver={isOver} />
            ))}
        </div>
      </SortableContext>

      {/* ── Column footer ───────────────────────────────────────────────── */}
      {renderColumnFooter && (
        <div className="flex-shrink-0 px-3 pb-3">
          {renderColumnFooter(column, meta)}
        </div>
      )}
    </div>
  );
}

KanbanColumn.displayName = "KanbanColumn";

function DefaultColumnHeader({
  column,
  cardCount,
}: {
  column: KanbanColumnBase;
  cardCount: number;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-3">
      <span className="text-sm font-semibold text-foreground">
        {column.title}
      </span>
      <span className="text-bui-2xs font-mono text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded-full">
        {cardCount}
      </span>
    </div>
  );
}

function EmptyDropZone({ isOver }: { isOver: boolean }) {
  return (
    <div
      className={cn(
        "flex-1 min-h-[80px] rounded-lg border border-dashed transition-colors",
        isOver
          ? "border-primary/50 bg-primary/5"
          : "border-border/40 bg-transparent",
      )}
    />
  );
}
