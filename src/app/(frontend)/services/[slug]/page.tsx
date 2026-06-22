import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { Aurora, Eyebrow, ButtonLink } from "@/components/ui";
import JsonLd, { faqJsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { getService, getServices } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.title,
    description: service.overview || service.description,
    openGraph: {
      title: `${service.title} · SyberInfo`,
      description: service.overview || service.description,
    },
  };
}

export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params;
  const [service, all] = await Promise.all([getService(slug), getServices()]);
  if (!service) notFound();

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
    <div className="relative pt-32 pb-12">
      <Aurora />
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
      <section className="mx-auto max-w-5xl px-5">
        <Reveal>
          <Link
            href="/services"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            ← All services
          </Link>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <div
              className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${service.accent} font-mono text-2xl font-bold text-ink-950`}
            >
              {service.icon}
            </div>
            <div>
              <Eyebrow>{service.tagline}</Eyebrow>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                {service.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
                {service.overview || service.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/contact">
                  Enquire about {service.title} →
                </ButtonLink>
                <ButtonLink href="/services" variant="ghost">
                  View all services
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Detailed sections */}
      {service.sections.length > 0 && (
        <section className="mx-auto mt-20 max-w-5xl px-5">
          <div className="grid gap-6">
            {service.sections.map((sec, i) => (
              <Reveal key={sec.heading} delay={i * 60}>
                <div className="rounded-3xl glass p-7 sm:p-9">
                  <h2 className="text-xl font-bold sm:text-2xl">{sec.heading}</h2>
                  <p className="mt-3 leading-relaxed text-muted">{sec.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Benefits + What's included */}
      <section className="mx-auto mt-16 max-w-5xl px-5">
        <div className="grid gap-6 md:grid-cols-2">
          {service.benefits.length > 0 && (
            <Reveal>
              <div className="h-full rounded-3xl glass p-7">
                <h3 className="text-lg font-bold">Why choose us</h3>
                <ul className="mt-4 space-y-3">
                  {service.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 text-cyan-glow">✓</span>
                      <span className="text-foreground/90">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
          {service.features.length > 0 && (
            <Reveal delay={80}>
              <div className="h-full rounded-3xl glass p-7">
                <h3 className="text-lg font-bold">What&apos;s included</h3>
                <ul className="mt-4 grid gap-3">
                  {service.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                    >
                      <span className="text-cyan-glow">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Pricing table */}
      {service.pricing && service.pricing.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl px-5">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            {service.title} packages
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {service.pricing.map((plan) => {
              const external = (plan.ctaHref ?? "/contact").startsWith("http");
              const ctaCls = `mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                plan.highlight
                  ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-ink-950 hover:scale-[1.02]"
                  : "border border-white/15 bg-white/5 text-foreground hover:bg-white/10"
              }`;
              return (
                <div
                  key={plan.name}
                  className={`relative flex h-full flex-col rounded-3xl p-7 ${
                    plan.highlight
                      ? "border border-cyan-glow/40 bg-gradient-to-b from-cyan-glow/10 to-transparent"
                      : "glass"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute right-5 top-5 rounded-full bg-cyan-glow px-3 py-1 text-xs font-bold text-ink-950">
                      Popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <div className="mt-3">
                    {plan.price ? (
                      <span className="text-2xl font-extrabold text-gradient">
                        {plan.price}
                      </span>
                    ) : (
                      <span className="text-2xl font-extrabold text-gradient">
                        Custom
                      </span>
                    )}
                    {plan.unit && (
                      <span className="ml-1 text-sm text-muted">{plan.unit}</span>
                    )}
                  </div>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                        <span className="mt-0.5 text-cyan-glow">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {external ? (
                    <a href={plan.ctaHref} target="_blank" rel="noopener noreferrer" className={ctaCls}>
                      {plan.ctaLabel ?? "Get a quote"} →
                    </a>
                  ) : (
                    <Link href={plan.ctaHref ?? "/contact"} className={ctaCls}>
                      {plan.ctaLabel ?? "Get a quote"} →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* FAQs */}
      {service.faqs.length > 0 && (
        <section className="mx-auto mt-16 max-w-3xl px-5">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-8 space-y-3">
            {service.faqs.map((f) => (
              <details
                key={f.question}
                className="group rounded-2xl glass p-5 [&_summary]:cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 font-semibold marker:content-['']">
                  {f.question}
                  <span className="text-cyan-glow transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related services */}
      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-7xl px-5">
          <h2 className="text-2xl font-bold">Explore more services</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group rounded-3xl glass p-6 transition-all hover:-translate-y-1 hover:border-white/20"
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${s.accent} font-mono font-bold text-ink-950`}
                >
                  {s.icon}
                </div>
                <h3 className="mt-4 font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.tagline}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-foreground/80 transition-transform group-hover:translate-x-1">
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto mt-20 max-w-5xl px-5">
        <div className="rounded-[2rem] border border-white/10 bg-ink-800/60 p-10 text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Ready to get started with{" "}
            <span className="text-gradient">{service.title}</span>?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Tell us about your project and we&apos;ll reply within one business
            day with ideas and a free quote.
          </p>
          <div className="mt-7">
            <ButtonLink href="/contact">Get your free quote →</ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
