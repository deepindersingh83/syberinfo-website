"use client";

import Link from "next/link";
import { useState } from "react";

type Step = 0 | 1 | 2 | 3;

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl glass p-7 sm:p-9">{children}</div>;
}

function Option({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-cyan-glow/40 hover:bg-white/10"
    >
      {label}
    </button>
  );
}

export default function FindMyPlan() {
  const [step, setStep] = useState<Step>(0);
  const [need, setNeed] = useState("");
  const [suite, setSuite] = useState("");
  const [size, setSize] = useState("");

  function reset() {
    setStep(0);
    setNeed("");
    setSuite("");
    setSize("");
  }

  const recommend = () => {
    // Simple deterministic recommendation
    if (need === "website") {
      return {
        title: "A website package",
        text: "Start with our Business website package — a fast, CMS-powered site you can grow into.",
        href: "/pricing#Website Packages",
        cta: "See website packages",
      };
    }
    if (need === "marketing") {
      return {
        title: "SEO & Digital Marketing",
        text: "Our SEO and full-funnel marketing get you found and bring in qualified leads.",
        href: "/services/seo",
        cta: "Explore marketing",
      };
    }
    // email/productivity
    const suiteName =
      suite === "microsoft" ? "Microsoft 365" : "Google Workspace";
    const plan =
      size === "large"
        ? suite === "microsoft"
          ? "Business Premium"
          : "Business Plus"
        : size === "medium"
          ? "Business Standard"
          : suite === "microsoft"
            ? "Business Basic"
            : "Business Starter";
    return {
      title: `${suiteName} — ${plan}`,
      text: `Based on your team, ${suiteName} ${plan} is a great fit. We'll set it up and migrate your email for free.`,
      href: "/pricing",
      cta: "View pricing",
    };
  };

  if (step === 0) {
    return (
      <Card>
        <h2 className="text-xl font-bold">What do you need most right now?</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Option label="📧 Business email & productivity" onClick={() => { setNeed("email"); setStep(1); }} />
          <Option label="🌐 A new website" onClick={() => { setNeed("website"); setStep(3); }} />
          <Option label="📈 Get found on Google / more leads" onClick={() => { setNeed("marketing"); setStep(3); }} />
          <Option label="✨ A bit of everything" onClick={() => { setNeed("email"); setStep(1); }} />
        </div>
      </Card>
    );
  }

  if (step === 1) {
    return (
      <Card>
        <h2 className="text-xl font-bold">Which suits your team better?</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Option label="Google (Gmail, Docs, Meet)" onClick={() => { setSuite("google"); setStep(2); }} />
          <Option label="Microsoft (Outlook, Office, Teams)" onClick={() => { setSuite("microsoft"); setStep(2); }} />
          <Option label="Not sure — recommend one" onClick={() => { setSuite("google"); setStep(2); }} />
        </div>
      </Card>
    );
  }

  if (step === 2) {
    return (
      <Card>
        <h2 className="text-xl font-bold">How big is your team?</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Option label="1–3 people" onClick={() => { setSize("small"); setStep(3); }} />
          <Option label="4–15 people" onClick={() => { setSize("medium"); setStep(3); }} />
          <Option label="15+ people" onClick={() => { setSize("large"); setStep(3); }} />
        </div>
      </Card>
    );
  }

  const r = recommend();
  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted">
        Our recommendation
      </span>
      <h2 className="mt-2 text-2xl font-extrabold text-gradient">{r.title}</h2>
      <p className="mt-3 text-muted">{r.text}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={r.href}
          className="rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03]"
        >
          {r.cta} →
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
        >
          Get expert advice
        </Link>
        <button
          onClick={reset}
          className="rounded-full px-4 py-3 text-sm font-semibold text-muted hover:text-foreground"
        >
          ↺ Start over
        </button>
      </div>
    </Card>
  );
}
