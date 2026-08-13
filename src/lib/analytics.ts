import type { Payload } from "payload";

/**
 * Revenue analytics for the admin dashboard. Everything is derived live from
 * the subscriptions / invoices / customers collections — no stored aggregates
 * to drift out of date.
 *
 *  • MRR  — every active subscription's recurring amount normalised to a month.
 *  • ARR  — MRR × 12.
 *  • ARPU — MRR ÷ paying customers.
 *  • Churn (30d) — services cancelled/terminated in the last 30 days over the
 *    base that was active at the start of the window.
 *  • Collected (30d) — GST-inclusive total of invoices marked paid this month.
 *  • Revenue by service — MRR grouped by the label's leading segment
 *    (e.g. "Web Hosting — example.com.au" → "Web Hosting").
 */

const DAY = 24 * 60 * 60 * 1000;

type Sub = { recurringAmount?: number; billingCycle?: string; label?: string; customer?: unknown; status?: string; updatedAt?: string };

/** Normalise a recurring amount to a monthly figure from its billing cycle. */
export function toMonthly(amount: number, cycle: string): number {
  const c = (cycle || "").toLowerCase();
  if (c.includes("year") || c.includes("annual")) return amount / 12;
  if (c.includes("quarter")) return amount / 3;
  if (c.includes("week")) return (amount * 52) / 12;
  if (c.includes("day")) return amount * 30;
  return amount; // monthly / unknown
}

const idOf = (v: unknown): string | number | undefined =>
  v && typeof v === "object" ? (v as { id?: string | number }).id : (v as string | number | undefined);

export type RevenueMetrics = {
  mrr: number;
  arr: number;
  arpu: number;
  payingCustomers: number;
  collected30d: number;
  churnRate: number; // 0..1
  churned30d: number;
  byService: { name: string; mrr: number }[];
};

export async function computeRevenueMetrics(payload: Payload, now = new Date()): Promise<RevenueMetrics> {
  const [activeSubs, churnedSubs, paidInvoices] = await Promise.all([
    payload.find({ collection: "subscriptions", where: { status: { equals: "active" } }, limit: 5000, depth: 0, overrideAccess: true }),
    payload.find({
      collection: "subscriptions",
      where: { status: { in: ["cancelled", "terminated"] }, updatedAt: { greater_than_equal: new Date(now.getTime() - 30 * DAY).toISOString() } },
      limit: 5000,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: "invoices",
      where: { status: { equals: "paid" }, paidDate: { greater_than_equal: new Date(now.getTime() - 30 * DAY).toISOString() } },
      limit: 5000,
      depth: 0,
      overrideAccess: true,
    }),
  ]);

  const subs = activeSubs.docs as unknown as Sub[];
  let mrr = 0;
  const customers = new Set<string>();
  const serviceMap = new Map<string, number>();

  for (const s of subs) {
    const monthly = toMonthly(Number(s.recurringAmount) || 0, String(s.billingCycle || "monthly"));
    mrr += monthly;
    const cid = idOf(s.customer);
    if (cid != null) customers.add(String(cid));
    const name = (s.label || "Other").split(/[—–-]/)[0].trim() || "Other";
    serviceMap.set(name, (serviceMap.get(name) || 0) + monthly);
  }

  const payingCustomers = customers.size;
  const churned30d = churnedSubs.totalDocs;
  const baseAtStart = subs.length + churned30d;
  const churnRate = baseAtStart > 0 ? churned30d / baseAtStart : 0;
  const collected30d = (paidInvoices.docs as { total?: number }[]).reduce((s, d) => s + (Number(d.total) || 0), 0);

  const byService = [...serviceMap.entries()]
    .map(([name, m]) => ({ name, mrr: Math.round(m * 100) / 100 }))
    .sort((a, b) => b.mrr - a.mrr)
    .slice(0, 6);

  return {
    mrr: Math.round(mrr * 100) / 100,
    arr: Math.round(mrr * 12 * 100) / 100,
    arpu: payingCustomers ? Math.round((mrr / payingCustomers) * 100) / 100 : 0,
    payingCustomers,
    collected30d: Math.round(collected30d * 100) / 100,
    churnRate,
    churned30d,
    byService,
  };
}
