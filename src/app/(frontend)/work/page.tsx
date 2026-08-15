import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PageHeader from "@/components/PageHeader";
import { getCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Case studies",
  description:
    "Real outcomes for Australian teams — cloud migrations, security uplifts and fully outsourced IT by SyberInfo.",
};

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const caseStudies = await getCaseStudies();
  return (
    <>
      <PageHeader
        tag="CASE STUDIES"
        title={
          <>
            Outcomes we&rsquo;ve shipped for <span className="text-indigo">real teams</span>.
          </>
        }
        subtitle="A few of the businesses we&rsquo;ve quietly kept online — and what changed once we took over."
      />

      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-24 pt-8 sm:px-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((c) => (
            <Reveal key={c.slug} className="h-full">
              <Link
                href={`/work/${c.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-white/[.08] bg-white/[.02] transition-colors hover:border-indigo/50"
              >
                <div
                  className="grid h-[180px] place-items-center text-6xl font-bold text-white/90"
                  style={{ background: c.gradient }}
                >
                  {c.mark}
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/[.12] px-[11px] py-[5px] font-mono text-[11.5px] text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 className="mb-3 font-display text-[21px] font-bold leading-[1.12] tracking-[-.02em]">
                    {c.title}
                  </h2>
                  <p className="flex-1 text-[14.5px] leading-relaxed text-muted-2">{c.summary}</p>
                  <span className="mt-5 inline-block text-sm font-semibold text-lime transition-transform group-hover:translate-x-1">
                    Read the case study →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
