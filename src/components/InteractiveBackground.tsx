"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed, mouse-reactive backdrop: parallax glow blobs, a cursor-revealed dot
 * field and a spotlight. Purely decorative; respects reduced-motion.
 */
export default function InteractiveBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const spot = root.querySelector<HTMLElement>("[data-spot]");
    const dots = root.querySelector<HTMLElement>("[data-dots]");
    const pars = Array.from(root.querySelectorAll<HTMLElement>("[data-par]"));

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight * 0.3;
    let cx = tx;
    let cy = ty;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      const nx = cx / window.innerWidth - 0.5;
      const ny = cy / window.innerHeight - 0.5;
      if (spot) {
        spot.style.left = cx + "px";
        spot.style.top = cy + "px";
      }
      if (dots) {
        dots.style.setProperty("--mx", cx + "px");
        dots.style.setProperty("--my", cy + "px");
      }
      pars.forEach((p) => {
        const d = parseFloat(p.dataset.par || "20") || 20;
        p.style.transform = `translate(${nx * d}px,${ny * d}px)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div data-par="55" className="absolute -left-[8%] -top-[12%] will-change-transform">
        <div className="h-[48vw] w-[48vw] animate-float rounded-full bg-[radial-gradient(circle,rgba(94,91,255,.24),transparent_65%)] blur-[24px]" />
      </div>
      <div data-par="-70" className="absolute -bottom-[18%] -right-[10%] will-change-transform">
        <div className="h-[42vw] w-[42vw] animate-float rounded-full bg-[radial-gradient(circle,rgba(201,242,94,.11),transparent_65%)] blur-[24px] [animation-direction:reverse]" />
      </div>
      <div data-par="38" className="absolute right-[18%] top-[30%] will-change-transform">
        <div className="h-[26vw] w-[26vw] rounded-full bg-[radial-gradient(circle,rgba(94,91,255,.10),transparent_60%)] blur-[20px]" />
      </div>
      <div
        data-dots
        className="absolute -inset-[10%] bg-[radial-gradient(rgba(255,255,255,.16)_1.2px,transparent_1.2px)] [background-size:36px_36px] [-webkit-mask-image:radial-gradient(circle_320px_at_var(--mx,50%)_var(--my,28%),#000,transparent_72%)] [mask-image:radial-gradient(circle_320px_at_var(--mx,50%)_var(--my,28%),#000,transparent_72%)]"
      />
      <div
        data-spot
        className="absolute left-0 top-0 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(94,91,255,.14),transparent_62%)] will-change-[left,top]"
      />
    </div>
  );
}
