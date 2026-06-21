import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { Aurora, SectionHeading, ButtonLink } from "@/components/ui";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web development, design & branding, SEO, social media (SMO) and digital marketing services for Australian businesses.",
};

export default function ServicesPage() {
  return (
    <div className="relative pt-36 pb-12">
      <Aurora />
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading
          eyebrow="Services"
          title={
            <>
              Everything you need to{" "}
              <span className="text-gradient">win online</span>
            </>
          }
          subtitle="Pick one service or let us run your entire digital presence end-to-end."
        />

        <div className="mt-16 flex flex-col gap-6">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 60}>
              <section
                id={s.slug}
                className="scroll-mt-28 overflow-hidden rounded-3xl glass p-8 md:p-10"
              >
                <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
                  <div
                    className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${s.accent} font-mono text-2xl font-bold text-ink-950`}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold sm:text-3xl">{s.title}</h2>
                    <p className="mt-1 font-medium text-gradient">{s.tagline}</p>
                    <p className="mt-3 max-w-2xl leading-relaxed text-muted">
                      {s.description}
                    </p>
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {s.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                        >
                          <span className="text-cyan-glow">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-7">
                      <ButtonLink href="/contact">
                        Enquire about {s.title} →
                      </ButtonLink>
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
