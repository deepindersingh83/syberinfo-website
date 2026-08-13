"use client";

import { useState } from "react";

/** Accept button for a public proposal page. Posts the token to /api/quotes/accept. */
export default function QuoteAccept({ token, accepted }: { token: string; accepted: boolean }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">(accepted ? "done" : "idle");
  const [error, setError] = useState("");

  if (state === "done") {
    return (
      <div className="rounded-xl border border-lime/30 bg-lime/[.08] px-6 py-5 text-center">
        <div className="font-display text-lg font-bold text-lime">Proposal accepted 🎉</div>
        <p className="mt-1 text-[14px] text-muted-2">
          Thank you — our team has been notified and will be in touch to get you started.
        </p>
      </div>
    );
  }

  async function accept() {
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/quotes/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="text-center">
      <button
        onClick={accept}
        disabled={state === "busy"}
        className="rounded-full bg-indigo px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_26px_rgba(94,91,255,.4)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {state === "busy" ? "Accepting…" : "Accept this proposal →"}
      </button>
      {error && <p className="mt-3 text-[13px] text-[#e88379]">{error}</p>}
    </div>
  );
}
