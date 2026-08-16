"use client";

import { useState } from "react";

/** Public review submission form. Posts to /api/reviews; reviews are moderated. */
export default function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState("");

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-lime/30 bg-lime/[.08] px-6 py-6 text-center">
        <div className="font-display text-lg font-bold text-lime">Thank you! 🙏</div>
        <p className="mt-1 text-sm text-muted-2">
          Your review has been submitted and will appear once our team approves it.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy");
    setError("");
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      company: (form.elements.namedItem("company") as HTMLInputElement).value,
      role: (form.elements.namedItem("role") as HTMLInputElement).value,
      quote: (form.elements.namedItem("quote") as HTMLTextAreaElement).value,
      rating,
    };
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  const field =
    "w-full rounded-xl border border-white/[.12] bg-white/[.03] px-4 py-3 text-[15px] text-foreground placeholder:text-muted-3 focus:border-indigo/50 focus:outline-none";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-[13px] font-semibold text-muted-2">Your rating</label>
        <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className={`text-[28px] leading-none transition-colors ${
                n <= (hover || rating) ? "text-[#f5b301]" : "text-white/20"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Your name" className={field} />
        <input name="company" placeholder="Company (optional)" className={field} />
      </div>
      <input name="role" placeholder="Your role (optional)" className={field} />
      <textarea name="quote" required rows={4} placeholder="Tell us about your experience…" className={field} />
      {error && <p className="text-[13px] text-[#e88379]">{error}</p>}
      <button
        type="submit"
        disabled={state === "busy"}
        className="self-start rounded-full bg-indigo px-7 py-3 text-[15px] font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {state === "busy" ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
