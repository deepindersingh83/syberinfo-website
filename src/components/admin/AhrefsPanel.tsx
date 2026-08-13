import { ahrefsEnabled, getAhrefsSummary } from "@/lib/ahrefs";
import { site } from "@/lib/site";

/**
 * SEO cockpit on the admin dashboard: headline Ahrefs metrics for our own
 * domain. Renders nothing unless AHREFS_API_TOKEN is configured, so it stays
 * out of the way until SEO reporting is switched on.
 */
export default async function AhrefsPanel() {
  if (!ahrefsEnabled()) return null;

  let m: Awaited<ReturnType<typeof getAhrefsSummary>>;
  try {
    m = await getAhrefsSummary();
  } catch {
    return null;
  }

  const nf = new Intl.NumberFormat("en-AU");
  const tiles = [
    { label: "Domain Rating", value: m.domainRating != null ? String(m.domainRating) : "—", accent: true },
    { label: "Organic keywords", value: m.orgKeywords != null ? nf.format(m.orgKeywords) : "—" },
    { label: "Est. organic traffic", value: m.orgTraffic != null ? nf.format(m.orgTraffic) + "/mo" : "—" },
    { label: "Referring domains", value: m.refDomains != null ? nf.format(m.refDomains) : "—" },
    { label: "Backlinks", value: m.backlinks != null ? nf.format(m.backlinks) : "—" },
  ];

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
        SEO — {site.domain} <span style={{ fontSize: "0.75rem", color: "var(--theme-elevation-500)" }}>via Ahrefs</span>
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
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
                color: t.accent ? "#5e5bff" : "var(--theme-text)",
              }}
            >
              {t.value}
            </div>
            <div style={{ marginTop: 4, fontSize: "0.8rem", color: "var(--theme-elevation-600)" }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
