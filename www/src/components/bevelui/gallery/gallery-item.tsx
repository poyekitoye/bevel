"use client";

import * as React from "react";
import {
  IconCheck,
  IconEye,
  IconFile,
  IconFileText,
  IconMusic,
  IconPhoto,
  IconVideo,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useGallery } from "./gallery-context";
import type { GalleryItem, MediaType } from "./types";

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// `image` mapped to IconFile in the original, so an image with no thumbnail
// showed a generic document glyph.
const TYPE_ICONS: Record<MediaType, React.ElementType> = {
  image: IconPhoto,
  video: IconVideo,
  audio: IconMusic,
  document: IconFileText,
  other: IconFile,
};

export interface GalleryItemProps {
  item: GalleryItem;
  className?: string;
}

export function GalleryItemCard({ item, className }: GalleryItemProps) {
  const { selectedIds, config, select, openLightbox } = useGallery();

  const isSelected = selectedIds.has(item.id);
  const mode = config.selectionMode ?? "single";
  const aspect = config.aspectRatio ?? 1;
  const selectable = mode !== "none";
  const previewable = item.type === "image" || item.type === "video";

  const thumb = item.thumbnail ?? (item.type === "image" ? item.url : null);
  const Icon = TYPE_ICONS[item.type];

  function handleActivate(e: React.MouseEvent | React.KeyboardEvent) {
    if (selectable) {
      const additive =
        "metaKey" in e ? e.metaKey || e.ctrlKey || e.shiftKey : false;
      select(item.id, additive);
    } else if (previewable) {
      openLightbox(item.id);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate(e);
    }
    // A keyboard path to the lightbox, which previously existed only as a
    // double-click and a hover-revealed button.
    if (previewable && (e.key === "o" || e.key === "O")) {
      e.preventDefault();
      openLightbox(item.id);
    }
  }

  return (
    <div
      role={selectable ? "option" : "button"}
      aria-selected={selectable ? isSelected : undefined}
      aria-label={item.name}
      tabIndex={0}
      onClick={handleActivate}
      onDoubleClick={() => previewable && openLightbox(item.id)}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border-2 bg-muted/30 transition-all",
        "hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary shadow-[0_0_0_1px] shadow-primary"
          : "border-transparent hover:border-border",
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {thumb ? (
        <img
          src={thumb}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <Icon
            size={28}
            strokeWidth={1.5}
            className="text-muted-foreground/40"
            aria-hidden
          />
        </div>
      )}

      <div
        className={cn(
          "absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30",
          isSelected && "bg-primary/10",
        )}
        aria-hidden
      />

      {selectable && (
        <span
          aria-hidden
          className={cn(
            "absolute left-1.5 top-1.5 flex size-[18px] items-center justify-center rounded-full border-2 transition-all",
            isSelected
              ? "scale-100 border-primary bg-primary"
              : cn(
                  "border-white/60 bg-black/20",
                  // Visible on touch and on keyboard focus, not hover only.
                  "scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100",
                  "group-focus-visible:scale-100 group-focus-visible:opacity-100",
                  "[@media(hover:none)]:scale-100 [@media(hover:none)]:opacity-100",
                ),
          )}
        >
          {isSelected && (
            <IconCheck
              size={10}
              strokeWidth={3}
              className="text-primary-foreground"
            />
          )}
        </span>
      )}

      {previewable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openLightbox(item.id);
          }}
          aria-label={`Preview ${item.name}`}
          className={cn(
            "absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70",
            "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            // Without this the lightbox is unreachable on a touch device.
            "[@media(hover:none)]:opacity-100",
          )}
        >
          <IconEye size={13} aria-hidden />
        </button>
      )}

      {item.duration ? (
        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 font-mono text-bui-2xs text-white">
          {formatDuration(item.duration)}
        </span>
      ) : null}

      {config.showNames && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-4">
          <p className="truncate text-bui-2xs text-white">{item.name}</p>
          {item.size ? (
            <p className="text-bui-2xs text-white/70">{formatSize(item.size)}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

GalleryItemCard.displayName = "GalleryItemCard";
