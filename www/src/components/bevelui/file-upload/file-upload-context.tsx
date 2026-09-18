"use client";

import * as React from "react";
import type { FileRejection } from "react-dropzone";
import type {
  FileEntry,
  FileUploadConfig,
  FileUploadContextValue,
} from "./types";
import { formatBytes, getFileExt } from "./file-upload-utils";
import { useEventCallback } from "../lib/use-controllable-state";

const FileUploadContext = React.createContext<
  FileUploadContextValue | undefined
>(undefined);

export type FileUploadProviderProps = {
  children?: React.ReactNode;
  config?: FileUploadConfig;
  /**
   * The upload implementation. Receives an AbortSignal — honour it and
   * cancel/remove will actually stop the request in flight.
   *
   * @example
   * onUpload={async (file, onProgress, signal) => {
   *   const body = new FormData();
   *   body.append("file", file);
   *   const res = await fetch("/api/upload", { method: "POST", body, signal });
   *   if (!res.ok) throw new Error(await res.text());
   *   return await res.json();
   * }}
   */
  onUpload: (
    file: File,
    onProgress: (pct: number) => void,
    signal: AbortSignal,
  ) => Promise<{ url: string; meta?: Record<string, unknown> }>;
  /** Fired once every queued file has settled. Receives the final entries. */
  onComplete?: (files: FileEntry[]) => void;
  onError?: (id: string, error: string) => void;
  onFilesChange?: (files: FileEntry[]) => void;
  /** Files rejected by accept/maxSize/maxFiles, surfaced to the UI. */
  onRejected?: (rejections: FileRejection[]) => void;
};

export function useFileUpload(): FileUploadContextValue {
  const ctx = React.useContext(FileUploadContext);
  if (!ctx) {
    throw new Error("useFileUpload must be used within <FileUploadProvider>");
  }
  return ctx;
}

const DEFAULT_CONFIG: FileUploadConfig = { multiple: true };

