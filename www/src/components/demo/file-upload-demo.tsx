"use client";

import * as React from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { FileUploadRoot, type FileEntry } from "@/components/bevelui/file-upload";
import { DemoFeatureRow, DemoIntro, DemoOutput } from "./demo-chrome";

/**
 * Stand-in for a real upload. It honours the AbortSignal, which is the whole
 * point of the third argument — without it, Cancel and Remove could update the
 * UI but never actually stop the request.
 */
function simulateUpload(
  file: File,
  onProgress: (pct: number) => void,
  signal: AbortSignal,
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    let progress = 0;

    const tick = setInterval(() => {
      progress += Math.random() * 12 + 4;

      if (progress >= 100) {
        clearInterval(tick);
        cleanup();
        onProgress(100);

        if (file.name.toLowerCase().startsWith("fail")) {
          reject(new Error("Server rejected the file (simulated)."));
        } else {
          resolve({ url: URL.createObjectURL(file) });
        }
        return;
      }

      onProgress(Math.min(Math.round(progress), 99));
    }, 220);

    function onAbort() {
      clearInterval(tick);
      cleanup();
      reject(new DOMException("Upload cancelled", "AbortError"));
    }

    function cleanup() {
      signal.removeEventListener("abort", onAbort);
    }

    signal.addEventListener("abort", onAbort);
  });
}

export function FileUploadDemo() {
  const [completed, setCompleted] = React.useState<
    { name: string; url?: string }[] | undefined
  >();

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <DemoIntro eyebrow="File Upload">
        Drop a few files and watch them queue. Uploads run three at a time,
        Cancel aborts the request in flight rather than just hiding the row, and
        anything the dropzone turns away appears as a failed entry instead of
        vanishing without explanation.
      </DemoIntro>

      <FileUploadRoot
        onUpload={simulateUpload}
        config={{
          multiple: true,
          maxFiles: 8,
          maxSize: 2 * 1024 * 1024,
          concurrency: 3,
          title: "Drop files here, or click to browse",
        }}
        // Fires once the batch settles, with the final entries — URLs included.
        onComplete={(files: FileEntry[]) =>
          setCompleted(
            files.map((f) => ({ name: f.file.name, url: f.url })),
          )
        }
      />

      <DemoFeatureRow
        items={[
          "AbortSignal cancel",
          "concurrency: 3",
          "rejections shown",
          "retry on failure",
          "grid / list",
        ]}
      />

      <div className="flex items-start gap-1.5 px-1">
        <IconInfoCircle
          size={12}
          aria-hidden
          className="mt-0.5 shrink-0 text-muted-foreground/40"
        />
        <p className="font-mono text-bui-xs leading-relaxed text-muted-foreground/60">
          Name a file{" "}
          <code className="text-muted-foreground">fail…</code> to force an
          error, or drop something over 2 MB to see a rejection surface.
        </p>
      </div>

      {completed && <DemoOutput label="onComplete" value={completed} />}
    </div>
  );
}
