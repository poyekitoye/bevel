"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconPlus } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import type { DocBlockFaq } from "@/content/docs/doc-schema";

export function Faq({ items, className }: DocBlockFaq & { className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={cn("flex flex-col divide-y divide-border/70 rounded-md border border-border/70", className)}>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
            >
              <span className="text-bui-base font-medium text-foreground">{item.q}</span>
              <IconPlus
                size={14}
                strokeWidth={2}
                className={cn(
                  "shrink-0 text-muted-foreground transition-transform duration-150",
                  isOpen && "rotate-45",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-3.5 pb-3.5 text-bui-base leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
