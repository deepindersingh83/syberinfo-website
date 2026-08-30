import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import JsonLd, { faqJsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { getArea, serviceAreas } from "@/lib/areas";
import { getServices } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ area: string }> };

export function generateStaticParams() {
  return serviceAreas.map((a) => ({ area: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { area } = await params;
  const a = getArea(area);
  if (!a) return { title: "Area not found" };
  const title = `Managed IT ${a.city} — IT Support, Cloud & Cybersecurity`;
  const description = `Managed IT services, cloud and cybersecurity for ${a.city} businesses. ${a.blurb}`;
  return {
    title,
    description,
    alternates: { canonical: `${site.url}/managed-it/${a.slug}` },
    openGraph: { title: `${title} · SyberInfo`, description },
  };
}

export default async function AreaPage({ params }: Params) {
  const { area } = await params;
  const a = getArea(area);
  if (!a) notFound();
  const services = await getServices();

  const faqs = [
    {
      question: `Do you provide on-site IT support in ${a.city}?`,
      answer: `Yes. We support ${a.city} businesses both remotely and on-site across ${a.region}, including ${a.landmarks
        .slice(0, 3)
        .join(", ")}. Most issues are resolved remotely within our SLA; we attend in person when hardware or network work requires it.`,
    },
    {
      question: `What size businesses in ${a.city} do you work with?`,
      answer: `Typically 10–200 staff — professional services, health, manufacturing and not-for-profits. We scale support up or down as your ${a.city} team grows.`,
    },
    {
      question: `Can you improve our Essential Eight security posture?`,
      answer: `Absolutely. We run an Essential Eight assessment, give you a maturity score, and deliver a prioritised uplift plan — a common starting point for ${a.city} organisations tightening cyber resilience.`,
    },
    {
      question: `How fast can you onboard our ${a.city} business?`,
      answer: `A standard onboarding takes 1–2 weeks: discovery, documentation, monitoring rollout and a security baseline. Urgent transitions can be fast-tracked.`,
    },
  ];

  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    name: `SyberInfo — Managed IT ${a.city}`,
    url: `${site.url}/managed-it/${a.slug}`,
    description: `Managed IT, cloud and cybersecurity for ${a.city}, ${a.state}.`,
    areaServed: {
      "@type": "City",
      name: a.city,
      ...(a.postcode ? { postalCode: a.postcode } : {}),
    },
    address: { "@type": "PostalAddress", addressLocality: a.city, addressRegion: a.state, addressCountry: "AU" },
    ...(a.geo ? { geo: { "@type": "GeoCoordinates", latitude: a.geo.lat, longitude: a.geo.lng } } : {}),
    telephone: site.phoneIntl,
    email: site.email,
    priceRange: site.local.priceRange,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
  };

  return (
    <div className="relative z-[1]">
      <JsonLd data={localBusinessLd} />
      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: site.url },
          { name: "Service areas", url: `${site.url}/managed-it` },
          { name: a.city, url: `${site.url}/managed-it/${a.slug}` },
        ])}
      />

      <PageHeader
        tag={`${a.city.toUpperCase()}, ${a.state}`}
        title={
          <>
            Managed IT in <span className="text-indigo">{a.city}</span>.
          </>
        }
        subtitle={a.blurb}
      />

      <section className="mx-auto max-w-[1240px] px-5 py-8 sm:px-10">
        <p className="max-w-[70ch] text-[16px] leading-relaxed text-muted-2">
          SyberInfo delivers proactive managed IT, cloud and cybersecurity to businesses across {a.region} —
          from {a.landmarks.slice(0, -1).join(", ")} to {a.landmarks[a.landmarks.length - 1]}. You get a real
          engineering team monitoring your systems 24/7, an Australian helpdesk, and a security-first approach
          built around the Essential Eight.
        </p>

        <h2 className="mb-6 mt-12 font-display text-[clamp(22px,3vw,30px)] font-bold tracking-[-.02em]">
          What we do for {a.city} businesses
        </h2>
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`} className="card group px-6 py-5 transition-colors hover:border-white/20">
              <div className="mb-2 font-mono text-[18px] text-indigo">{s.icon}</div>
              <div className="text-[15.5px] font-semibold">{s.title}</div>
              <div className="mt-1 text-[13.5px] text-muted-3">{s.description}</div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/book" className="rounded-full bg-indigo px-6 py-3 text-[15px] font-semibold text-white">
            Book a free {a.city} IT audit →
          </Link>
          <Link href="/essential-eight" className="rounded-full border border-white/[.16] px-6 py-3 text-[15px] font-semibold">
            Check your Essential Eight score
          </Link>
        </div>

        <h2 className="mb-6 mt-14 font-display text-[clamp(22px,3vw,30px)] font-bold tracking-[-.02em]">
          {a.city} IT support — FAQs
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((f) => (
            <div key={f.question} className="card px-7 py-6">
              <h3 className="font-display text-[16px] font-semibold tracking-[-.01em]">{f.question}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted-2">{f.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/[.06] pt-8">
          <div className="mb-3 text-[13px] font-semibold text-muted-3">Other areas we serve</div>
          <div className="flex flex-wrap gap-2">
            {serviceAreas
              .filter((o) => o.slug !== a.slug)
              .map((o) => (
                <Link
                  key={o.slug}
                  href={`/managed-it/${o.slug}`}
                  className="rounded-full border border-white/[.12] px-4 py-2 text-[13px] text-muted-2 hover:text-foreground"
                >
                  Managed IT {o.city}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
