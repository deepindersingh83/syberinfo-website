import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Ops KPIs shown at the top of the Payload admin dashboard: active
 * subscriptions, monthly recurring revenue, unpaid invoices, open tickets and
 * new leads. Server component — reads live counts on each admin load.
 */
export default async function DashboardStats() {
  let tiles: { label: string; value: string; accent?: boolean }[] = [];
  try {
    const payload = await getPayload({ config });
    const [subs, unpaid, openTickets, leads, activeSubs] = await Promise.all([
      payload.count({ collection: "subscriptions", where: { status: { equals: "active" } } }),
      payload.count({ collection: "invoices", where: { status: { in: ["unpaid", "overdue"] } } }),
      payload.count({ collection: "tickets", where: { status: { not_equals: "closed" } } }),
      payload.count({ collection: "leads" }),
      payload.find({ collection: "subscriptions", where: { status: { equals: "active" } }, limit: 1000, depth: 0 }),
    ]);
    const mrr = (activeSubs.docs as { recurringAmount?: number }[]).reduce(
      (s, d) => s + (Number(d.recurringAmount) || 0),
      0,
    );
    const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
    tiles = [
      { label: "Active subscriptions", value: String(subs.totalDocs) },
      { label: "Monthly recurring revenue", value: aud.format(mrr), accent: true },
      { label: "Unpaid invoices", value: String(unpaid.totalDocs), accent: unpaid.totalDocs > 0 },
      { label: "Open tickets", value: String(openTickets.totalDocs) },
      { label: "Total leads", value: String(leads.totalDocs) },
    ];
  } catch {
    return null;
  }

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
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif, inherit)",
                fontSize: "1.9rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: t.accent ? "#5e5bff" : "var(--theme-text)",
              }}
            >
              {t.value}
            </div>
            <div style={{ marginTop: 4, fontSize: "0.8rem", color: "var(--theme-elevation-600)" }}>
              {t.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
