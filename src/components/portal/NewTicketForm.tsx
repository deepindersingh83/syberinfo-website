"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTicketForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/portal/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error();
      router.push(`/portal/tickets/${body.id}`);
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl glass p-6">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Subject</span>
        <input name="subject" required className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60" />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Department</span>
        <select name="department" defaultValue="support" className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60">
          <option value="support">Support</option>
          <option value="billing">Billing</option>
          <option value="sales">Sales</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Message</span>
        <textarea name="message" required rows={5} className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60" />
      </label>
      {status === "error" && <p className="text-sm text-pink-glow">Could not create ticket. Please try again.</p>}
      <button type="submit" disabled={status === "sending"} className="rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-60">
        {status === "sending" ? "Creating…" : "Create ticket"}
      </button>
    </form>
  );
}
