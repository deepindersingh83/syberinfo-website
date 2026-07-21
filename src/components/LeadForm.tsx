"use client";

import { useState } from "react";
import Turnstile from "@/components/Turnstile";

type Status = "idle" | "sending" | "sent" | "error";

const inputCls =
  "w-full rounded-[11px] border border-white/[.12] bg-white/[.03] px-[15px] py-[13px] text-[14.5px] text-foreground outline-none transition-colors placeholder:text-muted-3 focus:border-indigo";

/**
 * Managed-IT styled enquiry form. Posts to /api/contact with Turnstile +
 * honeypot spam protection (same backend as the legacy contact form).
 */
export default function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, turnstileToken: token }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong.");
      }
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="card px-[34px] py-[38px] text-center">
        <div className="mx-auto mb-[22px] grid h-[60px] w-[60px] place-items-center rounded-full bg-lime/[.14] text-[28px] text-lime">
          ✓
        </div>
        <h3 className="mb-3 font-display text-2xl font-bold tracking-[-.02em]">
          Thanks — we&rsquo;re on it.
        </h3>
        <p className="mx-auto mb-[26px] max-w-[34ch] text-[15px] leading-relaxed text-muted">
          Your message is in. Expect a reply from a real engineer within one
          business day.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="rounded-full border border-white/[.16] bg-transparent px-[22px] py-[11px] text-sm font-semibold text-foreground"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card px-[34px] py-9">
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-[7px]">
            <span className="text-[12.5px] font-medium text-muted-2">Name</span>
            <input name="name" required placeholder="Jane Doe" className={inputCls} />
          </label>
          <label className="flex flex-col gap-[7px]">
            <span className="text-[12.5px] font-medium text-muted-2">Work email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="jane@company.com.au"
              className={inputCls}
            />
          </label>
        </div>
        <label className="flex flex-col gap-[7px]">
          <span className="text-[12.5px] font-medium text-muted-2">
            Company &amp; team size
          </span>
          <input name="company" placeholder="Acme Pty Ltd · 25 staff" className={inputCls} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className="text-[12.5px] font-medium text-muted-2">
            What do you need help with?
          </span>
          <textarea
            name="message"
            required
            rows={4}
            placeholder="A short description of your current setup or the problem you're facing…"
            className={`${inputCls} resize-y`}
          />
        </label>

        {/* Honeypot */}
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
        />

        <Turnstile onToken={setToken} />

        {status === "error" && (
          <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-indigo px-6 py-[15px] text-[15.5px] font-semibold text-white shadow-[0_8px_30px_rgba(94,91,255,.35)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message →"}
        </button>
        <p className="text-center font-mono text-xs text-faint">
          No spam. We reply within 1 business day.
        </p>
      </div>
    </form>
  );
}
