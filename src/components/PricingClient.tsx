"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PLAN_CATEGORIES, type Plan } from "@/lib/data";

type Term = "annual" | "monthly";
type Gst = "ex" | "inc";

function priceNum(p?: string) {
  if (!p) return null;
  const n = parseFloat(p.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function fmt(n: number) {
  return n.toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function display(base: number, gst: Gst) {
  return gst === "inc" ? base * 1.1 : base;
}

function PlanCta({ plan }: { plan: Plan }) {
  const cls = `mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${
    plan.highlight
      ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-ink-950 hover:scale-[1.02]"
      : "border border-white/15 bg-white/5 text-foreground hover:bg-white/10"
  }`;
  const external = plan.ctaHref.startsWith("http");
  return external ? (
    <a href={plan.ctaHref} target="_blank" rel="noopener noreferrer" className={cls}>
      {plan.ctaLabel} →
    </a>
  ) : (
    <Link href={plan.ctaHref} className={cls}>
      {plan.ctaLabel} →
    </Link>
  );
}

export default function PricingClient({ plans }: { plans: Plan[] }) {
  const [term, setTerm] = useState<Term>("annual");
  const [gst, setGst] = useState<Gst>("ex");

  const categories = PLAN_CATEGORIES.filter((c) =>
    plans.some((p) => p.category === c),
  );

  // Plans usable in the calculator (per-user priced)
  const pricedPlans = useMemo(
    () => plans.filter((p) => priceNum(p.priceAnnual) !== null),
    [plans],
  );
  const [calcPlan, setCalcPlan] = useState(pricedPlans[0]?.name ?? "");
  const [users, setUsers] = useState(5);

  const selected = pricedPlans.find((p) => p.name === calcPlan);
  const perUser =
    selected &&
    display(
      priceNum(term === "annual" ? selected.priceAnnual : selected.priceMonthly) ??
        priceNum(selected.priceAnnual) ??
        0,
      gst,
    );
  const monthlyTotal = perUser ? perUser * users : 0;

  return (
    <>
      {/* Toggles */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm font-semibold">
          {(["ex", "inc"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGst(g)}
              className={`rounded-full px-5 py-2 transition-colors ${
                gst === g
                  ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-ink-950"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {g === "ex" ? "ex-GST" : "inc-GST"}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        Prices in AUD.{" "}
        {term === "annual"
          ? "Annual plans billed yearly."
          : "Monthly (flexible) — indicative, confirmed at checkout."}
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
                const base = priceNum(
                  term === "annual" ? plan.priceAnnual : plan.priceMonthly,
                );
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
                      {base !== null ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-gradient">
                            ${fmt(display(base, gst))}
                          </span>
                          {plan.unit && (
                            <span className="text-sm text-muted"> {plan.unit}</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-2xl font-extrabold text-gradient">
                          Custom
                        </div>
                      )}
                      <p className="mt-1 text-xs text-muted">
                        {gst === "inc" ? "incl. GST" : "+ GST"}
                      </p>
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

      {/* Quote calculator */}
      {pricedPlans.length > 0 && (
        <section className="mt-20 rounded-3xl glass p-8 sm:p-10">
          <h2 className="text-2xl font-bold">Estimate your monthly cost</h2>
          <p className="mt-2 text-sm text-muted">
            Pick a plan and the number of users for an instant estimate.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Plan</span>
              <select
                value={calcPlan}
                onChange={(e) => setCalcPlan(e.target.value)}
                className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60"
              >
                {pricedPlans.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.category} — {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Users</span>
              <input
                type="number"
                min={1}
                value={users}
                onChange={(e) => setUsers(Math.max(1, Number(e.target.value)))}
                className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm outline-none focus:border-cyan-glow/60"
              />
            </label>
            <div className="rounded-2xl bg-white/5 px-6 py-4 text-center">
              <div className="text-3xl font-extrabold text-gradient">
                ${fmt(monthlyTotal)}
              </div>
              <div className="text-xs text-muted">
                per month ({gst === "inc" ? "incl." : "+"} GST) · ${fmt(monthlyTotal * 12)}/yr
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