export function FileUploadProvider({
  children,
  config = DEFAULT_CONFIG,
  onUpload,
  onComplete,
  onError,
  onFilesChange,
  onRejected,
}: FileUploadProviderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [files, setFiles] = React.useState<FileEntry[]>(
    () => config.initialFiles ?? [],
  );

  // Consumers overwhelmingly pass inline arrows. Wrapping them keeps effects
  // and callbacks from re-subscribing on every parent render.
  const emitComplete = useEventCallback(onComplete);
  const emitError = useEventCallback(onError);
  const emitFilesChange = useEventCallback(onFilesChange);
  const emitRejected = useEventCallback(onRejected);
  const upload = useEventCallback(onUpload);

  const controllers = React.useRef(new Map<string, AbortController>());
  // Guards against the auto-upload effect starting the same file twice before
  // the "uploading" status has committed.
  const started = React.useRef(new Set<string>());
  // Always-current view of files for async code, so callbacks never report a
  // snapshot captured before the upload ran.
  const filesRef = React.useRef(files);
  filesRef.current = files;

  const isUploading = files.some((f) => f.status === "uploading");
  const isFull = config.maxFiles ? files.length >= config.maxFiles : false;

  React.useEffect(() => {
    emitFilesChange(files);
  }, [files, emitFilesChange]);

  // Abort anything still in flight when the provider unmounts.
  React.useEffect(() => {
    const inFlight = controllers.current;
    return () => {
      inFlight.forEach((c) => c.abort());
      inFlight.clear();
    };
  }, []);

  const addFiles = React.useCallback(
    (incoming: File[]) => {
      setFiles((prev) => {
        const remaining = config.maxFiles
          ? config.maxFiles - prev.length
          : incoming.length;
        if (remaining <= 0) return prev;

        const entries: FileEntry[] = incoming
          .slice(0, remaining)
          .map((file) => ({
            id: crypto.randomUUID(),
            file,
            status: "idle",
            progress: 0,
            meta: { ext: getFileExt(file), size: formatBytes(file.size) },
          }));

        return [...prev, ...entries];
      });
    },
    [config.maxFiles],
  );

  const removeFile = React.useCallback((id: string) => {
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
    started.current.delete(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const removeAll = React.useCallback(() => {
    controllers.current.forEach((c) => c.abort());
    controllers.current.clear();
    started.current.clear();
    // The original staggered removals with setTimeout(i * 150), leaving
    // uncancelled timers that fired after unmount. Layout animation on the
    // list handles the visual stagger instead.
    setFiles([]);
  }, []);

  const cancelFile = React.useCallback((id: string) => {
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
    started.current.delete(id);
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id && f.status === "uploading"
          ? { ...f, status: "idle", progress: 0 }
          : f,
      ),
    );
  }, []);

  const uploadFile = React.useCallback(
    async (id: string) => {
      const entry = filesRef.current.find((f) => f.id === id);
      if (!entry || entry.status === "uploading" || started.current.has(id)) {
        return;
      }

      started.current.add(id);

      const controller = new AbortController();
      controllers.current.set(id, controller);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: "uploading", progress: 0, error: undefined }
            : f,
        ),
      );

      const onProgress = (pct: number) => {
        if (controller.signal.aborted) return;
        const clamped = Math.max(0, Math.min(100, Math.round(pct)));
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id !== id) return f;
            // Throttle intermediate ticks, but never swallow the final 100 —
            // the original's `< 2` guard could leave a bar stuck at 99%.
            if (clamped < 100 && Math.abs(f.progress - clamped) < 2) return f;
            return { ...f, progress: clamped };
          }),
        );
      };

      try {
        const result = await upload(entry.file, onProgress, controller.signal);
        if (controller.signal.aborted) return;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, status: "done" as const, progress: 100, ...result }
              : f,
          ),
        );
      } catch (err) {
        if (controller.signal.aborted) return;

        const message =
          err instanceof Error
            ? err.message
            : `Failed to upload ${entry.file.name}`;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, status: "error" as const, error: message }
              : f,
          ),
        );
        emitError(id, message);
      } finally {
        controllers.current.delete(id);
        started.current.delete(id);
      }
    },
    [upload, emitError],
  );

  const retryFile = React.useCallback(
    async (id: string) => {
      started.current.delete(id);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: "idle", progress: 0, error: undefined }
            : f,
        ),
      );
      // Let the reset commit before re-reading the entry.
      await Promise.resolve();
      await uploadFile(id);
    },
    [uploadFile],
  );

  const uploadAll = React.useCallback(async () => {
    const ids = filesRef.current
      .filter((f) => f.status === "idle")
      .map((f) => f.id);

    const limit = config.concurrency ?? 3;
    const queue = [...ids];

    // Bounded concurrency — the original fired every upload at once and did
    // not await the result, so callers could not tell when it finished.
    const workers = Array.from({ length: Math.min(limit, queue.length) }, () =>
      (async () => {
        while (queue.length) {
          const next = queue.shift();
          if (next) await uploadFile(next);
        }
      })(),
    );

    await Promise.all(workers);
  }, [uploadFile, config.concurrency]);

  // Auto-upload. Runs only for files not already started, so a state update
  // mid-flight cannot kick off a second request for the same entry.
  React.useEffect(() => {
    if (!config.auto) return;
    files
      .filter((f) => f.status === "idle" && !started.current.has(f.id))
      .forEach((f) => void uploadFile(f.id));
  }, [files, config.auto, uploadFile]);

  // Completion fires once per settled batch, with the entries as they are now
  // rather than a stale closure captured before the upload began.
  const wasSettling = React.useRef(false);
  React.useEffect(() => {
    const active = files.filter(
      (f) => f.status === "uploading" || f.status === "idle",
    ).length;
    const hasFiles = files.length > 0;

    if (active > 0) {
      wasSettling.current = true;
      return;
    }
    if (wasSettling.current && hasFiles) {
      wasSettling.current = false;
      emitComplete(files);
    }
  }, [files, emitComplete]);

  const onAddRejected = React.useCallback(
    (rejections: FileRejection[]) => {
      // Rejected files now land in the list as error entries. The original
      // built an entry object and threw it away, so a file rejected for size
      // or type vanished silently — the user saw nothing happen at all.
      const entries: FileEntry[] = rejections.map(({ file, errors }) => ({
        id: crypto.randomUUID(),
        file: file as File,
        status: "error",
        progress: 0,
        rejected: true,
        error: errors.map((e) => e.message).join(", "),
        meta: {
          ext: getFileExt(file as File),
          size: formatBytes((file as File).size),
        },
      }));

      setFiles((prev) => [...prev, ...entries]);
      entries.forEach((e) => emitError(e.id, e.error ?? "Rejected"));
      emitRejected(rejections);
    },
    [emitError, emitRejected],
  );

  const value = React.useMemo<FileUploadContextValue>(
    () => ({
      files,
      isDragging,
      isUploading,
      isFull,
      config,
      setIsDragging,
      addFiles,
      removeFile,
      removeAll,
      uploadFile,
      uploadAll,
      cancelFile,
      retryFile,
      onAddRejected,
    }),
    [
      files,
      isDragging,
      isUploading,
      isFull,
      config,
      addFiles,
      removeFile,
      removeAll,
      uploadFile,
      uploadAll,
      cancelFile,
      retryFile,
      onAddRejected,
    ],
  );

  return (
    <FileUploadContext.Provider value={value}>
      {children}
    </FileUploadContext.Provider>
  );
}
