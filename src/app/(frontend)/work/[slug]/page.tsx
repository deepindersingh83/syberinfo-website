import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { caseStudies } from "@/lib/it-data";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = caseStudies.find((x) => x.slug === slug);
  if (!c) return { title: "Case study not found" };
  return { title: c.title, description: c.summary };
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const c = caseStudies.find((x) => x.slug === slug);
  if (!c) notFound();

  const more = caseStudies.filter((x) => x.slug !== c.slug);

  return (
    <div className="relative z-[1]">
      <section className="relative mx-auto max-w-[900px] px-5 pb-8 pt-[150px] sm:px-10">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000,transparent_75%)]" />
        <div>
          <Link href="/work" className="text-sm text-muted transition-colors hover:text-foreground">
            ← All case studies
          </Link>
          <div className="mt-6 flex flex-wrap gap-2">
            {c.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/[.12] px-[11px] py-[5px] font-mono text-[11.5px] text-muted"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="mt-5 font-display text-[clamp(30px,4.6vw,52px)] font-bold leading-[1.05] tracking-[-.03em]">
            {c.title}
          </h1>
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted">{c.summary}</p>
        </div>
      </section>

      {/* banner */}
      <section className="mx-auto max-w-[900px] px-5 sm:px-10">
        <div
          className="grid h-[200px] place-items-center rounded-[22px] text-7xl font-bold text-white/90 sm:h-[280px]"
          style={{ background: c.gradient }}
        >
          {c.mark}
        </div>
      </section>

      {/* metrics */}
      <section className="mx-auto max-w-[900px] px-5 py-10 sm:px-10">
        <div className="grid grid-cols-3 gap-4">
          {c.metrics.map((m) => (
            <div key={m.v} className="card px-5 py-6 text-center">
              <div className="font-display text-[clamp(22px,3vw,36px)] font-bold tracking-[-.02em] text-lime">
                {m.k}
              </div>
              <div className="mt-1 text-[12.5px] text-muted-2">{m.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* sections */}
      <section className="mx-auto max-w-[900px] px-5 sm:px-10">
        <div className="flex flex-col gap-8">
          {c.sections.map((s) => (
            <Reveal key={s.head}>
              <div>
                <div className="mb-3 font-mono text-[13px] tracking-[.05em] text-indigo">{s.head}</div>
                <p className="text-[17px] leading-[1.7] text-[#c4cad4]">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* quote */}
      <section className="mx-auto max-w-[900px] px-5 py-12 sm:px-10">
        <div className="card px-8 py-9">
          <p className="font-display text-[clamp(20px,2.4vw,28px)] font-semibold leading-[1.35] tracking-[-.01em]">
            &ldquo;{c.quote}&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3.5">
            <div className="grid h-[46px] w-[46px] place-items-center rounded-full bg-indigo/[.16] font-display text-base font-bold text-indigo">
              {c.authorInitials}
            </div>
            <div>
              <div className="text-[15px] font-semibold">{c.author}</div>
              <div className="text-[13px] text-muted-3">{c.authorRole}</div>
            </div>
          </div>
        </div>
      </section>

      {/* more */}
      <section className="mx-auto max-w-[1240px] px-5 pb-16 sm:px-10">
        <h2 className="mb-6 font-display text-2xl font-bold tracking-[-.02em]">More case studies</h2>
        <div className="grid gap-[18px] md:grid-cols-2">
          {more.map((m) => (
            <Link
              key={m.slug}
              href={`/work/${m.slug}`}
              className="card group flex items-center gap-5 p-5 transition-colors hover:border-indigo/50"
            >
              <div
                className="grid h-16 w-16 flex-none place-items-center rounded-2xl text-2xl font-bold text-white/90"
                style={{ background: m.gradient }}
              >
                {m.mark}
              </div>
              <div>
                <h3 className="font-display font-semibold leading-tight tracking-[-.01em]">{m.title}</h3>
                <span className="mt-1 inline-block text-sm font-semibold text-lime">Read →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
