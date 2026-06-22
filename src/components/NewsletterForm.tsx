"use client";

import { useState } from "react";
import Turnstile from "@/components/Turnstile";

export default function NewsletterForm({
  source = "footer",
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, turnstileToken: token }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className={`text-sm ${compact ? "" : "text-muted"}`}>
        🎉 Thanks for subscribing! Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com.au"
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-ink-900/60 px-4 py-2.5 text-sm outline-none transition-colors focus:border-cyan-glow/60"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {status === "sending" ? "…" : "Subscribe"}
        </button>
      </div>
      <Turnstile onToken={setToken} />
      {status === "error" && (
        <span className="text-xs text-pink-glow">Something went wrong.</span>
      )}
    </form>
  );
}
