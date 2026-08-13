import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { getSystemStatus, componentLabel, type ComponentStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "System status",
  description:
    "Live operational status and uptime for SyberInfo-managed services — Microsoft 365, Azure, VoIP, backups, monitoring and helpdesk.",
};

const STYLE: Record<ComponentStatus, { dot: string; text: string; border: string; bg: string }> = {
  operational: { dot: "#3B9E6B", text: "#5fce93", border: "rgba(59,158,107,.3)", bg: "rgba(59,158,107,.1)" },
  degraded: { dot: "#E0B341", text: "#e8c877", border: "rgba(224,179,65,.3)", bg: "rgba(224,179,65,.1)" },
  partial: { dot: "#E08841", text: "#eaa877", border: "rgba(224,136,65,.3)", bg: "rgba(224,136,65,.1)" },
  major: { dot: "#D4483B", text: "#e88379", border: "rgba(212,72,59,.3)", bg: "rgba(212,72,59,.1)" },
  maintenance: { dot: "#5E5BFF", text: "#9a98ff", border: "rgba(94,91,255,.3)", bg: "rgba(94,91,255,.1)" },
};

const OVERALL: Record<string, { word: string; className: string }> = {
  operational: { word: "operational", className: "text-lime" },
  degraded: { word: "degraded", className: "text-[#e8c877]" },
  down: { word: "disrupted", className: "text-[#e88379]" },
  maintenance: { word: "under maintenance", className: "text-[#9a98ff]" },
};

function fmt(d: string) {
  if (!d) return "";
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return d; // seed dates are already formatted
  return parsed.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function StatusPage() {
  const { components, incidents, overall } = await getSystemStatus();
  const head = OVERALL[overall] ?? OVERALL.operational;
  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const pastIncidents = incidents.filter((i) => i.status === "resolved");

  return (
    <>
      <PageHeader
        tag="SYSTEM STATUS"
        title={
          <>
            {overall === "operational" ? "All systems " : "Some systems "}
            <span className={head.className}>{head.word}</span>.
          </>
        }
        subtitle="A live view of the platforms we manage on your behalf. We monitor these 24/7 and post any incidents here."
      />

      {/* Active incidents banner */}
      {activeIncidents.length > 0 && (
        <section className="relative z-[1] mx-auto max-w-[1240px] px-5 pt-4 sm:px-10">
          {activeIncidents.map((inc) => {
            const st = STYLE[(inc.severity === "critical" || inc.severity === "major" ? "major" : inc.severity === "maintenance" ? "maintenance" : "degraded") as ComponentStatus];
            return (
              <div key={inc.title} className="card mb-3 px-7 py-5" style={{ borderColor: st.border, background: st.bg }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-[17px] font-semibold tracking-[-.01em]">{inc.title}</h3>
                  <span className="font-mono text-[12px] capitalize" style={{ color: st.text }}>
                    {inc.severity} · {inc.status}
                  </span>
                </div>
                {inc.body && <p className="mt-2 text-[14.5px] leading-relaxed text-muted-2">{inc.body}</p>}
                {inc.updates.length > 1 && (
                  <div className="mt-4 flex flex-col gap-2 border-t border-white/[.06] pt-4">
                    {inc.updates.slice().reverse().map((u, i) => (
                      <div key={i} className="text-[13px] text-muted-3">
                        <span className="font-mono capitalize" style={{ color: st.text }}>{u.status}</span>
                        {u.at ? <span className="text-faint"> · {fmt(u.at)}</span> : null} — {u.body}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Components */}
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 py-8 sm:px-10">
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {components.map((c) => {
            const st = STYLE[c.status] ?? STYLE.operational;
            return (
              <div key={c.name} className="card flex items-center gap-4 px-6 py-5">
                <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-indigo/[.12] font-mono text-sm font-medium text-indigo">
                  {c.glyph}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold">{c.name}</div>
                  {c.description && <div className="mt-0.5 text-[12.5px] text-muted-3">{c.description}</div>}
                </div>
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium"
                  style={{ borderColor: st.border, background: st.bg, color: st.text }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.dot }} />
                  {componentLabel(c.status)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Past incidents */}
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-16 pt-8 sm:px-10">
        <h2 className="mb-6 font-display text-[clamp(22px,3vw,32px)] font-bold tracking-[-.02em]">
          Recent incidents
        </h2>
        {pastIncidents.length === 0 ? (
          <div className="card px-7 py-6 text-[14.5px] text-muted-3">No incidents reported recently. 🎉</div>
        ) : (
          <div className="flex flex-col gap-3">
            {pastIncidents.map((inc) => (
              <div key={inc.title} className="card px-7 py-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-[17px] font-semibold tracking-[-.01em]">{inc.title}</h3>
                  <span className="font-mono text-[12px] text-muted-3">
                    {fmt(inc.startedAt)} · resolved
                  </span>
                </div>
                {inc.body && <p className="mt-2 text-[14.5px] leading-relaxed text-muted-2">{inc.body}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
