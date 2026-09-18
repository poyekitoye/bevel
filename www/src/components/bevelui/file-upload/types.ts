import type React from "react";
import type { Accept, FileRejection } from "react-dropzone";

type FileEntryMeta = {
  ext?: string;
  size?: string;
  [key: string]: unknown;
};

export type FileStatus = "idle" | "uploading" | "done" | "error";

export type FileEntry = {
  id: string;
  /** The native browser File object. */
  file: File;
  status: FileStatus;
  /** 0–100 */
  progress: number;
  /** Error message when status === "error". */
  error?: string;
  /**
   * True when the file never entered the queue — rejected by accept, maxSize
   * or maxFiles. Rendered as an error row that cannot be retried.
   */
  rejected?: boolean;
  /** Resolved URL when status === "done". */
  url?: string;
  meta?: FileEntryMeta;
};

export type FileUploadConfig = {
  /** Accepted MIME types, e.g. { "image/*": [] }. */
  accept?: Accept;
  /** Max file size in bytes. */
  maxSize?: number;
  /** Max number of files. */
  maxFiles?: number;
  /** Allow selecting multiple files at once. */
  multiple?: boolean;
  /** Dropzone heading. */
  title?: string;
  /** Dropzone supporting copy. */
  description?: string;
  /** Dropzone icon. */
  icon?: React.ReactNode;
  /** Start uploading as soon as files are added. */
  auto?: boolean;
  /** Files present before any interaction. */
  initialFiles?: FileEntry[];
  /** Max simultaneous uploads from uploadAll. Default 3. */
  concurrency?: number;
};

export type FileUploadContextValue = {
  files: FileEntry[];
  isDragging: boolean;
  isUploading: boolean;
  isFull: boolean;

  config: FileUploadConfig;

  setIsDragging: (v: boolean) => void;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  uploadFile: (id: string) => Promise<void>;
  uploadAll: () => Promise<void>;
  removeAll: () => void;
  cancelFile: (id: string) => void;
  retryFile: (id: string) => Promise<void>;
  onAddRejected: (fileRejections: FileRejection[]) => void;
};
