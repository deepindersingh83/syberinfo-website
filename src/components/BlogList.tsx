"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Post } from "@/lib/data";

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogList({ posts }: { posts: Post[] }) {
  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return posts.filter((p) => {
      const inCat = cat === "All" || p.category === cat;
      const inSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.excerpt.toLowerCase().includes(term);
      return inCat && inSearch;
    });
  }, [posts, cat, q]);

  return (
    <>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                cat === c
                  ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-ink-950"
                  : "border border-white/10 bg-white/5 text-muted hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles…"
          className="w-full rounded-full border border-white/10 bg-ink-900/60 px-4 py-2.5 text-sm outline-none transition-colors focus:border-cyan-glow/60 sm:w-64"
        />
      </div>

      {shown.length === 0 ? (
        <p className="mt-14 text-center text-muted">No articles match your search.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl glass transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20"
            >
              {p.coverImage && (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={p.coverImage}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-7">
              <div className="flex items-center gap-2 text-xs text-muted">
                {p.category && (
                  <span className="rounded-full bg-white/5 px-3 py-1 font-semibold text-gradient">
                    {p.category}
                  </span>
                )}
                <span>{p.readMins} min read</span>
              </div>
              <h2 className="mt-4 text-xl font-bold leading-snug">{p.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {p.excerpt}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                <span className="text-muted">{formatDate(p.date)}</span>
                <span className="font-semibold text-foreground/80 transition-transform group-hover:translate-x-1">
                  Read →
                </span>
              </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
