"use client";

import { useState } from "react";

/** Email subscribe box for status-page incident/maintenance alerts. */
export default function StatusSubscribe() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (new FormData(e.currentTarget).get("email") as string) || "";
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/status/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not subscribe.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="card px-7 py-6 text-center text-[14px] text-lime">
        You&rsquo;re subscribed — we&rsquo;ll email you about incidents and maintenance.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-3 px-7 py-6 sm:flex-row sm:items-center">
      <div className="flex-1">
        <div className="text-[15px] font-semibold">Get status alerts</div>
        <div className="text-[13px] text-muted-3">Email notifications when we post or update an incident.</div>
      </div>
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="you@company.com.au"
          className="rounded-[9px] border border-white/[.12] bg-white/[.03] px-4 py-2.5 text-[14px] outline-none focus:border-indigo"
        />
        <button
          disabled={state === "busy"}
          className="rounded-[9px] bg-indigo px-5 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-60"
        >
          {state === "busy" ? "…" : "Subscribe"}
        </button>
      </div>
      {error && <p className="text-[12.5px] text-[#e88379] sm:w-full">{error}</p>}
    </form>
  );
}
