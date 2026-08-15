import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PageHeader from "@/components/PageHeader";
import { getPageHeader } from "@/lib/content";
import { perks, roles } from "@/lib/it-data";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join SyberInfo — a small Melbourne team building calm, proactive managed IT for Australian business. Real balance, real growth.",
};

export default async function CareersPage() {
  const ph = await getPageHeader("careers");
  return (
    <>
      <PageHeader
        tag={ph.eyebrow}
        title={
          ph.heading ? (
            ph.heading
          ) : (
            <>
              Do the best IT work of your life — <span className="text-indigo">without the burnout</span>.
            </>
          )
        }
        subtitle={ph.subheading}
      />

      {/* Perks */}
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 py-8 sm:px-10">
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => (
            <Reveal key={p.t} className="h-full">
              <div className="card h-full px-6 py-7">
                <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-indigo/[.14] text-lg text-indigo">
                  {p.icon}
                </div>
                <div className="mb-1.5 font-display text-[17px] font-semibold">{p.t}</div>
                <div className="text-[13.5px] leading-[1.5] text-muted-2">{p.d}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Open roles */}
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 py-12 sm:px-10">
        <h2 className="mb-6 font-display text-[clamp(24px,3vw,36px)] font-bold tracking-[-.02em]">
          Open roles
        </h2>
        <div className="flex flex-col gap-3">
          {roles.map((r) => (
            <Reveal key={r.title}>
              <div className="card flex flex-wrap items-center justify-between gap-4 px-7 py-6">
                <div>
                  <h3 className="font-display text-[19px] font-semibold tracking-[-.01em]">
                    {r.title}
                  </h3>
                  <p className="mt-1 font-mono text-[12.5px] text-muted-3">{r.meta}</p>
                </div>
                <Link
                  href="/contact"
                  className="rounded-full bg-indigo px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Apply now →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-[14.5px] text-muted">
          Don&rsquo;t see your role?{" "}
          <Link href="/contact" className="text-lime underline underline-offset-2">
            Introduce yourself
          </Link>{" "}
          — we&rsquo;re always keen to meet good people.
        </p>
      </section>
    </>
  );
}
