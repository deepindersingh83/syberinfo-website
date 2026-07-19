import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { statusServices, incidents } from "@/lib/it-data";

export const metadata: Metadata = {
  title: "System status",
  description:
    "Live operational status and uptime for SyberInfo-managed services — Microsoft 365, Azure, VoIP, backups, monitoring and helpdesk.",
};

const BAR_DAYS = 60;
const DEGRADED = new Set([12, 37]);

export default function StatusPage() {
  const bars = Array.from({ length: BAR_DAYS }, (_, i) => {
    const deg = DEGRADED.has(i);
    const ago = BAR_DAYS - 1 - i;
    return {
      deg,
      title: `${ago}d ago · ${deg ? "degraded" : "operational"}`,
    };
  });

  return (
    <>
      <PageHeader
        tag="SYSTEM STATUS"
        title={
          <>
            All systems <span className="text-lime">operational</span>.
          </>
        }
        subtitle="A live view of the platforms we manage on your behalf. We monitor these 24/7 and post any incidents here."
      />

      {/* Services */}
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 py-8 sm:px-10">
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {statusServices.map((s) => (
            <div key={s.name} className="card flex items-center gap-4 px-6 py-5">
              <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-indigo/[.12] font-mono text-sm font-medium text-indigo">
                {s.glyph}
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-semibold">{s.name}</div>
                <div className="mt-0.5 text-[12.5px] text-muted-3">{s.uptime} uptime · 90d</div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#3B9E6B]/30 bg-[#3B9E6B]/10 px-3 py-1.5 text-[12px] font-medium text-[#5fce93]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3B9E6B]" />
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Uptime bar */}
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 py-8 sm:px-10">
        <div className="card px-7 py-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-[-.01em]">
              Overall uptime — last 60 days
            </h2>
            <span className="font-mono text-[12.5px] text-muted-3">99.98%</span>
          </div>
          <div className="flex gap-[3px]">
            {bars.map((b, i) => (
              <div
                key={i}
                title={b.title}
                className="h-9 flex-1 rounded-[2px] transition-opacity hover:opacity-60"
                style={{ background: b.deg ? "#E0B341" : "#3B9E6B" }}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between font-mono text-[11px] text-faint">
            <span>60 days ago</span>
            <span>today</span>
          </div>
        </div>
      </section>

      {/* Incidents */}
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-16 pt-8 sm:px-10">
        <h2 className="mb-6 font-display text-[clamp(22px,3vw,32px)] font-bold tracking-[-.02em]">
          Recent incidents
        </h2>
        <div className="flex flex-col gap-3">
          {incidents.map((inc) => (
            <div key={inc.title} className="card px-7 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-[17px] font-semibold tracking-[-.01em]">
                  {inc.title}
                </h3>
                <span className="font-mono text-[12px] text-muted-3">
                  {inc.date} · resolved in {inc.duration}
                </span>
              </div>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted-2">{inc.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
