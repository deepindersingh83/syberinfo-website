"use client";

import { useState } from "react";

/**
 * Before/after image comparison slider. Falls back to labelled gradient
 * placeholders when images aren't supplied.
 */
export default function BeforeAfterSlider({
  before,
  after,
  alt = "",
}: {
  before?: string;
  after?: string;
  alt?: string;
}) {
  const [pos, setPos] = useState(50);

  return (
    <div className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-2xl">
      {/* After (full) */}
      {after ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={after} alt={`${alt} after`} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-cyan-glow/30 to-violet-glow/30">
          <span className="rounded-full bg-ink-950/60 px-3 py-1 text-xs font-semibold">After</span>
        </div>
      )}
      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        {before ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={before} alt={`${alt} before`} className="absolute inset-0 h-full w-full object-cover" style={{ width: "100vw", maxWidth: "none" }} />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-ink-700 to-ink-800">
            <span className="rounded-full bg-ink-950/60 px-3 py-1 text-xs font-semibold text-muted">Before</span>
          </div>
        )}
      </div>
      {/* Divider */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white/80"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink-950 shadow">
          ⇄
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare before and after"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
