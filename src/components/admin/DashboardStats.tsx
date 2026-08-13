import { getPayload } from "payload";
import config from "@payload-config";
import { computeRevenueMetrics } from "@/lib/analytics";

/**
 * Ops + revenue KPIs at the top of the Payload admin dashboard. Server
 * component — reads live counts and computes MRR/ARR/ARPU/churn on each load.
 */
export default async function DashboardStats() {
  let tiles: { label: string; value: string; sub?: string; accent?: boolean; warn?: boolean }[] = [];
  let byService: { name: string; mrr: number }[] = [];
  try {
    const payload = await getPayload({ config });
    const [subs, unpaid, overdue, openTickets, slaBreached, leads, metrics] = await Promise.all([
      payload.count({ collection: "subscriptions", where: { status: { equals: "active" } } }),
      payload.count({ collection: "invoices", where: { status: { equals: "unpaid" } } }),
      payload.count({ collection: "invoices", where: { status: { equals: "overdue" } } }),
      payload.count({ collection: "tickets", where: { status: { not_equals: "closed" } } }),
      payload.count({
        collection: "tickets",
        where: {
          and: [
            { status: { not_equals: "closed" } },
            { firstRespondedAt: { equals: null } },
            { slaDueAt: { less_than: new Date().toISOString() } },
          ],
        },
      }),
      payload.count({ collection: "leads" }),
      computeRevenueMetrics(payload),
    ]);
    const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
    byService = metrics.byService;
    tiles = [
      { label: "MRR", value: aud.format(metrics.mrr), sub: `${aud.format(metrics.arr)} ARR`, accent: true },
      { label: "ARPU", value: aud.format(metrics.arpu), sub: `${metrics.payingCustomers} paying customers` },
      { label: "Collected (30d)", value: aud.format(metrics.collected30d) },
      {
        label: "Churn (30d)",
        value: `${(metrics.churnRate * 100).toFixed(1)}%`,
        sub: `${metrics.churned30d} cancelled`,
        warn: metrics.churnRate > 0.05,
      },
      { label: "Active subscriptions", value: String(subs.totalDocs) },
      {
        label: "Overdue invoices",
        value: String(overdue.totalDocs),
        sub: `${unpaid.totalDocs} unpaid`,
        warn: overdue.totalDocs > 0,
      },
      { label: "Open tickets", value: String(openTickets.totalDocs) },
      {
        label: "SLA breached",
        value: String(slaBreached.totalDocs),
        sub: "awaiting first response",
        warn: slaBreached.totalDocs > 0,
      },
      { label: "Total leads", value: String(leads.totalDocs) },
    ];
  } catch {
    return null;
  }

  const audFull = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

  return (
    <div style={{ margin: "0 0 1.5rem" }}>
      <h2
        style={{
          fontFamily: "var(--font-serif, inherit)",
          fontSize: "1.1rem",
          fontWeight: 700,
          letterSpacing: "-0.01em",
          margin: "0 0 0.75rem",
          color: "var(--theme-text)",
        }}
      >
        SyberInfo — at a glance
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "12px",
        }}
      >
        {tiles.map((t) => (
          <div
            key={t.label}
            style={{
              border: "1px solid var(--theme-elevation-100)",
              background: "var(--theme-elevation-50)",
              borderRadius: "10px",
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif, inherit)",
                fontSize: "1.7rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: t.warn ? "#d4483b" : t.accent ? "#5e5bff" : "var(--theme-text)",
              }}
            >
              {t.value}
            </div>
            <div style={{ marginTop: 4, fontSize: "0.8rem", color: "var(--theme-elevation-600)" }}>{t.label}</div>
            {t.sub ? (
              <div style={{ marginTop: 2, fontSize: "0.72rem", color: "var(--theme-elevation-400)" }}>{t.sub}</div>
            ) : null}
          </div>
        ))}
      </div>

      {byService.length ? (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 600, margin: "0 0 0.5rem", color: "var(--theme-elevation-700)" }}>
            Recurring revenue by service
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {byService.map((s) => {
              const max = byService[0].mrr || 1;
              return (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.8rem" }}>
                  <div style={{ width: 160, color: "var(--theme-elevation-700)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {s.name}
                  </div>
                  <div style={{ flex: 1, background: "var(--theme-elevation-100)", borderRadius: 5, height: 10 }}>
                    <div style={{ width: `${Math.max(4, (s.mrr / max) * 100)}%`, height: 10, borderRadius: 5, background: "#5e5bff" }} />
                  </div>
                  <div style={{ width: 90, textAlign: "right", color: "var(--theme-text)", fontVariantNumeric: "tabular-nums" }}>
                    {audFull.format(s.mrr)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
