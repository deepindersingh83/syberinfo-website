import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import JsonLd, { faqJsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { getService, getServices } from "@/lib/content";
import { site, ogImage } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.title,
    description: service.overview || service.description,
    alternates: { canonical: `${site.url}/services/${service.slug}` },
    openGraph: {
      title: `${service.title} · SyberInfo`,
      description: service.overview || service.description,
      images: [{ url: ogImage(service.title, "Services"), width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [ogImage(service.title, "Services")] },
  };
}

export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params;
  const [service, all] = await Promise.all([getService(slug), getServices()]);
  if (!service) notFound();

  const accent = service.accentHex || "#5e5bff";
  const tint = service.tintHex || "rgba(94,91,255,.14)";
  const related = all.filter((s) => s.slug !== service.slug).slice(0, 3);

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.overview || service.description,
    serviceType: service.title,
    provider: { "@type": "Organization", name: site.name, url: site.url },
    areaServed: "AU",
    url: `${site.url}/services/${service.slug}`,
  };

  return (
    <div className="relative z-[1]">
      <JsonLd data={serviceLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: site.url },
          { name: "Services", url: `${site.url}/services` },
          { name: service.title, url: `${site.url}/services/${service.slug}` },
        ])}
      />
      {service.faqs.length > 0 && <JsonLd data={faqJsonLd(service.faqs)} />}

      {/* Hero */}
      <section className="relative mx-auto max-w-[1240px] px-5 pb-8 pt-[150px] sm:px-10">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000,transparent_75%)]" />
        <div>
          <Link href="/services" className="text-sm text-muted transition-colors hover:text-foreground">
            ← All services
          </Link>
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl font-mono text-2xl font-medium"
              style={{ background: tint, color: accent }}
            >
              {service.icon}
            </div>
            <div>
              <div className="font-mono text-[13px] tracking-[.05em]" style={{ color: accent }}>
                {service.tagline}
              </div>
              <h1 className="mt-3 max-w-[18ch] font-display text-[clamp(34px,5vw,56px)] font-bold leading-[1.03] tracking-[-.03em]">
                {service.title}
              </h1>
              <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-muted">
                {service.lead || service.overview || service.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/book"
                  className="rounded-full bg-indigo px-6 py-3.5 text-[15px] font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Book a free audit →
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-white/[.16] px-6 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:bg-white/[.06]"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      {service.metrics && service.metrics.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-5 py-8 sm:px-10">
          <div className="grid grid-cols-3 gap-4">
            {service.metrics.map((m) => (
              <div key={m.v} className="card px-6 py-6 text-center">
                <div className="font-display text-[clamp(24px,3vw,38px)] font-bold tracking-[-.02em]" style={{ color: accent }}>
                  {m.k}
                </div>
                <div className="mt-1 text-[13px] text-muted-2">{m.v}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key features */}
      {service.keyFeatures && service.keyFeatures.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-5 py-8 sm:px-10">
          <div className="grid gap-[18px] sm:grid-cols-2">
            {service.keyFeatures.map((f, i) => (
              <Reveal key={f.title} delay={i * 50}>
                <div className="card h-full px-7 py-6">
                  <h3 className="mb-1.5 font-display text-lg font-semibold tracking-[-.01em]">
                    {f.title}
                  </h3>
                  <p className="text-[14.5px] leading-relaxed text-muted-2">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Detailed sections */}
      {service.sections.length > 0 && (
        <section className="mx-auto max-w-[900px] px-5 py-8 sm:px-10">
          <div className="grid gap-4">
            {service.sections.map((sec) => (
              <Reveal key={sec.heading}>
                <div className="card px-8 py-8">
                  <h2 className="font-display text-xl font-bold tracking-[-.01em] sm:text-2xl">
                    {sec.heading}
                  </h2>
                  <p className="mt-3 leading-relaxed text-muted">{sec.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* FAQs */}
      {service.faqs.length > 0 && (
        <section className="mx-auto max-w-[820px] px-5 py-8 sm:px-10">
          <h2 className="text-center font-display text-2xl font-bold tracking-[-.02em] sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-8 space-y-3">
            {service.faqs.map((f) => (
              <details key={f.question} className="card group px-6 py-5 [&_summary]:cursor-pointer">
                <summary className="flex items-center justify-between gap-4 font-display font-semibold marker:content-['']">
                  {f.question}
                  <span className="text-lime transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-5 py-12 sm:px-10">
          <h2 className="mb-6 font-display text-2xl font-bold tracking-[-.02em]">
            Explore more services
          </h2>
          <div className="grid gap-[18px] md:grid-cols-3">
            {related.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="card group px-6 py-6 transition-transform hover:-translate-y-1"
              >
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl font-mono font-medium"
                  style={{ background: s.tintHex, color: s.accentHex }}
                >
                  {s.icon}
                </div>
                <h3 className="mt-4 font-display font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-2">{s.tagline}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-foreground/80 transition-transform group-hover:translate-x-1">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-10">
        <div className="rounded-[28px] border border-white/[.08] bg-white/[.02] p-10 text-center sm:p-14">
          <h2 className="font-display text-2xl font-bold tracking-[-.02em] sm:text-3xl">
            Ready to sort out {service.title.toLowerCase()}?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Book a free 30-minute audit and we&rsquo;ll show you exactly what we&rsquo;d do — no obligation.
          </p>
          <div className="mt-7">
            <Link
              href="/book"
              className="inline-flex rounded-full bg-indigo px-7 py-3.5 text-[15px] font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Book a free audit →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
