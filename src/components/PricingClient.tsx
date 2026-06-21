"use client";

import Link from "next/link";
import { useState } from "react";
import { PLAN_CATEGORIES, type Plan } from "@/lib/data";

function PlanCta({ plan }: { plan: Plan }) {
  const cls = `mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${
    plan.highlight
      ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-ink-950 hover:scale-[1.02]"
      : "border border-white/15 bg-white/5 text-foreground hover:bg-white/10"
  }`;
  const external = plan.ctaHref.startsWith("http");
  if (external) {
    return (
      <a href={plan.ctaHref} target="_blank" rel="noopener noreferrer" className={cls}>
        {plan.ctaLabel} →
      </a>
    );
  }
  return (
    <Link href={plan.ctaHref} className={cls}>
      {plan.ctaLabel} →
    </Link>
  );
}

export default function PricingClient({ plans }: { plans: Plan[] }) {
  const [term, setTerm] = useState<"annual" | "monthly">("annual");

  const categories = PLAN_CATEGORIES.filter((c) =>
    plans.some((p) => p.category === c),
  );

  return (
    <>
      {/* Annual / monthly toggle */}
      <div className="mt-10 flex justify-center">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold">
          {(["annual", "monthly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTerm(t)}
              className={`rounded-full px-5 py-2 transition-colors ${
                term === t
                  ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-ink-950"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t === "annual" ? "Annual" : "Monthly"}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        Prices in AUD, ex‑GST.{" "}
        {term === "annual"
          ? "Annual plans are billed yearly."
          : "Monthly (flexible) — no lock‑in; indicative, confirmed at checkout."}
      </p>

      {categories.map((category) => {
        const items = plans
          .filter((p) => p.category === category)
          .sort((a, b) => a.order - b.order);
        return (
          <section key={category} className="mt-16">
            <h2 className="text-2xl font-bold sm:text-3xl">{category}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {items.map((plan) => {
                const price =
                  term === "annual" ? plan.priceAnnual : plan.priceMonthly;
                return (
                  <div
                    key={plan.name}
                    className={`relative flex h-full flex-col rounded-3xl p-7 transition-all ${
                      plan.highlight
                        ? "border border-cyan-glow/40 bg-gradient-to-b from-cyan-glow/10 to-transparent"
                        : "glass"
                    }`}
                  >
                    {plan.highlight && (
                      <span className="absolute right-5 top-5 rounded-full bg-cyan-glow px-3 py-1 text-xs font-bold text-ink-950">
                        Popular
                      </span>
                    )}
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    {plan.blurb && (
                      <p className="mt-1 text-sm text-muted">{plan.blurb}</p>
                    )}

                    <div className="mt-5">
                      {price ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-gradient">
                            ${price}
                          </span>
                          {plan.unit && (
                            <span className="text-sm text-muted">
                              {" "}
                              {plan.unit}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-2xl font-extrabold text-gradient">
                          Custom
                        </div>
                      )}
                    </div>

                    <ul className="mt-5 flex-1 space-y-2.5">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-foreground/90"
                        >
                          <span className="mt-0.5 text-cyan-glow">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <PlanCta plan={plan} />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
