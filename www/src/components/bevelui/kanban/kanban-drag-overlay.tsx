import { DragOverlay, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import { useKanban } from "./kanban-context";
import { cn } from "@/lib/utils";

const DROP_ANIMATION = {
  duration: 180,
  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
};

export function KanbanDragOverlay() {
  const {
    activeId,
    activeType,
    activeCard,
    activeCardColumn,
    activeColumnData,
    renderCard,
    renderColumnHeader,
  } = useKanban();

  return (
    <DragOverlay dropAnimation={DROP_ANIMATION}>
      {activeType === "card" && activeCard && activeCardColumn && (
        <div className="rotate-[1.5deg] scale-[1.02] shadow-2xl">
          {renderCard(activeCard, activeCardColumn, {
            isDragging: false,
            isOverlay: true,
          })}
        </div>
      )}

      {activeType === "column" && activeColumnData && (
        <div
          className={cn(
            "rotate-[1deg] scale-[1.01] shadow-2xl opacity-95",
            "border border-border bg-card/90 rounded-xl",
          )}
          style={{ width: 280 }}
        >
          {renderColumnHeader ? (
            renderColumnHeader(activeColumnData, {
              cardCount: activeColumnData.cards.length,
              isOver: false,
            })
          ) : (
            <div className="flex items-center justify-between px-3 py-3">
              <span className="text-sm font-semibold">
                {activeColumnData.title}
              </span>
              <span className="text-bui-2xs font-mono text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded-full">
                {activeColumnData.cards.length}
              </span>
            </div>
          )}
        </div>
      )}
    </DragOverlay>
  );
}

KanbanDragOverlay.displayName = "KanbanDragOverlay";
