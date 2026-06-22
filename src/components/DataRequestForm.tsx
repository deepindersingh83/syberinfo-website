"use client";

import { useState } from "react";

export default function DataRequestForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/data-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl glass p-6 text-center">
        <p className="font-semibold">Request received ✓</p>
        <p className="mt-1 text-sm text-muted">
          We&apos;ll verify your identity and action your request within 30 days,
          as required under the Privacy Act.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl glass p-6">
      <div className="grid gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Your email *</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Request type *</span>
          <select
            name="type"
            required
            defaultValue="export"
            className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60"
          >
            <option value="export">Access / export my data</option>
            <option value="delete">Delete my data</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Details (optional)</span>
          <textarea
            name="details"
            rows={3}
            className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60"
          />
        </label>
      </div>
      {status === "error" && (
        <p className="mt-3 text-sm text-pink-glow">
          Something went wrong. Please email us directly.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Submit request"}
      </button>
    </form>
  );
}
