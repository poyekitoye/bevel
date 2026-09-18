"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useGallery } from "./gallery-context";
import {
  useDismissableLayer,
  useMounted,
} from "../lib/use-dismissable-layer";

const controlClass = cn(
  "flex items-center justify-center rounded-lg bg-white/10 text-white transition-colors",
  "hover:bg-white/20",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
);

export function GalleryLightbox() {
  const { items, lightboxId, closeLightbox, nextLightbox, prevLightbox } =
    useGallery();

  const mounted = useMounted();
  const isOpen = !!lightboxId;
  const index = items.findIndex((i) => i.id === lightboxId);
  const item = index >= 0 ? items[index] : undefined;

  const layerRef = useDismissableLayer<HTMLDivElement>({
    open: isOpen,
    onDismiss: closeLightbox,
  });

  React.useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, nextLightbox, prevLightbox]);

  if (!mounted || !isOpen || !item) return null;

  return createPortal(
    <div
      ref={layerRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      style={{ zIndex: "var(--z-bui-modal)" }}
      onClick={closeLightbox}
    >
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        {/* `download` is ignored cross-origin, so the link opens the asset
            rather than silently doing nothing. */}
        <a
          href={item.url}
          download={item.name}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Download ${item.name}`}
          className={cn(controlClass, "size-9")}
        >
          <IconDownload size={15} aria-hidden />
        </a>
        <button
          type="button"
          onClick={closeLightbox}
          aria-label="Close preview"
          className={cn(controlClass, "size-9")}
        >
          <IconX size={15} aria-hidden />
        </button>
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevLightbox();
            }}
            aria-label="Previous item"
            className={cn(
              controlClass,
              "absolute left-2 top-1/2 size-11 -translate-y-1/2 rounded-full sm:left-4",
            )}
          >
            <IconChevronLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextLightbox();
            }}
            aria-label="Next item"
            className={cn(
              controlClass,
              "absolute right-2 top-1/2 size-11 -translate-y-1/2 rounded-full sm:right-4",
            )}
          >
            <IconChevronRight size={20} aria-hidden />
          </button>
        </>
      )}

      <div
        className="relative flex max-h-[85svh] max-w-[92vw] flex-col items-center justify-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "image" && (
          <img
            src={item.url}
            alt={item.name}
            className="max-h-[75svh] max-w-full rounded-lg object-contain shadow-2xl"
          />
        )}
        {item.type === "video" && (
          // muted, because a browser blocks autoplay with sound and the video
          // would simply never start.
          <video
            src={item.url}
            controls
            autoPlay
            muted
            playsInline
            className="max-h-[75svh] max-w-full rounded-lg shadow-2xl"
          />
        )}

        {/* Inside the flow rather than absolutely positioned below it, where
            it could fall outside the viewport on a short screen. */}
        <p className="max-w-full truncate px-4 text-center text-bui-xs text-white/70">
          {item.name}
          {items.length > 1 && (
            <span className="ml-2 text-white/40">
              {index + 1} / {items.length}
            </span>
          )}
        </p>
      </div>
    </div>,
    document.body,
  );
}

GalleryLightbox.displayName = "GalleryLightbox";
