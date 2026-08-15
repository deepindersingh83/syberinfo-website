import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PageHeader from "@/components/PageHeader";
import { getServices, getPageHeader } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Managed IT, cloud, cybersecurity, backup & recovery, networks & VoIP and IT strategy for growing Australian businesses.",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [services, ph] = await Promise.all([getServices(), getPageHeader("services")]);
  return (
    <>
      <PageHeader
        tag={ph.eyebrow}
        title={
          ph.heading ? (
            ph.heading
          ) : (
            <>
              A full IT department, <span className="text-indigo">on tap</span>.
            </>
          )
        }
        subtitle={ph.subheading}
      />

      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-24 pt-8 sm:px-10">
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Reveal key={s.slug} className="h-full">
              <Link
                href={`/services/${s.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/[.08] bg-[linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01))] px-7 pb-[34px] pt-[30px] transition-all duration-300 hover:-translate-y-1.5 hover:border-white/[.18]"
              >
                <span
                  className="absolute left-0 top-0 h-[3px] w-0 transition-all duration-300 group-hover:w-full"
                  style={{ background: s.accentHex }}
                />
                <div
                  className="mb-[22px] grid h-[46px] w-[46px] place-items-center rounded-xl font-mono text-lg font-medium"
                  style={{ background: s.tintHex, color: s.accentHex }}
                >
                  {s.icon}
                </div>
                <h2 className="mb-1 font-display text-[21px] font-semibold tracking-[-.02em]">
                  {s.title}
                </h2>
                <p className="mb-3 text-[13.5px] font-medium" style={{ color: s.accentHex }}>
                  {s.tagline}
                </p>
                <p className="flex-1 text-[14.5px] leading-relaxed text-muted-2">
                  {s.description}
                </p>
                <ul className="mt-5 space-y-2">
                  {s.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                      <span className="text-lime">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground/80 transition-transform group-hover:translate-x-1">
                  Learn more →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
