"use client";

import { useState } from "react";

type Item = { question: string; answer: string };

export default function FaqAccordion({
  items,
  defaultOpen = 0,
}: {
  items: Item[];
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-3">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <button
            key={f.question}
            onClick={() => setOpen(isOpen ? -1 : i)}
            className={`cursor-pointer rounded-2xl border bg-white/[.02] px-[26px] py-[22px] text-left transition-colors ${
              isOpen ? "border-indigo/40" : "border-white/[.08]"
            }`}
          >
            <div className="flex items-center justify-between gap-5">
              <span className="font-display text-[17px] font-semibold tracking-[-.01em]">
                {f.question}
              </span>
              <span
                className={`grid h-[26px] w-[26px] flex-none place-items-center rounded-full border border-white/[.18] text-base leading-none ${
                  isOpen ? "text-lime" : "text-muted"
                }`}
              >
                {isOpen ? "−" : "+"}
              </span>
            </div>
            {isOpen && (
              <p className="mt-4 max-w-[64ch] text-[14.5px] leading-relaxed text-muted">
                {f.answer}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
