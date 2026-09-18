"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  IconAlertCircle,
  IconCheck,
  IconFile,
  IconFileTypePdf,
  IconFileTypeXls,
  IconLoader2,
  IconPhoto,
  IconRefresh,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePrefersReducedMotion } from "../lib/use-element-rect";
import type { FileEntry, FileStatus } from "./types";

// ─── Pieces ───────────────────────────────────────────────────────────────────

function ProgressBar({
  progress,
  status,
}: Pick<FileEntry, "progress" | "status">) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div
      className="h-1 w-full overflow-hidden rounded-full bg-muted-foreground/10"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn(
          "h-full rounded-full",
          status === "done" && "bg-emerald-500 dark:bg-emerald-400",
          status === "error" && "bg-destructive",
          status !== "done" && status !== "error" && "bg-primary",
        )}
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
      />
    </div>
  );
}

function FileTypeIcon({ file, size = 22 }: { file: File; size?: number }) {
  const type = file.type;
  const name = file.name.toLowerCase();

  const Icon = type.startsWith("video/")
    ? IconVideo
    : type.startsWith("image/")
      ? IconPhoto
      : type === "application/pdf" || name.endsWith(".pdf")
        ? IconFileTypePdf
        : type.includes("spreadsheet") ||
            type.includes("excel") ||
            name.endsWith(".xlsx") ||
            name.endsWith(".csv")
          ? IconFileTypeXls
          : IconFile;

  return (
    <Icon size={size} strokeWidth={1.8} className="stroke-primary" aria-hidden />
  );
}

/**
 * Status glyph. Returns a span rather than a div — the original nested a div
 * inside a <p>, which is invalid HTML and produced a hydration mismatch in
 * Next.js on every uploading file.
 */
function StatusIndicator({ status }: { status: FileStatus }) {
  if (status === "done") {
    return (
      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
        <IconCheck
          size={11}
          strokeWidth={2.5}
          className="text-emerald-600 dark:text-emerald-400"
          aria-hidden
        />
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/15">
        <IconAlertCircle
          size={11}
          strokeWidth={2.5}
          className="text-destructive"
          aria-hidden
        />
      </span>
    );
  }
  if (status === "uploading") {
    return (
      <IconLoader2
        size={12}
        className="shrink-0 animate-spin text-primary"
        aria-hidden
      />
    );
  }
  return null;
}

/**
 * Thumbnail slot. The original swapped the file icon out for a retry button
 * when a file errored — and rendered an empty box when no onRetry was passed.
 * The icon now always shows; retry is a separate, labelled control.
 */
function FileThumb({
  file,
  status,
  className,
}: {
  file: File;
  status: FileStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10",
        status === "error" && "bg-destructive/10",
        className,
      )}
    >
      <FileTypeIcon file={file} size={22} />
    </span>
  );
}

function statusLabel(status: FileStatus, progress: number): string {
  switch (status) {
    case "uploading":
      // A percentage is something we actually know. The original derived a
      // "seconds left" figure from the percentage alone, which cannot be done.
      return `${progress}%`;
    case "done":
      return "Done";
    case "error":
      return "Failed";
    default:
      return "Queued";
  }
}

// ─── Item ─────────────────────────────────────────────────────────────────────

export interface FileUploadItemProps extends FileEntry {
  /** Render as a list row instead of a grid card. */
  isList?: boolean;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function FileUploadItem({
  id,
  file,
  status,
  progress,
  error,
  rejected,
  meta,
  isList = false,
  onRemove,
  onRetry,
  onCancel,
}: FileUploadItemProps) {
  const reduceMotion = usePrefersReducedMotion();

  const displayName = file.name;
  const canRetry = status === "error" && !rejected && !!onRetry;
  const canCancel = status === "uploading" && !!onCancel;
  const label = statusLabel(status, progress);

  const removeButton = (
    <button
      type="button"
      onClick={() => (canCancel ? onCancel?.(id) : onRemove?.(id))}
      aria-label={
        canCancel ? `Cancel upload of ${displayName}` : `Remove ${displayName}`
      }
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/20 text-muted-foreground transition-colors",
        "hover:border-border hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isList ? "size-8" : "size-6",
      )}
    >
      <IconX size={isList ? 14 : 12} strokeWidth={2.5} aria-hidden />
    </button>
  );

  const retryButton = canRetry && (
    <button
      type="button"
      onClick={() => onRetry?.(id)}
      aria-label={`Retry upload of ${displayName}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-bui-2xs font-medium text-destructive transition-colors",
        "hover:bg-destructive/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive",
      )}
    >
      <IconRefresh size={12} strokeWidth={2} aria-hidden />
      Retry
    </button>
  );

  const errorMessage = status === "error" && error && (
    <Tooltip>
      <TooltipTrigger asChild>
        <p className="truncate text-bui-xs text-destructive" title={error}>
          {error}
        </p>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-56">
        {error}
      </TooltipContent>
    </Tooltip>
  );

  const motionProps = {
    layout: !reduceMotion,
    initial: reduceMotion ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: reduceMotion ? undefined : { opacity: 0, y: -8 },
    transition: { duration: reduceMotion ? 0 : 0.2 },
  } as const;

  // ── List row ──
  if (isList) {
    return (
      <motion.li
        {...motionProps}
        className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-muted/20 px-4 py-3.5 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <FileThumb file={file} status={status} />

          <div className="min-w-0 flex-1">
            <p className="truncate text-bui-md font-semibold leading-tight text-foreground">
              {displayName}
            </p>
            <div className="mt-0.5 flex items-center justify-between gap-4 text-bui-sm text-muted-foreground">
              <span className="truncate">
                {meta?.ext}
                {meta?.size ? ` · ${meta.size}` : ""}
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                <StatusIndicator status={status} />
                {label}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {retryButton}
            {removeButton}
          </div>
        </div>

        {status !== "idle" && status !== "error" && (
          <ProgressBar progress={progress} status={status} />
        )}
        {errorMessage}
      </motion.li>
    );
  }

  // ── Grid card ──
  return (
    <motion.li
      {...motionProps}
      className="relative flex aspect-square flex-col justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3.5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-1.5 text-bui-sm text-muted-foreground">
          <StatusIndicator status={status} />
          {label}
        </span>
        {removeButton}
      </div>

      <div className="flex flex-1 items-center justify-center py-2">
        <FileThumb file={file} status={status} className="size-12" />
      </div>

      <div className="space-y-1.5">
        <p className="line-clamp-1 text-bui-sm font-medium text-foreground">
          {displayName}
        </p>
        <p className="text-bui-xs text-muted-foreground">
          {meta?.ext}
          {meta?.size ? ` · ${meta.size}` : ""}
        </p>

        {status !== "idle" && status !== "error" && (
          <ProgressBar progress={progress} status={status} />
        )}
        {status === "error" && (
          <div className="flex items-center justify-between gap-2">
            {errorMessage}
            {retryButton}
          </div>
        )}
      </div>
    </motion.li>
  );
}

FileUploadItem.displayName = "FileUploadItem";
