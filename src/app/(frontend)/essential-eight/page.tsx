import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import EssentialEightAssessment from "@/components/EssentialEightAssessment";
import JsonLd from "@/components/JsonLd";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Essential Eight self-assessment",
  description:
    "Rate your business against the ACSC Essential Eight in 2 minutes. Get an instant maturity score, your weakest controls, and a plain-English plan to close the gaps.",
};

export default function EssentialEightPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Essential Eight self-assessment",
          applicationCategory: "SecurityApplication",
          operatingSystem: "Web",
          url: `${site.url}/essential-eight`,
          offers: { "@type": "Offer", price: "0", priceCurrency: "AUD" },
          provider: { "@type": "Organization", name: site.name },
        }}
      />
      <PageHeader
        tag="FREE TOOL · 2 MINUTES"
        title={
          <>
            How ready are you for the <span className="text-indigo">Essential Eight</span>?
          </>
        }
        subtitle="Rate your business across the ACSC's eight mitigation strategies and get an instant maturity score, your weakest controls, and a prioritised plan — the same framework insurers and auditors now expect."
      />
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-24 pt-8 sm:px-10">
        <EssentialEightAssessment />
      </section>
    </>
  );
}
