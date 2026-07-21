import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PageHeader from "@/components/PageHeader";
import StatCounter from "@/components/StatCounter";
import { getStats } from "@/lib/content";
import { values } from "@/lib/it-data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "SyberInfo is a Melbourne-based managed IT provider keeping Australian businesses online with proactive support, cloud and cybersecurity.",
};

export const dynamic = "force-dynamic";

const timeline = [
  { year: "2015", text: "Founded in Melbourne to fix reactive, break-fix IT support." },
  { year: "2019", text: "Launched our 24/7 monitoring and security operations desk." },
  { year: "2022", text: "Aligned every client to the ACSC Essential Eight framework." },
  { year: "2026", text: "120+ endpoints under active management across Australia." },
];

export default async function AboutPage() {
  const stats = await getStats();
  return (
    <>
      <PageHeader
        tag="WHO WE ARE"
        title={
          <>
            A small team that treats your stack like <span className="text-indigo">our own</span>.
          </>
        }
        subtitle="Founded in Melbourne in 2015, SyberInfo grew out of a simple frustration: IT support that only shows up when something's already broken. We flipped the model."
      />

      <section className="relative z-[1] mx-auto max-w-[1000px] px-5 py-8 sm:px-10">
        <Reveal className="space-y-5 text-lg leading-[1.7] text-muted">
          <p>
            We built SyberInfo around proactive monitoring, plain-English advice,
            and engineers who actually pick up the phone. No jargon walls, no
            finger-pointing — just calm, reliable IT that stays out of your way.
          </p>
          <p>
            Today we look after the infrastructure for clinics, agencies, and
            fast-moving startups across Australia — quietly, and without drama.
            Our data stays in {site.dataLocation}, and our helpdesk is staffed by
            real people in {site.location}.
          </p>
        </Reveal>
      </section>

      {/* Stats */}
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 py-8 sm:px-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card px-5 py-7 text-center">
              <StatCounter value={s.value} />
              <div className="mt-1.5 text-[13px] text-muted-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 py-8 sm:px-10">
        <h2 className="mb-8 font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-.02em]">
          What we stand for
        </h2>
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <Reveal key={v.t} className="h-full">
              <div className="card h-full px-6 py-7">
                <div className="mb-3 font-display text-[30px] font-bold tracking-[-.02em] text-indigo">
                  {v.k}
                </div>
                <h3 className="mb-1.5 font-display text-[17px] font-semibold">{v.t}</h3>
                <p className="text-[13.5px] leading-[1.5] text-muted-2">{v.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="relative z-[1] mx-auto max-w-[1000px] px-5 py-8 sm:px-10">
        <h2 className="mb-8 font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-.02em]">
          The story so far
        </h2>
        <div className="flex flex-col gap-4">
          {timeline.map((t) => (
            <div key={t.year} className="flex gap-6">
              <div className="w-16 flex-none font-display text-[22px] font-bold tracking-[-.02em] text-lime">
                {t.year}
              </div>
              <p className="flex-1 border-l border-white/[.08] pb-2 pl-6 text-[15px] leading-relaxed text-muted">
                {t.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 py-16 text-center sm:px-10">
        <Link
          href="/book"
          className="inline-flex rounded-full bg-indigo px-7 py-3.5 text-[15px] font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          Book a free audit →
        </Link>
      </section>
    </>
  );
}
