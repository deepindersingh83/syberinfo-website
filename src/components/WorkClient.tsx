"use client";

import { useState } from "react";
import Link from "next/link";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import type { Project } from "@/lib/data";

export default function WorkClient({ projects }: { projects: Project[] }) {
  const industries = ["All", ...Array.from(new Set(projects.map((p) => p.industry)))];
  const [filter, setFilter] = useState("All");

  const shown =
    filter === "All" ? projects : projects.filter((p) => p.industry === filter);

  return (
    <>
      {/* Industry filter */}
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {industries.map((ind) => (
          <button
            key={ind}
            onClick={() => setFilter(ind)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === ind
                ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-ink-950"
                : "border border-white/10 bg-white/5 text-muted hover:text-foreground"
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {shown.map((p) => (
          <div key={p.slug} className="flex flex-col rounded-3xl glass p-5">
            <BeforeAfterSlider before={p.beforeImage} after={p.afterImage} alt={p.title} />
            <div className="mt-5 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-white/5 px-3 py-1 font-semibold text-gradient">
                  {p.industry}
                </span>
                {p.services.map((s) => (
                  <span key={s} className="rounded-full bg-white/5 px-3 py-1 text-muted">
                    {s}
                  </span>
                ))}
              </div>
              <h3 className="mt-3 text-xl font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.summary}</p>
              {p.results.length > 0 && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                  {p.results.map((r) => (
                    <li
                      key={r}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-foreground/90"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm font-semibold text-foreground/80 transition-transform hover:translate-x-1"
              >
                Visit site →
              </a>
            )}
          </div>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="mt-12 text-center text-muted">No projects in this category yet.</p>
      )}

      <div className="mt-16 text-center">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03]"
        >
          Start your project →
        </Link>
      </div>
    </>
  );
}
