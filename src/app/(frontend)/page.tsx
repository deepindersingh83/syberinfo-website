import Link from "next/link";
import Reveal from "@/components/Reveal";
import { Aurora, Eyebrow, SectionHeading, ButtonLink } from "@/components/ui";
import { stats, steps } from "@/lib/data";
import { getServices, getProducts, getTestimonials } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [services, products, testimonials] = await Promise.all([
    getServices(),
    getProducts(),
    getTestimonials(),
  ]);

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative grid-bg overflow-hidden pt-36 pb-24 sm:pt-44">
        <Aurora />
        {/* rotating conic glow behind hero */}
        <div
          aria-hidden
          className="glow-ring absolute left-1/2 top-24 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-30"
        />

        <div className="mx-auto max-w-7xl px-5 text-center">
          <Reveal>
            <Eyebrow>Australian digital agency · Web · Cloud · Growth</Eyebrow>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              We build websites that <span className="text-gradient">grow</span>{" "}
              your business
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Web development, design, SEO, social and digital marketing — plus
              domains, hosting and Google &amp; Microsoft Workspace. Everything
              your business needs to launch and scale online, under one roof.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/contact">Start a project →</ButtonLink>
              <ButtonLink href="/products" variant="ghost">
                Explore products
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="glass rounded-2xl px-4 py-5 text-center"
                >
                  <div className="text-2xl font-bold text-gradient sm:text-3xl">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────── Trust marquee ───────────────────── */}
      <section className="border-y border-white/10 bg-ink-900/40 py-6">
        <div className="relative flex overflow-hidden">
          <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12 text-sm font-medium text-muted">
            {marqueeItems.concat(marqueeItems).map((item, i) => (
              <span key={i} className="flex items-center gap-3 whitespace-nowrap">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow/60" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Services ───────────────────────── */}
      <section id="services" className="relative py-24 sm:py-32">
        <Aurora />
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeading
            eyebrow="What we do"
            title={<>Services that move the needle</>}
            subtitle="From the first line of code to the last conversion, we cover the full digital journey."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={i * 70}>
                <Link
                  href={`/services#${s.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20"
                >
                  <div
                    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${s.accent} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-25`}
                  />
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${s.accent} font-mono text-lg font-bold text-ink-950`}
                  >
                    {s.icon}
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm font-medium text-gradient">
                    {s.tagline}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {s.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground/80 transition-transform group-hover:translate-x-1">
                    Learn more →
                  </span>
                </Link>
              </Reveal>
            ))}

            {/* CTA tile */}
            <Reveal delay={services.length * 70}>
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-glow to-violet-glow p-7 text-ink-950">
                <div>
                  <h3 className="text-2xl font-extrabold leading-tight">
                    Not sure where to start?
                  </h3>
                  <p className="mt-2 text-sm font-medium text-ink-900/80">
                    Get a free strategy call and a tailored plan for your goals.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.03]"
                >
                  Book a free call →
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Products ───────────────────────── */}
      <section id="products" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeading
            eyebrow="Web products"
            title={
              <>
                Domains, hosting &amp; <span className="text-gradient">cloud</span>
              </>
            }
            subtitle="Buy and manage everything through our secure client portal — set up in minutes, backed by 24/7 support."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 ${
                    p.highlight
                      ? "border border-cyan-glow/40 bg-gradient-to-b from-cyan-glow/10 to-transparent"
                      : "glass hover:border-white/20"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute right-5 top-5 rounded-full bg-cyan-glow px-3 py-1 text-xs font-bold text-ink-950">
                      Popular
                    </span>
                  )}
                  <div className="text-3xl">{p.icon}</div>
                  <h3 className="mt-4 text-xl font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {p.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {p.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-2 text-sm text-foreground/80"
                      >
                        <span className="text-cyan-glow">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-sm font-semibold text-gradient">
                      {p.price}
                    </span>
                    <span className="text-sm font-semibold text-foreground/80 transition-transform group-hover:translate-x-1">
                      Order →
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted">
            Reseller of leading domain, hosting &amp; cloud providers. Manage it
            all at{" "}
            <a
              href={site.storeUrl}
              className="font-semibold text-foreground underline decoration-cyan-glow/50 underline-offset-4 hover:decoration-cyan-glow"
            >
              hosting.syberinfo.com.au
            </a>
            .
          </p>
        </div>
      </section>

      {/* ───────────────────────── Process ───────────────────────── */}
      <section id="work" className="relative py-24 sm:py-32">
        <Aurora />
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeading
            eyebrow="How we work"
            title={<>A proven path to launch</>}
            subtitle="A clear, collaborative process — so you always know what's happening and why."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 80}>
                <div className="relative h-full rounded-3xl glass p-7">
                  <span className="font-mono text-5xl font-black text-gradient opacity-90">
                    {step.n}
                  </span>
                  <h3 className="mt-3 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {step.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── Testimonials ───────────────────── */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeading
            eyebrow="Client love"
            title={<>Trusted by growing businesses</>}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <figure className="flex h-full flex-col rounded-3xl glass p-7">
                  <div className="text-2xl text-gradient">“</div>
                  <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-foreground/90">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6 border-t border-white/10 pt-4">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-muted">{t.role}</div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── CTA ───────────────────────── */}
      <section className="relative px-5 pb-12">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-ink-800/60 px-6 py-16 text-center sm:py-20">
          <div className="glow-ring absolute left-1/2 top-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25" />
          <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">
            Let&apos;s build something{" "}
            <span className="text-gradient">brilliant</span> together
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Tell us about your project and we&apos;ll get back within one
            business day with ideas and a quote.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/contact">Get your free quote →</ButtonLink>
            <ButtonLink href={`mailto:${site.email}`} variant="ghost" external>
              {site.email}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

const marqueeItems = [
  "Web Development",
  "UI / UX Design",
  "SEO",
  "Social Media",
  "Digital Marketing",
  "Domains",
  "Web Hosting",
  "Linux Hosting",
  "Google Workspace",
  "Microsoft 365",
];
