"use client";

import { useState } from "react";
import { services } from "@/lib/data";
import Turnstile from "@/components/Turnstile";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
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
      <div className="rounded-3xl glass p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-cyan-glow to-violet-glow text-2xl text-ink-950">
          ✓
        </div>
        <h3 className="mt-5 text-2xl font-bold">Thanks — message sent!</h3>
        <p className="mt-2 text-muted">
          We&apos;ve received your enquiry and will get back to you within one
          business day.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl glass p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required placeholder="Jane Smith" />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          placeholder="jane@business.com.au"
        />
        <Field label="Phone" name="phone" placeholder="0400 000 000" />
        <div className="flex flex-col gap-2">
          <label htmlFor="service" className="text-sm font-medium">
            Service of interest
          </label>
          <select
            id="service"
            name="service"
            defaultValue=""
            className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none transition-colors focus:border-cyan-glow/60"
          >
            <option value="" disabled>
              Choose a service…
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value="Web Products / Hosting">
              Web Products / Hosting
            </option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-medium">
          Project details
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us a little about your project, goals and timeline…"
          className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none transition-colors focus:border-cyan-glow/60"
        />
      </div>

      {/* Honeypot field for basic spam protection */}
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
        <p className="mt-4 rounded-xl border border-pink-glow/30 bg-pink-glow/10 px-4 py-3 text-sm text-pink-glow">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-6 py-3.5 text-sm font-semibold text-ink-950 shadow-[0_0_30px_-8px_var(--color-violet-glow)] transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Send message →"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-cyan-glow"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none transition-colors focus:border-cyan-glow/60"
      />
    </div>
  );
}
