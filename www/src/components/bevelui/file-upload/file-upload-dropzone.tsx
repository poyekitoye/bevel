"use client";

import * as React from "react";
import Dropzone, { type Accept, type DropzoneState } from "react-dropzone";
import { IconUpload } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "./file-upload-context";
import { formatBytes } from "./file-upload-utils";

interface FileUploadDropzoneProps {
  className?: string;
  /**
   * Custom render function receiving the full dropzone state
   * (getRootProps, getInputProps, isDragActive…).
   */
  children?: React.ReactNode | ((state: DropzoneState) => React.ReactNode);
}

/** Human-readable summary of what this dropzone will accept. */
function constraintSummary(
  accept: Accept | undefined,
  maxSize: number | undefined,
  remaining: number | undefined,
): string | null {
  const parts: string[] = [];

  if (accept) {
    const exts = Object.values(accept).flat().filter(Boolean);
    const types = exts.length
      ? exts.map((e) => e.replace(".", "").toUpperCase()).join(", ")
      : Object.keys(accept)
          .map((t) => t.replace("/*", "").toUpperCase())
          .join(", ");
    if (types) parts.push(types);
  }
  if (maxSize) parts.push(`up to ${formatBytes(maxSize)}`);
  if (remaining !== undefined) parts.push(`${remaining} remaining`);

  return parts.length ? parts.join(" · ") : null;
}

export function FileUploadDropzone({
  className,
  children,
}: FileUploadDropzoneProps) {
  const { isDragging, setIsDragging, addFiles, config, files, onAddRejected } =
    useFileUpload();

  const {
    accept,
    multiple,
    maxFiles,
    maxSize,
    title = "Drop your files here",
    description,
    icon,
  } = config;

  const remaining = maxFiles ? Math.max(0, maxFiles - files.length) : undefined;
  const isFull = remaining === 0;

  // Stating the limits up front is the difference between a silent rejection
  // and an understandable one.
  const constraints = constraintSummary(accept, maxSize, remaining);

  return (
    <Dropzone
      accept={accept}
      multiple={multiple}
      maxFiles={remaining}
      maxSize={maxSize}
      disabled={isFull}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDropAccepted={(accepted) => {
        setIsDragging(false);
        addFiles(accepted);
      }}
      onDropRejected={(rejections) => {
        setIsDragging(false);
        onAddRejected(rejections);
      }}
    >
      {(state) => {
        if (typeof children === "function") {
          return children(state) as React.ReactElement;
        }
        if (children) return children as React.ReactElement;

        const { getRootProps, getInputProps } = state;

        return (
          <div
            {...getRootProps()}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center select-none",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isFull
                ? "cursor-not-allowed border-border/60 bg-muted/10 opacity-60"
                : "cursor-pointer bg-muted/20 hover:bg-muted/30",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border/60 hover:border-border",
              className,
            )}
          >
            <input {...getInputProps()} />

            <span
              className={cn(
                "flex size-16 items-center justify-center rounded-full",
                // The original used bg-primary/3 and border-primary/5 — below
                // the threshold where anything is visible at all.
                "border border-primary/20 bg-primary/10",
              )}
            >
              {icon ?? (
                <IconUpload size={28} className="stroke-primary" aria-hidden />
              )}
            </span>

            <div className="flex flex-col items-center gap-1">
              <p className="text-bui-md font-medium text-foreground">
                {isFull ? "File limit reached" : title}
              </p>
              <p className="max-w-xs text-bui-sm leading-relaxed text-muted-foreground">
                {isFull
                  ? "Remove a file to add another."
                  : (description ??
                    "Drag and drop files here, or click to browse.")}
              </p>
              {constraints && !isFull && (
                <p className="mt-0.5 text-bui-xs text-muted-foreground/70">
                  {constraints}
                </p>
              )}
            </div>
          </div>
        );
      }}
    </Dropzone>
  );
}

FileUploadDropzone.displayName = "FileUploadDropzone";
