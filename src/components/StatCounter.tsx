"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Count-up animation for a headline stat like "99.98%", "<8 min", "120+".
 * Parses an optional non-numeric prefix/suffix and animates the number.
 */
export default function StatCounter({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const m = value.match(/^(\D*?)([\d,]+(?:\.\d+)?)(.*)$/);
    // Non-numeric or reduced-motion: nothing to animate — state already holds
    // `value` from the initializer, so no synchronous setState is needed.
    if (!m || reduce) return;
    const prefix = m[1];
    const numStr = m[2].replace(/,/g, "");
    const suffix = m[3];
    const target = parseFloat(numStr);
    const decimals = (numStr.split(".")[1] || "").length;

    let raf = 0;
    let started = false;
    const run = () => {
      const dur = 1400;
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(prefix + (target * eased).toFixed(decimals) + suffix);
        if (p < 1) raf = requestAnimationFrame(step);
        else setDisplay(value);
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && !started) {
            started = true;
            run();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <div
      ref={ref}
      className="font-display text-[clamp(34px,4vw,52px)] font-bold tracking-[-.03em] text-foreground"
    >
      {display}
    </div>
  );
}
