"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconChevronDown,
  IconClipboard,
  IconFileText,
  IconBrandOpenai,
} from "@tabler/icons-react";
import type { DocPage } from "@/content/docs/doc-schema";
import { docPageToMarkdown } from "@/content/docs/doc-to-markdown";

/**
 * "Copy page as Markdown" — the pattern Mintlify/Vercel docs popularized:
 * since every page here is already structured `DocBlock` data rather than
 * prose, it serializes to clean Markdown for free. Useful for pasting into
 * an LLM chat, a PR description, or an issue.
 */
export function CopyPageMarkdown({ page, className }: { page: DocPage; className?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleCopy() {
    const markdown = docPageToMarkdown(page);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setOpen(false);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — no-op.
    }
  }

  function handleViewRaw() {
    const markdown = docPageToMarkdown(page);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Revoke shortly after — enough time for the new tab to load it.
    setTimeout(() => URL.revokeObjectURL(url), 15_000);
    setOpen(false);
  }

  function handleOpenInChatGPT() {
    const markdown = docPageToMarkdown(page);
    const prompt = `Here are the docs for ${page.meta.title}:\n\n${markdown}\n\nHelp me use this.`;
    window.open(`https://chat.openai.com/?q=${encodeURIComponent(prompt)}`, "_blank");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <div className="flex overflow-hidden rounded-md border border-border/70">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-bui-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        >
          {copied ? (
            <IconCheck size={13} strokeWidth={2} />
          ) : (
            <IconClipboard size={13} strokeWidth={1.9} />
          )}
          {copied ? "Copied" : "Copy page"}
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="More copy options"
          aria-expanded={open}
          className="flex items-center justify-center border-l border-border/70 px-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        >
          <IconChevronDown
            size={12}
            strokeWidth={2}
            className={cn("transition-transform duration-150", open && "rotate-180")}
          />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-52 overflow-hidden rounded-md border border-border/70 bg-card py-1 shadow-lg shadow-black/5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-bui-sm text-foreground hover:bg-muted/60"
          >
            <IconClipboard size={13} strokeWidth={1.9} className="text-muted-foreground" />
            Copy as Markdown
          </button>
          <button
            type="button"
            onClick={handleViewRaw}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-bui-sm text-foreground hover:bg-muted/60"
          >
            <IconFileText size={13} strokeWidth={1.9} className="text-muted-foreground" />
            View as Markdown
          </button>
          <button
            type="button"
            onClick={handleOpenInChatGPT}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-bui-sm text-foreground hover:bg-muted/60"
          >
            <IconBrandOpenai size={13} strokeWidth={1.9} className="text-muted-foreground" />
            Open in ChatGPT
          </button>
        </div>
      )}
    </div>
  );
}
