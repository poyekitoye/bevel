"use client";

import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  FileUploadProvider,
  type FileUploadProviderProps,
} from "./file-upload-context";
import { FileUploadDropzone } from "./file-upload-dropzone";
import { FileUploadList } from "./file-upload-list";

export interface FileUploadRootProps extends FileUploadProviderProps {
  /** Replace the default dropzone + list layout. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * FileUploadRoot — composes the full system behind one import.
 *
 * @example
 * <FileUploadRoot
 *   config={{ maxSize: 5 * 1024 * 1024, accept: { "image/*": [] } }}
 *   onUpload={async (file, onProgress, signal) => {
 *     const url = await uploadToS3(file, onProgress, signal);
 *     return { url };
 *   }}
 *   onComplete={(files) => console.log(files.map((f) => f.url))}
 * />
 */
export function FileUploadRoot({
  children,
  className,
  ...providerProps
}: FileUploadRootProps) {
  return (
    <FileUploadProvider {...providerProps}>
      <TooltipProvider delayDuration={300}>
        <div className={`flex w-full flex-col gap-4 ${className ?? ""}`}>
          {children ?? (
            <>
              <FileUploadDropzone />
              <FileUploadList />
            </>
          )}
        </div>
      </TooltipProvider>
    </FileUploadProvider>
  );
}

FileUploadRoot.displayName = "FileUploadRoot";
