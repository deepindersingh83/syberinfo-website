import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { Aurora, SectionHeading } from "@/components/ui";
import { getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web development, design & branding, SEO, social media (SMO) and digital marketing services for Australian businesses.",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await getServices();
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

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 60}>
              <Link
                href={`/services/${s.slug}`}
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
                <h2 className="mt-5 text-xl font-bold">{s.title}</h2>
                <p className="mt-1 text-sm font-medium text-gradient">
                  {s.tagline}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {s.description}
                </p>
                <ul className="mt-5 space-y-2">
                  {s.features.slice(0, 3).map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-foreground/80"
                    >
                      <span className="text-cyan-glow">✓</span>
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
      </div>
    </div>
  );
}

