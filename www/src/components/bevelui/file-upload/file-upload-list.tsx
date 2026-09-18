"use client";

import * as React from "react";
import { AnimatePresence } from "motion/react";
import {
  IconClearAll,
  IconLayoutGrid,
  IconList,
  IconUpload,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "./file-upload-context";
import { FileUploadItem } from "./file-upload-item";

type View = "grid" | "list";

export function FileUploadList({ className }: { className?: string }) {
  const {
    config,
    files,
    removeFile,
    uploadAll,
    removeAll,
    cancelFile,
    retryFile,
    isUploading,
  } = useFileUpload();

  const [view, setView] = React.useState<View>("grid");

  if (files.length === 0) return null;

  const pendingCount = files.filter((f) => f.status === "idle").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const isList = view === "list";

  return (
    <section
      // The original had `not-visited:flex flex-col`, so the section was never
      // actually a flex container and the gap never applied.
      className={cn("@container/upload-list flex flex-col gap-3", className)}
      aria-label="Selected files"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-bui-sm text-muted-foreground" aria-live="polite">
          {files.length} file{files.length !== 1 ? "s" : ""}
          {doneCount > 0 && ` · ${doneCount} uploaded`}
          {errorCount > 0 && ` · ${errorCount} failed`}
        </p>

        <div className="flex items-center gap-1.5">
          <Button onClick={removeAll} variant="ghost" size="sm">
            <IconClearAll size={14} aria-hidden />
            Clear all
          </Button>

          <div
            role="group"
            aria-label="Layout"
            className="flex items-center overflow-hidden rounded-sm border border-border/60"
          >
            {(
              [
                { id: "grid", icon: IconLayoutGrid, label: "Grid view" },
                { id: "list", icon: IconList, label: "List view" },
              ] as const
            ).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-pressed={view === id}
                aria-label={label}
                className={cn(
                  "flex size-7 items-center justify-center transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                  view === id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon size={14} strokeWidth={1.8} aria-hidden />
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul
        className={cn(
          "list-none",
          isList
            ? "flex flex-col gap-2"
            : "grid grid-cols-2 gap-2 @md/upload-list:grid-cols-3 @lg/upload-list:grid-cols-4 @2xl/upload-list:grid-cols-5 @4xl/upload-list:grid-cols-6",
        )}
      >
        <AnimatePresence initial={false}>
          {files.map((file) => (
            <FileUploadItem
              key={file.id}
              {...file}
              isList={isList}
              onRemove={removeFile}
              onCancel={cancelFile}
              onRetry={retryFile}
            />
          ))}
        </AnimatePresence>
      </ul>

      {pendingCount > 0 && !config.auto && (
        <div className="flex justify-end">
          <Button onClick={() => void uploadAll()} disabled={isUploading}>
            <IconUpload size={14} strokeWidth={2} aria-hidden />
            {isUploading
              ? "Uploading…"
              : `Upload ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </section>
  );
}

FileUploadList.displayName = "FileUploadList";
