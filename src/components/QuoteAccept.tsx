"use client";

import { useState } from "react";

/**
 * Accept + pay actions for a public proposal page.
 * - Accept posts the token to /api/quotes/accept.
 * - Pay now posts the token to /api/quotes/pay and redirects to Stripe Checkout.
 * Paying implies acceptance (reconciled server-side by the Stripe webhook).
 */
export default function QuoteAccept({
  token,
  accepted,
  paid = false,
  canPay = false,
}: {
  token: string;
  accepted: boolean;
  paid?: boolean;
  canPay?: boolean;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">(accepted ? "done" : "idle");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  if (paid) {
    return (
      <div className="rounded-xl border border-lime/30 bg-lime/[.08] px-6 py-5 text-center">
        <div className="font-display text-lg font-bold text-lime">Payment received ✓</div>
        <p className="mt-1 text-[14px] text-muted-2">
          Thank you — your proposal is paid and confirmed. We&rsquo;ll be in touch to get you started.
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

  async function pay() {
    setPaying(true);
    setError("");
    try {
      const res = await fetch("/api/quotes/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout. Please try again.");
        setPaying(false);
        return;
      }
      window.location.href = data.url as string;
    } catch {
      setError("Network error. Please try again.");
      setPaying(false);
    }
  }

  const payButton = canPay ? (
    <button
      onClick={pay}
      disabled={paying}
      className="rounded-full bg-lime px-8 py-3.5 text-[15px] font-semibold text-ink-900 shadow-[0_8px_26px_rgba(160,220,80,.32)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
    >
      {paying ? "Starting checkout…" : "Pay now →"}
    </button>
  ) : null;

  if (state === "done") {
    return (
      <div className="text-center">
        <div className="rounded-xl border border-lime/30 bg-lime/[.08] px-6 py-5">
          <div className="font-display text-lg font-bold text-lime">Proposal accepted 🎉</div>
          <p className="mt-1 text-[14px] text-muted-2">
            Thank you — our team has been notified.
            {canPay ? " You can pay securely below to get started right away." : " We&rsquo;ll be in touch to get you started."}
          </p>
        </div>
        {payButton && <div className="mt-5 text-center">{payButton}</div>}
        {error && <p className="mt-3 text-[13px] text-[#e88379]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={accept}
          disabled={state === "busy"}
          className="rounded-full bg-indigo px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_26px_rgba(94,91,255,.4)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {state === "busy" ? "Accepting…" : "Accept this proposal →"}
        </button>
        {payButton}
      </div>
      {error && <p className="mt-3 text-[13px] text-[#e88379]">{error}</p>}
    </div>
  );
}
