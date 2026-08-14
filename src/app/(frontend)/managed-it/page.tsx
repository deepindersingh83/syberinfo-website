import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { serviceAreas } from "@/lib/areas";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Managed IT by location — Australia-wide IT support",
  description:
    "SyberInfo delivers managed IT, cloud and cybersecurity across Australia. Find local IT support in your city.",
  alternates: { canonical: `${site.url}/managed-it` },
};

export default function AreasIndex() {
  return (
    <>
      <PageHeader
        tag="SERVICE AREAS"
        title={
          <>
            Managed IT, <span className="text-indigo">Australia-wide</span>.
          </>
        }
        subtitle="Local, on-the-ground IT support and cybersecurity in every major Australian city — backed by one national engineering team."
      />
      <section className="mx-auto max-w-[1240px] px-5 py-8 sm:px-10">
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {serviceAreas.map((a) => (
            <Link key={a.slug} href={`/managed-it/${a.slug}`} className="card px-6 py-6 transition-colors hover:border-white/20">
              <div className="font-mono text-[12px] tracking-[.05em] text-indigo">{a.state}</div>
              <div className="mt-1 font-display text-[20px] font-bold tracking-[-.01em]">Managed IT {a.city}</div>
              <div className="mt-2 text-[13.5px] leading-relaxed text-muted-3">{a.blurb}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
