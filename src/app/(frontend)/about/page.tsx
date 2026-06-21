import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { Aurora, SectionHeading, ButtonLink } from "@/components/ui";
import { getStats } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "SyberInfo is an Australian digital agency helping businesses launch, grow and scale online with web, design, marketing and cloud services.",
};

export const dynamic = "force-dynamic";

const values = [
  {
    icon: "🎯",
    title: "Results first",
    text: "We measure success by your growth — traffic, leads and revenue, not vanity metrics.",
  },
  {
    icon: "🤝",
    title: "True partners",
    text: "Transparent communication, honest advice and a team that genuinely cares about your business.",
  },
  {
    icon: "🚀",
    title: "Built to last",
    text: "Fast, secure, scalable solutions using modern technology that grows with you.",
  },
  {
    icon: "🛡️",
    title: "Always supported",
    text: "Reliable hosting and 24/7 support so you're never left stranded.",
  },
];

export default async function AboutPage() {
  const stats = await getStats();
  return (
    <div className="relative pt-36 pb-12">
      <Aurora />
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading
          eyebrow="About us"
          title={
            <>
              Your one-stop{" "}
              <span className="text-gradient">digital partner</span>
            </>
          }
          subtitle="We bring web development, design, marketing and cloud services together so you can focus on running your business."
        />

        <Reveal>
          <div className="mx-auto mt-12 max-w-3xl space-y-5 text-center leading-relaxed text-muted">
            <p>
              SyberInfo is an Australian digital agency built on a simple idea:
              businesses shouldn&apos;t need a dozen vendors to succeed online.
              From your domain and hosting to your website, branding and
              marketing — we handle it all under one roof.
            </p>
            <p>
              Whether you&apos;re launching your first website or scaling an
              established brand, our team blends creative design, solid
              engineering and data-driven marketing to deliver work that looks
              great and performs even better.
            </p>
          </div>
        </Reveal>

        {/* Stats */}
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <div className="glass rounded-2xl px-4 py-6 text-center">
                <div className="text-3xl font-bold text-gradient">{s.value}</div>
                <div className="mt-1 text-xs text-muted">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Values */}
        <div className="mt-20">
          <SectionHeading title={<>What we stand for</>} />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 70}>
                <div className="h-full rounded-3xl glass p-7">
                  <div className="text-3xl">{v.icon}</div>
                  <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {v.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <ButtonLink href="/contact">Work with us →</ButtonLink>
        </div>
      </div>
    </div>
  );
}
