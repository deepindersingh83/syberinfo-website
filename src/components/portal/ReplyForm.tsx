"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [value, setValue] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`/api/portal/tickets/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value }),
      });
      if (!res.ok) throw new Error();
      setValue("");
      setStatus("idle");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        rows={4}
        placeholder="Write a reply…"
        className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60"
      />
      {status === "error" && <p className="text-sm text-pink-glow">Could not send reply.</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send reply"}
      </button>
    </form>
  );
}
