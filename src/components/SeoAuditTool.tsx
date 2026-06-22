"use client";

import { useState } from "react";

type Result = {
  url: string;
  scores: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    bestPractices: number | null;
  };
  metrics: { lcp: string; fcp: string; cls: string; tbt: string };
};

function scoreColor(n: number | null) {
  if (n === null) return "#9aa4c7";
  if (n >= 90) return "#22c55e";
  if (n >= 50) return "#eab308";
  return "#f472b6";
}

function Gauge({ label, value }: { label: string; value: number | null }) {
  const color = scoreColor(value);
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="grid h-20 w-20 place-items-center rounded-full text-xl font-bold"
        style={{
          background: `conic-gradient(${color} ${(value ?? 0) * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
        }}
      >
        <div className="grid h-16 w-16 place-items-center rounded-full bg-ink-900">
          <span style={{ color }}>{value ?? "—"}</span>
        </div>
      </div>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export default function SeoAuditTool() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="rounded-3xl glass p-7 sm:p-9">
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Website URL *</span>
          <input
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourwebsite.com.au"
            className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Email (for the full report)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com.au"
            className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60"
          />
        </label>
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "loading" ? "Analysing…" : "Run free audit"}
        </button>
      </form>

      {status === "loading" && (
        <p className="mt-5 text-sm text-muted">
          Analysing your site with Google Lighthouse — this can take up to a
          minute…
        </p>
      )}
      {status === "error" && (
        <p className="mt-5 text-sm text-pink-glow">{error}</p>
      )}

      {result && (
        <div className="mt-8">
          <p className="text-sm text-muted">
            Results for <span className="text-foreground">{result.url}</span>{" "}
            (mobile)
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-6 sm:justify-start">
            <Gauge label="Performance" value={result.scores.performance} />
            <Gauge label="SEO" value={result.scores.seo} />
            <Gauge label="Accessibility" value={result.scores.accessibility} />
            <Gauge label="Best Practices" value={result.scores.bestPractices} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Largest Contentful Paint", result.metrics.lcp],
              ["First Contentful Paint", result.metrics.fcp],
              ["Cumulative Layout Shift", result.metrics.cls],
              ["Total Blocking Time", result.metrics.tbt],
            ].map(([label, val]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-sm font-bold">{val}</div>
                <div className="mt-1 text-[11px] text-muted">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-7 rounded-2xl bg-gradient-to-r from-cyan-glow/10 to-violet-glow/10 p-5 text-sm">
            Want us to fix what&apos;s holding your site back?{" "}
            <a href="/contact" className="font-semibold text-gradient">
              Get a free improvement plan →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
