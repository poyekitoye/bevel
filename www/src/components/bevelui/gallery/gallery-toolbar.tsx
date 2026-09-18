import * as React from "react";
import { useGallery } from "./gallery-context";
import {
  IconPhoto,
  IconVideo,
  IconMusic,
  IconFileText,
  IconFile,
  IconCheckbox,
  IconX,
} from "@tabler/icons-react";
import type { MediaType } from "./types";
import { Button } from "@/components/ui/button";

const FILTERS: {
  label: string;
  value: MediaType | "all";
  icon: React.ElementType;
}[] = [
  { label: "All", value: "all", icon: IconFile },
  { label: "Images", value: "image", icon: IconPhoto },
  { label: "Video", value: "video", icon: IconVideo },
  { label: "Audio", value: "audio", icon: IconMusic },
  { label: "Docs", value: "document", icon: IconFileText },
];

type ToolbarButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

function ToolbarButton({
  variant = "ghost",
  size = "sm",
  children,
  ...props
}: ToolbarButtonProps) {
  return (
    <Button variant={variant} size={size} {...props}>
      {children}
    </Button>
  );
}

export function GalleryToolbar() {
  const {
    filter,
    setFilter,
    selectedIds,
    items,
    selectAll,
    clearSelection,
    config,
  } = useGallery();
  const hasSelection = selectedIds.size > 0;
  const mode = config.selectionMode ?? "single";

  return (
    <div className="flex items-center flex-wrap justify-between gap-3">
      <div className="flex items-center overflow-x-auto gap-1 p-1 rounded-lg border border-border bg-card/80 w-fit">
        {FILTERS.map(({ label, value, icon: Icon }) => (
          <ToolbarButton
            key={value}
            onClick={() => setFilter(value)}
            variant={filter === value ? "default" : "ghost"}
          >
            <Icon size={12} strokeWidth={2} />
            {label}
          </ToolbarButton>
        ))}
      </div>

      {mode === "multi" && (
        <div className="flex items-center gap-2">
          {hasSelection && (
            <span className="text-bui-xs text-muted-foreground">
              {selectedIds.size} selected
            </span>
          )}
          <ToolbarButton
            onClick={hasSelection ? clearSelection : selectAll}
            variant="outline"
          >
            {hasSelection ? (
              <>
                <IconX size={12} /> Clear
              </>
            ) : (
              <>
                <IconCheckbox size={12} /> Select all
              </>
            )}
          </ToolbarButton>
        </div>
      )}

      <span className="text-bui-xs text-muted-foreground ml-auto">
        {items.length} item{items.length !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

GalleryToolbar.displayName = "GalleryToolbar";
