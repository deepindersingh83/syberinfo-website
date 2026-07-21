"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

/**
 * Interactive Essential Eight self-assessment. Visitors rate their maturity
 * across the ACSC's eight mitigation strategies; the tool scores them, flags
 * the weakest controls, and offers to email the report (captured as a lead).
 */
const CONTROLS = [
  { key: "appcontrol", name: "Application control", q: "Do you control which applications can run on staff devices?" },
  { key: "patchapps", name: "Patch applications", q: "Are apps (browsers, Office, PDF, etc.) patched within days of a fix?" },
  { key: "macros", name: "Configure Office macros", q: "Are Microsoft Office macros blocked or restricted to vetted ones?" },
  { key: "hardening", name: "User application hardening", q: "Is risky web content (Flash, ads, Java, unneeded features) blocked?" },
  { key: "adminpriv", name: "Restrict admin privileges", q: "Are admin rights limited, reviewed, and separated from daily accounts?" },
  { key: "patchos", name: "Patch operating systems", q: "Are operating systems patched within days and unsupported OSes removed?" },
  { key: "mfa", name: "Multi-factor authentication", q: "Is MFA enforced on email, remote access and important systems?" },
  { key: "backups", name: "Regular backups", q: "Are backups automated, kept offline/immutable, and restore-tested?" },
];

const LEVELS = [
  { label: "Not started", value: 0, hint: "No control in place" },
  { label: "Partial", value: 1, hint: "Some coverage / ad-hoc" },
  { label: "Mostly", value: 2, hint: "In place, minor gaps" },
  { label: "Fully", value: 3, hint: "Implemented & maintained" },
];

const inputCls =
  "w-full rounded-[11px] border border-white/[.12] bg-white/[.03] px-[15px] py-[13px] text-[14.5px] text-foreground outline-none transition-colors placeholder:text-muted-3 focus:border-indigo";

type Status = "idle" | "sending" | "sent" | "error";

