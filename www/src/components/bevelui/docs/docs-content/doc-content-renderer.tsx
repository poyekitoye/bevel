"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconLink } from "@tabler/icons-react";
import type { DocSection, DocBlock } from "@/content/docs/doc-schema";
import { CodeBlock } from "./code-block";
import { Callout } from "./callout";
import { PropsTable } from "./props-table";
import { Steps } from "./steps";
import { FileTree } from "./file-tree";
import { DemoBlock, type DemoRegistry } from "./demo-block";
import { InstallBlock } from "./install-block";
import { Faq } from "./faq";
import { Related, BuiltWith } from "./related";

function SectionHeading({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard API unavailable — the anchor still works via the href.
    }
  }

  return (
    <h2
      id={id}
      className="group/heading scroll-mt-20 flex items-center gap-1.5 text-lg font-semibold tracking-tight text-foreground"
    >
      {title}
      <a
        href={`#${id}`}
        onClick={handleCopyLink}
        aria-label={`Copy link to ${title}`}
        className="opacity-0 transition-opacity group-hover/heading:opacity-100 focus-visible:opacity-100"
      >
        <IconLink size={14} strokeWidth={2} className="text-muted-foreground" />
      </a>
      {copied && (
        <span className="font-mono text-bui-2xs font-normal uppercase tracking-wide text-primary">
          Copied
        </span>
      )}
    </h2>
  );
}

function Block({ block, demoRegistry }: { block: DocBlock; demoRegistry?: DemoRegistry }) {
  switch (block.type) {
    case "text":
      return (
        <p className="text-bui-md leading-relaxed text-muted-foreground">{block.content}</p>
      );
    case "code":
      return (
        <CodeBlock
          code={block.code}
          language={block.language}
          filename={block.filename}
          highlightLines={block.highlightLines}
          showLineNumbers={block.showLineNumbers}
        />
      );
    case "callout":
      return <Callout {...block} />;
    case "props-table":
      return <PropsTable {...block} />;
    case "steps":
      return <Steps {...block} />;
    case "file-tree":
      return <FileTree {...block} />;
    case "demo":
      return <DemoBlock {...block} registry={demoRegistry} />;
    case "install":
      return <InstallBlock {...block} />;
    case "faq":
      return <Faq {...block} />;
    case "related":
      return <Related {...block} />;
    case "built-with":
      return <BuiltWith {...block} />;
    default:
      return null;
  }
}

export function DocContentRenderer({
  sections,
  demoRegistry,
  className,
}: {
  sections: DocSection[];
  demoRegistry?: DemoRegistry;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-10", className)}>
      {sections.map((section) => (
        <section key={section.id} className="flex flex-col gap-3.5">
          {section.title && <SectionHeading id={section.id} title={section.title} />}
          {section.blocks.map((block, i) => (
            <Block key={i} block={block} demoRegistry={demoRegistry} />
          ))}
        </section>
      ))}
    </div>
  );
}
