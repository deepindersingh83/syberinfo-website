import Link from "next/link";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import FaqAccordion from "@/components/FaqAccordion";
import LeadForm from "@/components/LeadForm";
import JsonLd, { faqJsonLd } from "@/components/JsonLd";
import { getServices, getStats } from "@/lib/content";
import {
  testimonials,
  planTiers,
  homeFaqs,
  marquee,
  clientLogos,
  values,
  caseStudies,
  contactMethods,
} from "@/lib/it-data";

export const dynamic = "force-dynamic";

const SectionTag = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-3.5 font-mono text-[13px] tracking-[.05em] text-indigo">{children}</div>
);

export default async function Home() {
  const [services, stats] = await Promise.all([getServices(), getStats()]);
  const loopLogos = [...clientLogos, ...clientLogos];
  const loopMarquee = [...marquee, ...marquee];

  return (
    <>
      <JsonLd data={faqJsonLd(homeFaqs)} />
      {/* ============ HERO ============ */}
      <header
        id="top"
        className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-[90px] pt-[180px] sm:px-10"
      >
        <div className="grid-bg animate-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,#000,transparent_75%)]" />
        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/[.12] bg-white/[.03] px-[15px] py-[7px] font-mono text-[12.5px] tracking-[.02em] text-lime">
          <span className="h-[7px] w-[7px] rounded-full bg-lime shadow-[0_0_10px_#c9f25e]" />
          Now onboarding new clients · 2026
        </div>
        <h1 className="max-w-[15ch] font-display text-[clamp(44px,7vw,92px)] font-bold leading-[.98] tracking-[-.035em]">
          IT that quietly <span className="text-indigo">runs</span> while you{" "}
          <span className="relative whitespace-nowrap">
            build
            <span className="absolute inset-x-0 bottom-1.5 -z-10 h-2.5 rounded-sm bg-lime/[.35]" />
          </span>
          .
        </h1>
        <p className="mt-[30px] max-w-[54ch] text-[clamp(17px,2vw,20px)] leading-[1.55] text-muted">
          Managed IT, cloud, and cybersecurity for growing Australian
          businesses. We handle the infrastructure, the threats, and the 2am
          alerts — so your team never has to think about any of it.
        </p>
        <div className="mt-[42px] flex flex-wrap items-center gap-4">
          <Link
            href="/book"
            className="inline-flex items-center gap-2.5 rounded-full bg-indigo px-7 py-[15px] text-[15.5px] font-semibold text-white shadow-[0_8px_30px_rgba(94,91,255,.4)] transition-transform hover:-translate-y-0.5"
          >
            Get a free IT audit →
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/[.16] px-6 py-[15px] text-[15.5px] font-medium text-foreground transition-colors hover:bg-white/[.06]"
          >
            Explore services
          </Link>
        </div>
      </header>

      {/* ============ STATS / MARQUEE ============ */}
      <section className="relative z-[1] border-y border-white/[.06] bg-white/[.015]">
        <Reveal className="mx-auto grid max-w-[1240px] grid-cols-2 gap-6 px-5 py-11 sm:px-10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <StatCounter value={s.value} />
              <div className="mt-1.5 text-sm leading-[1.4] text-muted-2">{s.label}</div>
            </div>
          ))}
        </Reveal>
        <div className="marquee-mask overflow-hidden border-t border-white/[.06] py-4">
          <div className="animate-marquee flex w-max gap-12 whitespace-nowrap font-mono text-[13px] text-muted-3">
            {loopMarquee.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-12">
                {m}
                <span className="text-indigo">/</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CLIENTS / LOGOS ============ */}
      <section className="relative z-[1] border-b border-white/[.06] py-[54px]">
        <div className="mx-auto mb-8 max-w-[1240px] px-5 text-center sm:px-10">
          <div className="font-mono text-[12.5px] tracking-[.09em] text-muted-3">
            TRUSTED BY TEAMS ACROSS AUSTRALIA
          </div>
        </div>
        <div className="marquee-mask overflow-hidden">
          <div className="animate-marquee flex w-max items-center gap-[60px]">
            {loopLogos.map((lg, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-[11px] whitespace-nowrap font-display text-[25px] font-bold tracking-[-.02em] text-[#4b5261] transition-colors hover:text-foreground"
              >
                <span className="text-[15px] opacity-75">{lg.mark}</span>
                {lg.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section id="services" className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-[70px] pt-[110px] sm:px-10">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionTag>01 — WHAT WE DO</SectionTag>
            <h2 className="max-w-[16ch] font-display text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.02] tracking-[-.03em]">
              A full IT department, without the headcount.
            </h2>
          </div>
          <p className="max-w-[34ch] text-base leading-relaxed text-muted">
            Five core practices, one accountable team. Mix and match, or hand us
            the whole stack.
          </p>
        </Reveal>
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <Reveal key={svc.slug}>
              <Link
                href={`/services/${svc.slug}`}
                className="group relative block h-full overflow-hidden rounded-[18px] border border-white/[.08] bg-[linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01))] px-7 pb-[34px] pt-[30px] transition-all duration-300 hover:-translate-y-1.5 hover:border-white/[.18]"
              >
                <span
                  className="absolute left-0 top-0 h-[3px] w-0 transition-all duration-300 group-hover:w-full"
                  style={{ background: svc.accentHex }}
                />
                <div
                  className="mb-[22px] grid h-[46px] w-[46px] place-items-center rounded-xl font-mono text-lg font-medium"
                  style={{ background: svc.tintHex, color: svc.accentHex }}
                >
                  {svc.icon}
                </div>
                <h3 className="mb-2.5 font-display text-[21px] font-semibold tracking-[-.02em]">
                  {svc.title}
                </h3>
                <p className="text-[14.5px] leading-relaxed text-muted-2">{svc.description}</p>
                <div
                  className="mt-[18px] text-[13.5px] font-semibold"
                  style={{ color: svc.accentHex }}
                >
                  Learn more →
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ PROJECTS ============ */}
      <section id="projects" className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-[70px] pt-20 sm:px-10">
        <Reveal className="mb-12">
          <SectionTag>02 — SELECTED WORK</SectionTag>
          <h2 className="max-w-[18ch] font-display text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.02] tracking-[-.03em]">
            Outcomes we&rsquo;ve shipped for real teams.
          </h2>
        </Reveal>
        <div className="flex flex-col gap-6">
          {caseStudies.map((p) => (
            <Reveal key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className="group grid overflow-hidden rounded-[22px] border border-white/[.08] bg-white/[.02] transition-colors hover:border-indigo/50 md:grid-cols-[1.1fr_1fr]"
              >
                <div className="flex flex-col justify-center px-10 py-[42px]">
                  <div className="mb-[18px] flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/[.12] px-[11px] py-[5px] font-mono text-[11.5px] text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="mb-3.5 font-display text-[clamp(24px,2.6vw,32px)] font-bold leading-[1.08] tracking-[-.025em]">
                    {p.title}
                  </h3>
                  <p className="mb-6 max-w-[42ch] text-[15px] leading-relaxed text-muted-2">
                    {p.summary}
                  </p>
                  <div className="flex gap-8">
                    {p.metrics.slice(0, 2).map((mt) => (
                      <div key={mt.v}>
                        <div className="font-display text-[26px] font-bold tracking-[-.02em] text-lime">
                          {mt.k}
                        </div>
                        <div className="mt-0.5 text-[12.5px] text-muted-3">{mt.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="grid min-h-[240px] place-items-center text-6xl font-bold text-white/90 md:min-h-[300px]"
                  style={{ background: p.gradient }}
                >
                  {p.mark}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-[70px] pt-[90px] sm:px-10">
        <Reveal className="mb-12">
          <SectionTag>03 — CLIENT VOICES</SectionTag>
          <h2 className="max-w-[18ch] font-display text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.02] tracking-[-.03em]">
            Teams that stopped worrying about IT.
          </h2>
        </Reveal>
        <div className="grid gap-[18px] md:grid-cols-3">
          {testimonials.map((t) => (
            <Reveal key={t.name} className="h-full">
              <div className="card flex h-full flex-col px-[30px] py-8">
                <div className="mb-[18px] text-sm tracking-[3px] text-lime">★★★★★</div>
                <p className="flex-1 text-base leading-[1.65] text-[#d5dae3]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-[26px] flex items-center gap-[13px]">
                  <div
                    className="grid h-[42px] w-[42px] place-items-center rounded-full font-display text-[15px] font-bold"
                    style={{ background: t.tintHex, color: t.accentHex }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-[14.5px] font-semibold">{t.name}</div>
                    <div className="text-[13px] text-muted-3">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="relative z-[1] border-t border-white/[.06] bg-white/[.015]">
        <div className="mx-auto grid max-w-[1240px] items-center gap-16 px-5 py-[100px] sm:px-10 md:grid-cols-2">
          <Reveal>
            <SectionTag>04 — WHO WE ARE</SectionTag>
            <h2 className="mb-6 font-display text-[clamp(30px,3.8vw,48px)] font-bold leading-[1.05] tracking-[-.03em]">
              A small team that treats your stack like our own.
            </h2>
            <p className="mb-[18px] text-base leading-[1.7] text-muted">
              Founded in Melbourne, SyberInfo grew out of a simple frustration:
              IT support that only shows up when something&rsquo;s already broken.
              We flipped the model — proactive monitoring, plain-English advice,
              and engineers who actually pick up the phone.
            </p>
            <p className="text-base leading-[1.7] text-muted">
              Today we look after the infrastructure for clinics, agencies, and
              fast-moving startups across Australia — quietly, and without drama.
            </p>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-4">
            {values.map((v) => (
              <div key={v.t} className="rounded-2xl border border-white/[.08] bg-white/[.02] px-6 py-[26px]">
                <div className="mb-2.5 font-display text-[30px] font-bold tracking-[-.02em] text-indigo">
                  {v.k}
                </div>
                <div className="mb-1.5 text-[15px] font-semibold">{v.t}</div>
                <div className="text-[13.5px] leading-[1.5] text-muted-2">{v.d}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="relative z-[1] border-t border-white/[.06] bg-white/[.015]">
        <div className="mx-auto max-w-[1240px] px-5 pb-10 pt-[100px] sm:px-10">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionTag>05 — PLANS</SectionTag>
              <h2 className="max-w-[16ch] font-display text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.02] tracking-[-.03em]">
                Simple, per-seat pricing.
              </h2>
            </div>
            <p className="max-w-[34ch] text-base leading-relaxed text-muted">
              Month-to-month, no lock-in contracts. Scale up or down as your team
              changes.
            </p>
          </Reveal>
          <div className="grid items-stretch gap-[18px] md:grid-cols-3">
            {planTiers.map((pl) => (
              <Reveal key={pl.name} className="h-full">
                <div
                  className={`relative flex h-full flex-col overflow-hidden rounded-[20px] border px-[30px] pb-8 pt-[34px] ${
                    pl.featured
                      ? "border-indigo/50 bg-[linear-gradient(180deg,rgba(94,91,255,.14),rgba(94,91,255,.03))]"
                      : "border-white/[.08] bg-[linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.01))]"
                  }`}
                >
                  {pl.featured && (
                    <div className="absolute right-5 top-5 rounded-full bg-lime px-[11px] py-[5px] font-mono text-[11px] font-semibold tracking-[.03em] text-ink-950">
                      POPULAR
                    </div>
                  )}
                  <div className="mb-2 font-display text-[20px] font-bold tracking-[-.02em]">
                    {pl.name}
                  </div>
                  <p className="mb-6 min-h-[40px] text-[13.5px] leading-[1.5] text-muted-2">
                    {pl.tagline}
                  </p>
                  <div className="mb-[26px] flex items-baseline gap-1.5">
                    <span className="font-display text-[44px] font-bold tracking-[-.03em]">
                      {pl.price}
                    </span>
                    <span className="text-[13.5px] text-muted-3">{pl.unit}</span>
                  </div>
                  <div className="mb-7 flex flex-1 flex-col gap-3">
                    {pl.features.map((ft) => (
                      <div key={ft} className="flex items-start gap-2.5 text-sm leading-[1.45] text-[#c4cad4]">
                        <span
                          className="mt-0.5 flex-shrink-0 text-[13px]"
                          style={{ color: pl.featured ? "#c9f25e" : "#5e5bff" }}
                        >
                          ✔
                        </span>
                        {ft}
                      </div>
                    ))}
                  </div>
                  <Link
                    href={pl.ctaHref}
                    className={`inline-flex items-center justify-center rounded-full px-5 py-3.5 text-[15px] font-semibold transition-transform hover:-translate-y-0.5 ${
                      pl.featured
                        ? "bg-indigo text-white"
                        : "border border-white/[.18] text-foreground"
                    }`}
                  >
                    {pl.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-7 text-center text-[13.5px] text-muted-3">
            All plans include unlimited helpdesk, 24/7 monitoring, and onboarding
            at no extra cost.
          </p>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-20 pt-[100px] sm:px-10">
        <Reveal className="mb-12 text-center">
          <SectionTag>06 — QUESTIONS</SectionTag>
          <h2 className="font-display text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.02] tracking-[-.03em]">
            Answers, before you ask.
          </h2>
        </Reveal>
        <FaqAccordion items={homeFaqs} />
      </section>

      {/* ============ CTA ============ */}
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 py-[110px] sm:px-10">
        <Reveal className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#5E5BFF,#3F3DCC)] px-[clamp(32px,6vw,72px)] py-[clamp(48px,7vw,84px)] text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.18),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(201,242,94,.22),transparent_45%)]" />
          <div className="relative">
            <h2 className="mx-auto mb-5 max-w-[18ch] font-display text-[clamp(32px,5vw,60px)] font-bold leading-[1.02] tracking-[-.03em] text-white">
              Let&rsquo;s get your IT off your plate.
            </h2>
            <p className="mx-auto mb-9 max-w-[48ch] text-[17px] leading-[1.55] text-white/80">
              Book a free 30-minute audit. We&rsquo;ll map your current setup,
              flag the risks, and show you exactly what we&rsquo;d do — no
              obligation.
            </p>
            <div className="flex flex-wrap justify-center gap-3.5">
              <Link
                href="/book"
                className="rounded-full bg-ink-950 px-8 py-4 text-[15.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                Book a free audit
              </Link>
              <a
                href="tel:+61300000000"
                className="rounded-full bg-white/[.16] px-8 py-4 text-[15.5px] font-semibold text-white backdrop-blur-sm"
              >
                Call 1300 000 000
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="relative z-[1] border-t border-white/[.06] bg-white/[.015]">
        <div className="mx-auto grid max-w-[1240px] items-start gap-16 px-5 py-[100px] sm:px-10 md:grid-cols-[1fr_1.05fr]">
          <Reveal>
            <SectionTag>07 — GET STARTED</SectionTag>
            <h2 className="mb-[22px] font-display text-[clamp(30px,3.8vw,48px)] font-bold leading-[1.05] tracking-[-.03em]">
              Tell us what&rsquo;s on your plate.
            </h2>
            <p className="mb-[34px] max-w-[42ch] text-base leading-[1.7] text-muted">
              Send a few details and we&rsquo;ll get back within one business day
              with next steps — or book a free 30-minute audit straight away.
            </p>
            <div className="flex flex-col gap-[18px]">
              {contactMethods.map((cm) => (
                <a key={cm.label} href={cm.href} className="flex items-center gap-3.5 text-inherit">
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-indigo/[.14] text-[18px] text-indigo">
                    {cm.glyph}
                  </span>
                  <span>
                    <span className="block font-mono text-xs tracking-[.03em] text-muted-3">
                      {cm.label}
                    </span>
                    <span className="block text-[15.5px] font-semibold text-foreground">
                      {cm.value}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <LeadForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