export default function EssentialEightAssessment() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [emailErr, setEmailErr] = useState("");

  const answeredCount = Object.keys(answers).length;
  const complete = answeredCount === CONTROLS.length;

  const result = useMemo(() => {
    const total = CONTROLS.reduce((s, c) => s + (answers[c.key] ?? 0), 0);
    const max = CONTROLS.length * 3;
    const pct = Math.round((total / max) * 100);
    // ACSC-style maturity is the *weakest* link, so surface the min level too.
    const min = CONTROLS.reduce((m, c) => Math.min(m, answers[c.key] ?? 0), 3);
    const weakest = [...CONTROLS]
      .map((c) => ({ ...c, score: answers[c.key] ?? 0 }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
    const band =
      pct >= 85 ? { label: "Strong", color: "#c9f25e" } :
      pct >= 55 ? { label: "Developing", color: "#ffb570" } :
      { label: "At risk", color: "#ff8a8a" };
    return { total, max, pct, min, weakest, band };
  }, [answers]);

  async function onEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const name = (f.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (f.elements.namedItem("email") as HTMLInputElement).value.trim();
    if (!name || !/.+@.+\..+/.test(email)) {
      setEmailErr("Please enter your name and a valid email.");
      return;
    }
    setEmailErr("");
    setStatus("sending");
    const summary = [
      `Essential Eight self-assessment result: ${result.pct}% (${result.band.label}), weakest maturity level ${result.min}/3.`,
      "",
      ...CONTROLS.map((c) => `- ${c.name}: ${LEVELS[answers[c.key] ?? 0].label}`),
      "",
      `Top priorities: ${result.weakest.map((w) => w.name).join(", ")}.`,
    ].join("\n");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, service: "Essential Eight assessment", message: summary }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  /* -------------------------------- Results ------------------------------- */
  if (submitted && complete) {
    return (
      <div className="mx-auto max-w-[900px]">
        <div className="card px-8 py-9 text-center">
          <div className="font-mono text-[13px] tracking-[.05em] text-indigo">YOUR RESULT</div>
          <div className="mt-3 font-display text-[clamp(48px,9vw,80px)] font-bold leading-none tracking-[-.03em]" style={{ color: result.band.color }}>
            {result.pct}%
          </div>
          <div className="mt-2 text-[15px] text-muted">
            Essential Eight readiness — <span style={{ color: result.band.color }}>{result.band.label}</span> · weakest maturity level {result.min}/3
          </div>
          <div className="mx-auto mt-6 h-2 max-w-[520px] overflow-hidden rounded-full bg-white/[.08]">
            <div className="h-full rounded-full" style={{ width: `${result.pct}%`, background: result.band.color }} />
          </div>
        </div>

        <h3 className="mb-4 mt-10 font-display text-[22px] font-bold tracking-[-.02em]">Your control breakdown</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {CONTROLS.map((c) => {
            const v = answers[c.key] ?? 0;
            const col = v >= 3 ? "#c9f25e" : v >= 2 ? "#ffb570" : "#ff8a8a";
            return (
              <div key={c.key} className="card flex items-center justify-between gap-4 px-5 py-4">
                <span className="text-[14.5px] font-medium">{c.name}</span>
                <span className="flex items-center gap-2 text-[13px]" style={{ color: col }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: col }} />
                  {LEVELS[v].label}
                </span>
              </div>
            );
          })}
        </div>

        <h3 className="mb-4 mt-10 font-display text-[22px] font-bold tracking-[-.02em]">Where to focus first</h3>
        <div className="flex flex-col gap-3">
          {result.weakest.map((w, i) => (
            <div key={w.key} className="card flex items-start gap-4 px-6 py-5">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-indigo/[.16] font-display text-[14px] font-bold text-indigo">{i + 1}</span>
              <div>
                <div className="font-display text-[16px] font-semibold">{w.name}</div>
                <div className="text-[13.5px] text-muted-2">Currently: {LEVELS[w.score].label}. This is one of your biggest exposure points — we can lift it fast.</div>
              </div>
            </div>
          ))}
        </div>

        {/* Lead capture / CTA */}
        <div className="mt-10 rounded-[22px] border border-indigo/40 bg-[linear-gradient(180deg,rgba(94,91,255,.14),rgba(94,91,255,.03))] p-8">
          {status === "sent" ? (
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-lime/[.14] text-2xl text-lime">✓</div>
              <h3 className="font-display text-2xl font-bold tracking-[-.02em]">Report on its way.</h3>
              <p className="mt-2 text-[15px] text-muted">We&rsquo;ll email your Essential Eight summary and follow up with a plan to close the gaps.</p>
              <Link href="/book" className="mt-6 inline-flex rounded-full bg-indigo px-7 py-3.5 text-[15px] font-semibold text-white">Book a free audit →</Link>
            </div>
          ) : (
            <>
              <h3 className="font-display text-2xl font-bold tracking-[-.02em]">Get your report + a plan to close the gaps</h3>
              <p className="mt-2 max-w-[52ch] text-[15px] text-muted">We&rsquo;ll email this summary and a prioritised, plain-English action plan — no obligation.</p>
              <form onSubmit={onEmail} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input name="name" placeholder="Your name" className={inputCls} />
                <input name="email" type="email" placeholder="Work email" className={inputCls} />
                <button disabled={status === "sending"} className="rounded-full bg-indigo px-6 py-[13px] text-[15px] font-semibold text-white disabled:opacity-60">
                  {status === "sending" ? "Sending…" : "Email my report"}
                </button>
              </form>
              {emailErr && <p className="mt-2 text-[13px] text-[#ff8a8a]">{emailErr}</p>}
              {status === "error" && <p className="mt-2 text-[13px] text-[#ff8a8a]">Something went wrong — please try again or contact us.</p>}
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => { setSubmitted(false); }} className="text-sm text-muted-2 hover:text-foreground">← Adjust my answers</button>
        </div>
      </div>
    );
  }

  /* --------------------------------- Quiz --------------------------------- */
  return (
    <div className="mx-auto max-w-[820px]">
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-[13px] text-muted-3">{answeredCount}/{CONTROLS.length} answered</span>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/[.08]">
          <div className="h-full rounded-full bg-indigo transition-all" style={{ width: `${(answeredCount / CONTROLS.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {CONTROLS.map((c, i) => (
          <div key={c.key} className="card px-6 py-6">
            <div className="mb-1 font-mono text-[12px] tracking-[.05em] text-indigo">CONTROL {i + 1}</div>
            <div className="font-display text-[18px] font-semibold tracking-[-.01em]">{c.name}</div>
            <p className="mt-1 text-[14px] text-muted-2">{c.q}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {LEVELS.map((l) => {
                const on = answers[c.key] === l.value;
                return (
                  <button
                    key={l.value}
                    onClick={() => setAnswers((a) => ({ ...a, [c.key]: l.value }))}
                    className={`rounded-xl border px-2 py-3 text-center transition-colors ${on ? "border-indigo bg-indigo/[.16]" : "border-white/[.12] bg-white/[.02] hover:border-white/25"}`}
                  >
                    <div className={`text-[13.5px] font-semibold ${on ? "text-foreground" : "text-[#c4cad4]"}`}>{l.label}</div>
                    <div className="mt-0.5 text-[11px] text-muted-3">{l.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={!complete}
        onClick={() => setSubmitted(true)}
        className="mt-7 w-full rounded-full bg-indigo px-6 py-4 text-[15.5px] font-semibold text-white shadow-[0_8px_30px_rgba(94,91,255,.35)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {complete ? "See my Essential Eight score →" : `Answer all ${CONTROLS.length} to see your score`}
      </button>
    </div>
  );
}
